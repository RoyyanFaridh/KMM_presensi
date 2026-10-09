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

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toUpperCase();
}

function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCellValue(cell: ExcelJS.Cell): string {
  const value = cell.value;

  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return formatDateToISO(value);
  }

  if (typeof value === "object") {
    if ("result" in value) {
      const result = value.result;

      if (result instanceof Date) {
        return formatDateToISO(result);
      }

      return String(result ?? "").trim();
    }

    if ("text" in value) {
      return String(value.text ?? "").trim();
    }

    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText
        .map((item) => String(item.text ?? ""))
        .join("")
        .trim();
    }

    return "";
  }

  return String(value).trim();
}

function parseDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateToISO(value);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    // Excel menyimpan tanggal sebagai nomor serial.
    // Sistem tanggal Excel menggunakan basis 1899-12-30.
    if (value < 1 || value > 2958465) {
      return null;
    }

    const excelEpoch = Date.UTC(1899, 11, 30);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const date = new Date(excelEpoch + Math.floor(value) * millisecondsPerDay);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const raw = String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim();

  if (!raw) {
    return null;
  }

  // DD-MM-YYYY atau DD/MM/YYYY.
  const dayFirst = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(raw);

  if (dayFirst) {
    const day = Number(dayFirst[1]);
    const month = Number(dayFirst[2]);
    const year = Number(dayFirst[3]);

    return buildValidISODate(year, month, day);
  }

  // YYYY-MM-DD.
  const yearFirst = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(raw);

  if (yearFirst) {
    const year = Number(yearFirst[1]);
    const month = Number(yearFirst[2]);
    const day = Number(yearFirst[3]);

    return buildValidISODate(year, month, day);
  }

  return null;
}

function buildValidISODate(
  year: number,
  month: number,
  day: number,
): string | null {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

function isValidDateNotFuture(tanggalLahir: string): boolean {
  const [year, month, day] = tanggalLahir.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date <= today;
}

function calculateAge(tanggalLahir: string | null): number | null {
  if (!tanggalLahir) {
    return null;
  }

  const [year, month, day] = tanggalLahir.split("-").map(Number);

  const birthDate = new Date(year, month - 1, day);

  if (
    Number.isNaN(birthDate.getTime()) ||
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return null;
  }

  const today = new Date();

  let age = today.getFullYear() - year;

  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age--;
  }

  return age >= 0 ? age : null;
}

