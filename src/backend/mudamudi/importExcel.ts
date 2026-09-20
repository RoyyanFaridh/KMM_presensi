import ExcelJS from "exceljs";
import {
  DESA_OPTIONS,
  KELOMPOK_BY_DESA,
  JENIS_KELAMIN_OPTIONS,
  KELAS_OPTIONS,
} from "./constants";

export type ImportRow = {
  desa: string;
  kelompok: string;
  nama: string;
  jenis_kelamin: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  umur: number | null;
  no_hp: string | null;
  pekerjaan: string | null;
  kelas: string | null;
  nama_ayah: string | null;
  nama_ibu: string | null;
  no_hp_ortu: string | null;
  alamat: string | null;
};

export type ImportError = {
  rowNumber: number;
  message: string;
};

export type ImportWarning = {
  rowNumber: number;
  message: string;
};

export type ImportParseResult = {
  data: ImportRow[];
  errors: ImportError[];
  warnings: ImportWarning[];
};

const REQUIRED_HEADERS = ["DESA", "KELOMPOK", "NAMA LENGKAP", "JENIS KELAMIN"];

const OPTIONAL_HEADERS = [
  "TEMPAT",
  "TANGGAL LAHIR",
  "UMUR",
  "NO HP",
  "PEKERJAAN",
  "KELAS",
  "NAMA AYAH",
  "NAMA IBU",
  "NO HP ORANGTUA",
  "ALAMAT",
];

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toUpperCase();
}

function getCellValue(cell: ExcelJS.Cell): string {
  const value = cell.value;

  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object" && "result" in value) {
    return String(value.result ?? "").trim();
  }

  if (value instanceof Date) {
    return formatDateToISO(value);
  }

  return String(value).trim();
}

function formatDateToISO(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

function parseDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateToISO(value);
  }

  const raw = String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim();

  if (!raw) {
    return null;
  }

  const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(raw);

  if (ddmmyyyy) {
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]);
    const year = Number(ddmmyyyy[3]);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0",
      )}`;
    }

    return null;
  }

  const ddmmyyyySlash = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);

  if (ddmmyyyySlash) {
    const day = Number(ddmmyyyySlash[1]);
    const month = Number(ddmmyyyySlash[2]);
    const year = Number(ddmmyyyySlash[3]);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0",
      )}`;
    }

    return null;
  }

  const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);

  if (yyyymmdd) {
    const year = Number(yyyymmdd[1]);
    const month = Number(yyyymmdd[2]);
    const day = Number(yyyymmdd[3]);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return raw;
    }

    return null;
  }

  return null;
}

