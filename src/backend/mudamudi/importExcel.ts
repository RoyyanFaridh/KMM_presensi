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
  tempat_lahir: string;
  tanggal_lahir: string;
  umur: number | null;
  no_hp: string;
  pekerjaan: string;
  kelas: string;
  nama_ayah: string;
  nama_ibu: string;
  no_hp_ortu: string;
  alamat: string;
};

export type ImportError = {
  rowNumber: number;
  message: string;
};

export type ImportParseResult = {
  data: ImportRow[];
  errors: ImportError[];
};

const REQUIRED_HEADERS = [
  "DESA",
  "KELOMPOK",
  "NAMA LENGKAP",
  "JENIS KELAMIN",
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

function calculateAge(tanggalLahir: string): number | null {
  const birthDate = new Date(`${tanggalLahir}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : null;
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

function isValidJenisKelamin(value: string): boolean {
  return JENIS_KELAMIN_OPTIONS.includes(value);
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function validateRow(
  rowNumber: number,
  values: {
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
  },
  seenKeys: Set<string>,
): {
  data: ImportRow | null;
  error: ImportError | null;
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

  if (!nama) {
    rowErrors.push("Nama wajib diisi");
  } else if (/\d/.test(nama)) {
    rowErrors.push("Nama tidak boleh mengandung angka");
  }

  if (!isValidDesa(desa)) {
    rowErrors.push("Desa tidak valid");
  }

  if (!isValidKelompok(desa, kelompok)) {
    rowErrors.push("Kelompok tidak sesuai dengan desa");
  }

  if (!isValidJenisKelamin(jenisKelamin)) {
    rowErrors.push("Jenis kelamin tidak valid");
  }

  if (!isValidKelas(kelas)) {
    rowErrors.push("Kelas tidak valid");
  }

  if (!tanggalLahirRaw) {
    rowErrors.push("Tanggal lahir wajib diisi");
  }

  const tanggalLahir = parseDate(tanggalLahirRaw);

  if (tanggalLahirRaw && !tanggalLahir) {
    rowErrors.push("Tanggal lahir harus menggunakan format DD-MM-YYYY");
  }

  if (noHp) {
    const normalizedPhone = noHp.replace(/[\s-]/g, "");

    if (!/^(\+62|62|0)\d{8,15}$/.test(normalizedPhone)) {
      rowErrors.push("Format No HP tidak valid");
    }
  }

  if (noHpOrtu) {
    const normalizedPhone = noHpOrtu.replace(/[\s-]/g, "");

    if (!/^(\+62|62|0)\d{8,15}$/.test(normalizedPhone)) {
      rowErrors.push("Format No HP Ortu tidak valid");
    }
  }

  if (rowErrors.length > 0) {
    return {
      data: null,
      error: {
        rowNumber,
        message: rowErrors.join("; "),
      },
    };
  }

  const normalizedNama = normalizeName(nama);

  const duplicateKey = `${normalizedNama}|${kelas.toLowerCase()}|${kelompok.toLowerCase()}`;

  if (seenKeys.has(duplicateKey)) {
    return {
      data: null,
      error: {
        rowNumber,
        message:
          "Data duplikat dengan baris lain dalam file berdasarkan nama, kelas, dan kelompok",
      },
    };
  }

  seenKeys.add(duplicateKey);

  return {
    data: {
      desa,
      kelompok,
      nama,
      jenis_kelamin: jenisKelamin,
      tempat_lahir: tempatLahir,
      tanggal_lahir: tanggalLahir!,
      umur: calculateAge(tanggalLahir!),
      no_hp: noHp,
      pekerjaan,
      kelas,
      nama_ayah: namaAyah,
      nama_ibu: namaIbu,
      no_hp_ortu: noHpOrtu,
      alamat,
    },
    error: null,
  };
}

/* =========================================================
   XLSX
========================================================= */

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
      `Kolom Excel tidak lengkap. Kolom yang belum ada: ${missingHeaders.join(
        ", ",
      )}`,
    );
  }

  const data: ImportRow[] = [];
  const errors: ImportError[] = [];
  const seenKeys = new Set<string>();

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    const getValue = (header: string): string => {
      const column = headerMap.get(header);

      if (!column) {
        return "";
      }

      return getCellValue(row.getCell(column));
    };

    const values = {
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

    const allEmpty = Object.values(values).every((value) => !value);

    if (allEmpty) {
      continue;
    }

    const result = validateRow(rowNumber, values, seenKeys);

    if (result.error) {
      errors.push(result.error);
      continue;
    }

    if (result.data) {
      data.push(result.data);
    }
  }

  return {
    data,
    errors,
  };
}

/* =========================================================
   CSV
========================================================= */

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
      `Kolom CSV tidak lengkap. Kolom yang belum ada: ${missingHeaders.join(
        ", ",
      )}`,
    );
  }

  const data: ImportRow[] = [];
  const errors: ImportError[] = [];
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

    const values = {
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

    const allEmpty = Object.values(values).every((value) => !value);

    if (allEmpty) {
      continue;
    }

    const rowNumber = index + 1;

    const result = validateRow(rowNumber, values, seenKeys);

    if (result.error) {
      errors.push(result.error);
      continue;
    }

    if (result.data) {
      data.push(result.data);
    }
  }

  return {
    data,
    errors,
  };
}

/* =========================================================
   MAIN
========================================================= */

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