function calculateKelas(umur: number | null): string | null {
  if (umur === null) {
    return null;
  }

  if (umur >= 5 && umur <= 6) {
    return "PAUD";
  }

  if (umur >= 7 && umur <= 12) {
    return "Caberawit";
  }

  if (umur >= 13 && umur <= 15) {
    return "Pra Remaja";
  }

  if (umur >= 16 && umur <= 18) {
    return "Remaja";
  }

  if (umur >= 19) {
    return "Usia Nikah";
  }

  return null;
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

function normalizeJenisKelamin(value: string): string {
  const normalized = value.trim().toLowerCase();

  const matchedOption = JENIS_KELAMIN_OPTIONS.find(
    (option) => option.trim().toLowerCase() === normalized,
  );

  return matchedOption ?? "";
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}

function isValidPhone(value: string): boolean {
  return /^(\+62|62|0)\d{8,15}$/.test(normalizePhone(value));
}

function emptyToNull(value: string): string | null {
  return value.trim() || null;
}

type ValidateValues = {
  desa: string;
  kelompok: string;
  nama: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahirRaw: string;
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

  // Kolom wajib: nama lengkap.
  if (!nama) {
    rowErrors.push("Nama Lengkap wajib diisi");
  } else if (/\d/.test(nama)) {
    rowErrors.push("Nama Lengkap tidak boleh mengandung angka");
  }

  // Kolom wajib: desa.
  if (!desa) {
    rowErrors.push("Desa wajib diisi");
  } else if (!isValidDesa(desa)) {
    rowErrors.push("Desa tidak valid");
  }

  // Kolom wajib: kelompok.
  if (!kelompok) {
    rowErrors.push("Kelompok wajib diisi");
  } else if (!isValidKelompok(desa, kelompok)) {
    rowErrors.push("Kelompok tidak sesuai dengan desa");
  }

  // Kolom wajib: jenis kelamin.
  const normalizedJenisKelamin = normalizeJenisKelamin(jenisKelamin);

  if (!jenisKelamin) {
    rowErrors.push("Jenis Kelamin wajib diisi");
  } else if (!normalizedJenisKelamin) {
    rowErrors.push("Jenis Kelamin tidak valid");
  }

  // Kolom wajib tidak valid: baris tidak diimpor.
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

  // Tempat lahir.
  if (headers.tempatLahir && !tempatLahir) {
    rowWarnings.push("Tempat Lahir kosong");
  }

  // Tanggal lahir. Tanggal yang kosong atau tidak valid
  // menjadi peringatan, bukan error yang menolak baris.
  const tanggalLahir = parseDate(tanggalLahirRaw);

  let tanggalLahirFinal: string | null = null;

  if (!tanggalLahirRaw) {
    rowWarnings.push("Tanggal Lahir kosong; umur tidak dapat dihitung");
  } else if (!tanggalLahir) {
    rowWarnings.push("Tanggal Lahir tidak valid; umur tidak dapat dihitung");
  } else if (!isValidDateNotFuture(tanggalLahir)) {
    rowWarnings.push(
      "Tanggal Lahir melebihi tanggal hari ini; umur tidak dapat dihitung",
    );
  } else {
    tanggalLahirFinal = tanggalLahir;
  }

  // Umur dihitung dari tanggal lahir yang valid.
  // Kolom UMUR pada Excel tidak dijadikan sumber umur.
  const umur = calculateAge(tanggalLahirFinal);

  // Nomor HP.
  if (headers.noHp) {
    if (!noHp) {
      rowWarnings.push("No HP kosong");
    } else if (!isValidPhone(noHp)) {
      rowWarnings.push("Format No HP tidak valid");
    }
  }

  const noHpFinal = noHp && isValidPhone(noHp) ? normalizePhone(noHp) : null;

  // Pekerjaan.
  if (headers.pekerjaan && !pekerjaan) {
    rowWarnings.push("Pekerjaan kosong");
  }

  // Kelas: pertahankan kelas manual yang valid.
  // Jika kosong, gunakan hasil perhitungan berdasarkan umur.
  let kelasFinal: string | null = null;

  if (kelas.trim()) {
    if (isValidKelas(kelas.trim())) {
      kelasFinal = kelas.trim();
    } else {
      rowWarnings.push("Kelas yang diisi tidak valid; kelas tidak disimpan");
    }
  } else {
    kelasFinal = calculateKelas(umur);

    if (kelasFinal === null) {
      rowWarnings.push(
        "Kelas tidak dapat ditentukan otomatis; isi kelas secara manual jika diperlukan",
      );
    }
  }

  // Nama orang tua.
  if (headers.namaAyah && !namaAyah) {
    rowWarnings.push("Nama Ayah kosong");
  }

  if (headers.namaIbu && !namaIbu) {
    rowWarnings.push("Nama Ibu kosong");
  }

  // Nomor HP orang tua.
  if (headers.noHpOrtu) {
    if (!noHpOrtu) {
      rowWarnings.push("No HP Orangtua kosong");
    } else if (!isValidPhone(noHpOrtu)) {
      rowWarnings.push("Format No HP Orangtua tidak valid");
    }
  }

  const noHpOrtuFinal =
    noHpOrtu && isValidPhone(noHpOrtu) ? normalizePhone(noHpOrtu) : null;

  // Alamat.
  if (headers.alamat && !alamat) {
    rowWarnings.push("Alamat kosong");
  }

  // Cegah duplikat dalam file.
  const duplicateKey = [
    normalizeName(nama),
    desa.trim().toLowerCase(),
    kelasFinal?.toLowerCase() ?? "",
    kelompok.trim().toLowerCase(),
  ].join("|");

  if (seenKeys.has(duplicateKey)) {
    return {
      data: null,
      error: {
        rowNumber,
        message:
          "Data duplikat dengan baris lain dalam file berdasarkan nama, desa, kelas, dan kelompok",
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
      desa: desa.trim(),
      kelompok: kelompok.trim(),
      nama: nama.trim(),
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

function getExcelDateValue(cell: ExcelJS.Cell): string {
  const value = cell.value;

  if (value instanceof Date) {
    return formatDateToISO(value);
  }

  if (typeof value === "number" && cell.numFmt) {
    // Jika sel memiliki format tanggal, konversikan serial Excel.
    const dateFormat = /[dmy]/i.test(cell.numFmt);

    if (dateFormat) {
      return parseDate(value) ?? String(value);
    }
  }

  return getCellValue(cell);
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

      const cell = row.getCell(column);

      if (header === "TANGGAL LAHIR") {
        return getExcelDateValue(cell);
      }

      return getCellValue(cell);
    };

    const values: ValidateValues = {
      desa: getValue("DESA"),
      kelompok: getValue("KELOMPOK"),
      nama: getValue("NAMA LENGKAP"),
      jenisKelamin: getValue("JENIS KELAMIN"),
      tempatLahir: getValue("TEMPAT"),
      tanggalLahirRaw: getValue("TANGGAL LAHIR"),
      noHp: getValue("NO HP"),
      pekerjaan: getValue("PEKERJAAN"),
      kelas: getValue("KELAS"),
      namaAyah: getValue("NAMA AYAH"),
      namaIbu: getValue("NAMA IBU"),
      noHpOrtu: getValue("NO HP ORANGTUA"),
      alamat: getValue("ALAMAT"),
    };

    if (Object.values(values).every((value) => !value.trim())) {
      continue;
    }

    const result = validateRow(
      rowNumber,
      values,
      {
        tempatLahir: headerMap.has("TEMPAT"),
        tanggalLahir: headerMap.has("TANGGAL LAHIR"),
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
    }

    if (result.data) {
      data.push(result.data);
    }

    warnings.push(...result.warnings);
  }

  return { data, errors, warnings };
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

  const headerMap = new Map<string, number>();

  rows[0].forEach((value, index) => {
    const header = normalizeHeader(value);

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
      noHp: getValue("NO HP"),
      pekerjaan: getValue("PEKERJAAN"),
      kelas: getValue("KELAS"),
      namaAyah: getValue("NAMA AYAH"),
      namaIbu: getValue("NAMA IBU"),
      noHpOrtu: getValue("NO HP ORANGTUA"),
      alamat: getValue("ALAMAT"),
    };

    if (Object.values(values).every((value) => !value.trim())) {
      continue;
    }

    const rowNumber = index + 1;

    const result = validateRow(
      rowNumber,
      values,
      {
        tempatLahir: headerMap.has("TEMPAT"),
        tanggalLahir: headerMap.has("TANGGAL LAHIR"),
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
    }

    if (result.data) {
      data.push(result.data);
    }

    warnings.push(...result.warnings);
  }

  return { data, errors, warnings };
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