function isValidDateNotFuture(tanggalLahir: string): boolean {
  const date = new Date(`${tanggalLahir}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();

  today.setHours(23, 59, 59, 999);

  return date <= today;
}

function isValidDesa(desa: string): boolean {
  return DESA_OPTIONS.includes(desa as (typeof DESA_OPTIONS)[number]);
}

function isValidKelompok(desa: string, kelompok: string): boolean {
  if (!isValidDesa(desa)) {
    return false;
  }

  const options = KELOMPOK_BY_DESA[desa as keyof typeof KELOMPOK_BY_DESA];

  return options.includes(kelompok as never);
}

function isValidKelas(kelas: string): boolean {
  return KELAS_OPTIONS.includes(kelas);
}

/**
 * Menormalkan jenis kelamin agar perbedaan huruf kapital
 * tidak menyebabkan data dianggap tidak valid.
 *
 * Contoh:
 * Laki-laki  -> Laki-laki
 * Laki-Laki  -> Laki-laki
 * LAKI-LAKI  -> Laki-laki
 * laki-laki  -> Laki-laki
 * Perempuan  -> Perempuan
 * PEREMPUAN  -> Perempuan
 */
function normalizeJenisKelamin(value: string): string {
  const normalized = value.trim().toLowerCase();

  const matchedOption = JENIS_KELAMIN_OPTIONS.find(
    (option) => option.trim().toLowerCase() === normalized,
  );

  return matchedOption ?? "";
}

function isValidJenisKelamin(value: string): boolean {
  return Boolean(normalizeJenisKelamin(value));
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function parseUmur(value: string): number | null {
  const raw = value.trim();

  if (!raw) {
    return null;
  }

  if (!/^\d+$/.test(raw)) {
    return null;
  }

  const umur = Number(raw);

  if (!Number.isInteger(umur) || umur < 0 || umur > 120) {
    return null;
  }

  return umur;
}

function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}

function isValidPhone(value: string): boolean {
  const normalized = normalizePhone(value);

  return /^(\+62|62|0)\d{8,15}$/.test(normalized);
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();

  return trimmed || null;
}

type ValidateValues = {
  desa: string;
  kelompok: string;
  nama: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahirRaw: string;
  umurRaw: string;
  noHp: string;
  pekerjaan: string;
  kelas: string;
  namaAyah: string;
  namaIbu: string;
  noHpOrtu: string;
  alamat: string;
};

type HeaderPresence = {
  tempatLahir: boolean;
  tanggalLahir: boolean;
  umur: boolean;
  noHp: boolean;
  pekerjaan: boolean;
  kelas: boolean;
  namaAyah: boolean;
  namaIbu: boolean;
  noHpOrtu: boolean;
  alamat: boolean;
};

function validateRow(
  rowNumber: number,
  values: ValidateValues,
  headers: HeaderPresence,
  seenKeys: Set<string>,
): {
  data: ImportRow | null;
  error: ImportError | null;
  warnings: ImportWarning[];
} {
  const {
    desa,
    kelompok,
    nama,
    jenisKelamin,
    tempatLahir,
    tanggalLahirRaw,
    umurRaw,
    noHp,
    pekerjaan,
    kelas,
    namaAyah,
    namaIbu,
    noHpOrtu,
    alamat,
  } = values;

  const rowErrors: string[] = [];
  const rowWarnings: string[] = [];

  /*
   * REQUIRED:
   * NAMA LENGKAP
   */
  if (!nama) {
    rowErrors.push("Nama Lengkap wajib diisi");
  } else if (/\d/.test(nama)) {
    rowErrors.push("Nama Lengkap tidak boleh mengandung angka");
  }

  /*
   * REQUIRED:
   * DESA
   */
  if (!desa) {
    rowErrors.push("Desa wajib diisi");
  } else if (!isValidDesa(desa)) {
    rowErrors.push("Desa tidak valid");
  }

  /*
   * REQUIRED:
   * KELOMPOK
   */
  if (!kelompok) {
    rowErrors.push("Kelompok wajib diisi");
  } else if (!isValidKelompok(desa, kelompok)) {
    rowErrors.push("Kelompok tidak sesuai dengan desa");
  }

  /*
   * REQUIRED:
   * JENIS KELAMIN
   */
  const normalizedJenisKelamin = normalizeJenisKelamin(jenisKelamin);

  if (!jenisKelamin) {
    rowErrors.push("Jenis Kelamin wajib diisi");
  } else if (!isValidJenisKelamin(jenisKelamin)) {
    rowErrors.push("Jenis Kelamin tidak valid");
  }

  /*
   * Jika salah satu data wajib tidak valid,
   * baris tidak dimasukkan ke preview/import.
   */
  if (rowErrors.length > 0) {
    return {
      data: null,
      error: {
        rowNumber,
        message: rowErrors.join("; "),
      },
      warnings: [],
    };
  }

  /*
   * TEMPAT LAHIR
   */
  if (headers.tempatLahir && !tempatLahir) {
    rowWarnings.push("Tempat Lahir kosong");
  }

  /*
   * TANGGAL LAHIR
   */
  const tanggalLahir = parseDate(tanggalLahirRaw);

  if (headers.tanggalLahir) {
    if (!tanggalLahirRaw) {
      rowWarnings.push("Tanggal Lahir kosong");
    } else if (!tanggalLahir) {
      rowWarnings.push(
        "Tanggal Lahir tidak sesuai format DD-MM-YYYY atau YYYY-MM-DD",
      );
    } else if (!isValidDateNotFuture(tanggalLahir)) {
      rowWarnings.push(
        "Tanggal Lahir tidak valid atau melebihi tanggal hari ini",
      );
    }
  }

  const tanggalLahirFinal =
    tanggalLahir && isValidDateNotFuture(tanggalLahir) ? tanggalLahir : null;

  /*
   * UMUR
   */
  const umur = parseUmur(umurRaw);

  if (headers.umur) {
    if (!umurRaw) {
      rowWarnings.push("Umur kosong");
    } else if (umur === null) {
      rowWarnings.push("Umur harus berupa angka");
    }
  }

  /*
   * NO HP
   */
  if (headers.noHp) {
    if (!noHp) {
      rowWarnings.push("No HP kosong");
    } else if (!isValidPhone(noHp)) {
      rowWarnings.push("Format No HP tidak valid");
    }
  }

  const noHpFinal = noHp && isValidPhone(noHp) ? normalizePhone(noHp) : null;

  /*
   * PEKERJAAN
   */
  if (headers.pekerjaan && !pekerjaan) {
    rowWarnings.push("Pekerjaan kosong");
  }

  /*
   * KELAS
   */
  if (headers.kelas) {
    if (!kelas) {
      rowWarnings.push("Kelas kosong");
    } else if (!isValidKelas(kelas)) {
      rowWarnings.push("Kelas tidak valid");
    }
  }

  const kelasFinal = kelas && isValidKelas(kelas) ? kelas : null;

  /*
   * NAMA AYAH
   */
  if (headers.namaAyah && !namaAyah) {
    rowWarnings.push("Nama Ayah kosong");
  }

  /*
   * NAMA IBU
   */
  if (headers.namaIbu && !namaIbu) {
    rowWarnings.push("Nama Ibu kosong");
  }

  /*
   * NO HP ORANGTUA
   */
  if (headers.noHpOrtu) {
    if (!noHpOrtu) {
      rowWarnings.push("No HP Orangtua kosong");
    } else if (!isValidPhone(noHpOrtu)) {
      rowWarnings.push("Format No HP Orangtua tidak valid");
    }
  }

  const noHpOrtuFinal =
    noHpOrtu && isValidPhone(noHpOrtu) ? normalizePhone(noHpOrtu) : null;

  /*
   * ALAMAT
   */
  if (headers.alamat && !alamat) {
    rowWarnings.push("Alamat kosong");
  }

  /*
   * DUPLIKAT DALAM FILE
   */
  const normalizedNama = normalizeName(nama);

  const duplicateKey = [
    normalizedNama,
    kelasFinal?.toLowerCase() ?? "",
    kelompok.toLowerCase(),
  ].join("|");

  if (seenKeys.has(duplicateKey)) {
    return {
      data: null,
      error: {
        rowNumber,
        message:
          "Data duplikat dengan baris lain dalam file berdasarkan nama, kelas, dan kelompok",
      },
      warnings: rowWarnings.map((message) => ({
        rowNumber,
        message,
      })),
    };
  }

  seenKeys.add(duplicateKey);

  return {
    data: {
      desa,
      kelompok,
      nama,
      jenis_kelamin: normalizedJenisKelamin,
      tempat_lahir: emptyToNull(tempatLahir),
      tanggal_lahir: tanggalLahirFinal,
      umur,
      no_hp: noHpFinal,
      pekerjaan: emptyToNull(pekerjaan),
      kelas: kelasFinal,
      nama_ayah: emptyToNull(namaAyah),
      nama_ibu: emptyToNull(namaIbu),
      no_hp_ortu: noHpOrtuFinal,
      alamat: emptyToNull(alamat),
    },
    error: null,
    warnings: rowWarnings.map((message) => ({
      rowNumber,
      message,
    })),
  };
}

async function parseXlsx(file: File): Promise<ImportParseResult> {
  const buffer = await file.arrayBuffer();

  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("Worksheet Excel tidak ditemukan.");
  }

  const headerMap = new Map<string, number>();

  worksheet.getRow(1).eachCell((cell, columnNumber) => {
    const header = normalizeHeader(cell.value);

    if (header) {
      headerMap.set(header, columnNumber);
    }
  });

  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headerMap.has(header),
  );

  if (missingHeaders.length > 0) {
    throw new Error(
      `Kolom Excel tidak lengkap. Kolom yang wajib ada: ${missingHeaders.join(
        ", ",
      )}`,
    );
  }

  const data: ImportRow[] = [];
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];
  const seenKeys = new Set<string>();

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    const getValue = (header: string): string => {
      const column = headerMap.get(header);

      if (column === undefined) {
        return "";
      }

      return getCellValue(row.getCell(column));
    };

    const values: ValidateValues = {
      desa: getValue("DESA"),
      kelompok: getValue("KELOMPOK"),
      nama: getValue("NAMA LENGKAP"),
      jenisKelamin: getValue("JENIS KELAMIN"),
      tempatLahir: getValue("TEMPAT"),
      tanggalLahirRaw: getValue("TANGGAL LAHIR"),
      umurRaw: getValue("UMUR"),
      noHp: getValue("NO HP"),
      pekerjaan: getValue("PEKERJAAN"),
      kelas: getValue("KELAS"),
      namaAyah: getValue("NAMA AYAH"),
      namaIbu: getValue("NAMA IBU"),
      noHpOrtu: getValue("NO HP ORANGTUA"),
      alamat: getValue("ALAMAT"),
    };

    const allEmpty = Object.values(values).every((value) => !value);

    if (allEmpty) {
      continue;
    }

    const result = validateRow(
      rowNumber,
      values,
      {
        tempatLahir: headerMap.has("TEMPAT"),
        tanggalLahir: headerMap.has("TANGGAL LAHIR"),
        umur: headerMap.has("UMUR"),
        noHp: headerMap.has("NO HP"),
        pekerjaan: headerMap.has("PEKERJAAN"),
        kelas: headerMap.has("KELAS"),
        namaAyah: headerMap.has("NAMA AYAH"),
        namaIbu: headerMap.has("NAMA IBU"),
        noHpOrtu: headerMap.has("NO HP ORANGTUA"),
        alamat: headerMap.has("ALAMAT"),
      },
      seenKeys,
    );

    if (result.error) {
      errors.push(result.error);
      continue;
    }

    if (result.data) {
      data.push(result.data);
    }

    warnings.push(...result.warnings);
  }

  return {
    data,
    errors,
    warnings,
  };
}

function detectDelimiter(line: string): "," | ";" {
  const commaCount = (line.match(/,/g) ?? []).length;
  const semicolonCount = (line.match(/;/g) ?? []).length;

  return semicolonCount > commaCount ? ";" : ",";
}

function parseCsvLine(line: string, delimiter: "," | ";"): string[] {
  const result: string[] = [];

  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];

    if (char === '"') {
      if (insideQuotes && line[index + 1] === '"') {
        current += '"';
        index++;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (char === delimiter && !insideQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());

  return result;
}

function parseCsvContent(content: string): string[][] {
  const normalized = content
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const lines = normalized.split("\n");

  if (lines.length === 0) {
    return [];
  }

  const firstLine = lines.find((line) => line.trim());

  if (!firstLine) {
    return [];
  }

  const delimiter = detectDelimiter(firstLine);

  const rows: string[][] = [];

  let currentLine = "";
  let insideQuotes = false;

  for (const line of lines) {
    currentLine = currentLine ? `${currentLine}\n${line}` : line;

    let quoteCount = 0;

    for (let index = 0; index < line.length; index++) {
      if (line[index] === '"') {
        if (line[index + 1] === '"') {
          index++;
        } else {
          quoteCount++;
        }
      }
    }

    if (quoteCount % 2 !== 0) {
      insideQuotes = !insideQuotes;
    }

    if (!insideQuotes) {
      if (currentLine.trim()) {
        rows.push(parseCsvLine(currentLine, delimiter));
      }

      currentLine = "";
    }
  }

  if (currentLine.trim()) {
    rows.push(parseCsvLine(currentLine, delimiter));
  }

  return rows;
}

async function parseCsv(file: File): Promise<ImportParseResult> {
  const content = await file.text();

  const rows = parseCsvContent(content);

  if (rows.length === 0) {
    throw new Error("File CSV kosong.");
  }

  const headers = rows[0].map(normalizeHeader);

  const headerMap = new Map<string, number>();

  headers.forEach((header, index) => {
    if (header) {
      headerMap.set(header, index);
    }
  });

  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headerMap.has(header),
  );

  if (missingHeaders.length > 0) {
    throw new Error(
      `Kolom CSV tidak lengkap. Kolom yang wajib ada: ${missingHeaders.join(
        ", ",
      )}`,
    );
  }

  const data: ImportRow[] = [];
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];
  const seenKeys = new Set<string>();

  for (let index = 1; index < rows.length; index++) {
    const row = rows[index];

    const getValue = (header: string): string => {
      const column = headerMap.get(header);

      if (column === undefined) {
        return "";
      }

      return String(row[column] ?? "").trim();
    };

    const values: ValidateValues = {
      desa: getValue("DESA"),
      kelompok: getValue("KELOMPOK"),
      nama: getValue("NAMA LENGKAP"),
      jenisKelamin: getValue("JENIS KELAMIN"),
      tempatLahir: getValue("TEMPAT"),
      tanggalLahirRaw: getValue("TANGGAL LAHIR"),
      umurRaw: getValue("UMUR"),
      noHp: getValue("NO HP"),
      pekerjaan: getValue("PEKERJAAN"),
      kelas: getValue("KELAS"),
      namaAyah: getValue("NAMA AYAH"),
      namaIbu: getValue("NAMA IBU"),
      noHpOrtu: getValue("NO HP ORANGTUA"),
      alamat: getValue("ALAMAT"),
    };

    const allEmpty = Object.values(values).every((value) => !value);

    if (allEmpty) {
      continue;
    }

    const rowNumber = index + 1;

    const result = validateRow(
      rowNumber,
      values,
      {
        tempatLahir: headerMap.has("TEMPAT"),
        tanggalLahir: headerMap.has("TANGGAL LAHIR"),
        umur: headerMap.has("UMUR"),
        noHp: headerMap.has("NO HP"),
        pekerjaan: headerMap.has("PEKERJAAN"),
        kelas: headerMap.has("KELAS"),
        namaAyah: headerMap.has("NAMA AYAH"),
        namaIbu: headerMap.has("NAMA IBU"),
        noHpOrtu: headerMap.has("NO HP ORANGTUA"),
        alamat: headerMap.has("ALAMAT"),
      },
      seenKeys,
    );

    if (result.error) {
      errors.push(result.error);
      continue;
    }

    if (result.data) {
      data.push(result.data);
    }

    warnings.push(...result.warnings);
  }

  return {
    data,
    errors,
    warnings,
  };
}

export async function parseImportExcel(file: File): Promise<ImportParseResult> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx")) {
    return parseXlsx(file);
  }

  if (fileName.endsWith(".csv")) {
    return parseCsv(file);
  }

  throw new Error("Format file tidak didukung. Gunakan .xlsx atau .csv.");
}
