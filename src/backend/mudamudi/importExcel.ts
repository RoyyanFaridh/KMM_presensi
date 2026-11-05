
import ExcelJS from "exceljs";

import {
  DESA_OPTIONS,
  KELOMPOK_BY_DESA,
  JENIS_KELAMIN_OPTIONS,
  JENJANG_OPTIONS,
} from "./constants";

export type ImportField =
  | "desa"
  | "kelompok"
  | "nama"
  | "jenis_kelamin"
  | "tempat_lahir"
  | "tahun_lahir"
  | "no_hp"
  | "pekerjaan"
  | "jenjang"
  | "alamat";

export type ImportRow = {
  desa: string;
  kelompok: string;
  nama: string;
  jenis_kelamin: string;
  tempat_lahir: string | null;
  tahun_lahir: number | null;
  no_hp: string | null;
  pekerjaan: string | null;
  jenjang: string;
  kelas: string;
  alamat: string | null;
  presentFields: ImportField[];
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

const REQUIRED_HEADERS = [
  "NO",
  "DESA",
  "KELOMPOK",
  "NAMA LENGKAP",
  "JENIS KELAMIN",
  "TEMPAT",
  "TAHUN LAHIR",
  "NO HP",
  "PEKERJAAN",
  "JENJANG",
  "KELAS",
  "ALAMAT",
] as const;

type HeaderName = (typeof REQUIRED_HEADERS)[number];

const HEADER_TO_FIELD: Partial<Record<HeaderName, ImportField>> = {
  DESA: "desa",
  KELOMPOK: "kelompok",
  "NAMA LENGKAP": "nama",
  "JENIS KELAMIN": "jenis_kelamin",
  TEMPAT: "tempat_lahir",
  "TAHUN LAHIR": "tahun_lahir",
  "NO HP": "no_hp",
  PEKERJAAN: "pekerjaan",
  JENJANG: "jenjang",
  ALAMAT: "alamat",
};

type HeaderMap = Map<string, number>;

type ValidateValues = {
  desa: string;
  kelompok: string;
  nama: string;
  jenisKelamin: string;
  tempatLahir: string;
  tahunLahir: string;
  noHp: string;
  pekerjaan: string;
  jenjang: string;
  alamat: string;
};

const CURRENT_YEAR = new Date().getFullYear();

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase("id-ID").replace(/\s+/g, " ");
}

function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}

function emptyToNull(value: string): string | null {
  return value.trim() || null;
}

function createIdentityKey(
  nama: string,
  desa: string,
  kelompok: string,
): string {
  return [
    normalizeText(nama),
    normalizeText(desa),
    normalizeText(kelompok),
  ].join("|");
}

function getCellValue(cell: ExcelJS.Cell): string {
  const value = cell.value;

  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return String(value.getFullYear());
  }

  if (typeof value === "object") {
    if ("result" in value) {
      const result = value.result;

      if (result === null || result === undefined) {
        return "";
      }

      if (result instanceof Date) {
        return String(result.getFullYear());
      }

      return String(result).trim();
    }

    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText
        .map((item) => String(item.text ?? ""))
        .join("")
        .trim();
    }

    if ("text" in value) {
      return String(value.text ?? "").trim();
    }

    if ("hyperlink" in value) {
      const hyperlinkValue = value as {
        text?: string;
        hyperlink?: string;
      };

      return String(
        hyperlinkValue.text ?? hyperlinkValue.hyperlink ?? "",
      ).trim();
    }

    return "";
  }

  return String(value).trim();
}

function buildHeaderMap(headers: string[]): HeaderMap {
  const headerMap: HeaderMap = new Map();

  headers.forEach((value, index) => {
    const header = normalizeHeader(value);

    if (!header) return;

    if (headerMap.has(header)) {
      throw new Error(`Header "${header}" ditemukan lebih dari satu kali.`);
    }

    headerMap.set(header, index);
  });

  return headerMap;
}

function validateHeaders(headerMap: HeaderMap): void {
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headerMap.has(header),
  );

  if (missingHeaders.length > 0) {
    throw new Error(
      [
        "Format file tidak sesuai dengan format Export Data Generus.",
        `Kolom yang tidak ditemukan: ${missingHeaders.join(", ")}.`,
        "Silakan unduh kembali file melalui menu Export Data Generus dan gunakan file tersebut sebagai template.",
      ].join(" "),
    );
  }
}

function getPresentFields(headerMap: HeaderMap): ImportField[] {
  return Object.entries(HEADER_TO_FIELD)
    .filter(([header]) => headerMap.has(header))
    .map(([, field]) => field as ImportField);
}

function findOption(
  value: string,
  options: readonly string[],
): string {
  const normalized = normalizeText(value);

  return (
    options.find((option) => normalizeText(option) === normalized) ?? ""
  );
}

function normalizeDesa(value: string): string {
  return findOption(value, DESA_OPTIONS);
}

function normalizeKelompok(desa: string, kelompok: string): string {
  const options =
    KELOMPOK_BY_DESA[desa as keyof typeof KELOMPOK_BY_DESA];

  if (!options) return "";

  return findOption(kelompok, options);
}

function normalizeJenisKelamin(value: string): string {
  return findOption(value, JENIS_KELAMIN_OPTIONS);
}

function normalizeJenjang(value: string): string {
  return findOption(value, JENJANG_OPTIONS);
}

function calculateKelasFromJenjang(jenjang: string): string {
  if (jenjang === "Belum Sekolah" || jenjang === "PAUD") {
    return "PAUD";
  }

  if (jenjang === "TK") {
    return "TK";
  }

  if (["SD-1", "SD-2", "SD-3"].includes(jenjang)) {
    return "Caberawit A";
  }

  if (["SD-4", "SD-5", "SD-6"].includes(jenjang)) {
    return "Caberawit B";
  }

  if (["SMP-1", "SMP-2", "SMP-3"].includes(jenjang)) {
    return "Pra Remaja";
  }

  if (["SMA-1", "SMA-2", "SMA-3"].includes(jenjang)) {
    return "Remaja";
  }

  if (jenjang === "Kuliah" || jenjang === "Kerja") {
    return "Usia Nikah";
  }

  return "";
}

function isValidPhone(value: string): boolean {
  return /^(\+62|62|0)\d{8,15}$/.test(normalizePhone(value));
}

function parseYear(value: string): number | null {
  const normalized = value.trim();

  if (!/^\d{4}$/.test(normalized)) {
    return null;
  }

  const year = Number(normalized);

  if (year < 1900 || year > CURRENT_YEAR) {
    return null;
  }

  return year;
}

function validateRow(
  rowNumber: number,
  values: ValidateValues,
  presentFields: ImportField[],
  seenKeys: Set<string>,
): {
  data: ImportRow | null;
  error: ImportError | null;
  warnings: ImportWarning[];
} {
  const rowErrors: string[] = [];
  const rowWarnings: string[] = [];

  const desa = normalizeDesa(values.desa);
  const kelompok = normalizeKelompok(desa, values.kelompok);
  const jenisKelamin = normalizeJenisKelamin(values.jenisKelamin);
  const jenjang = normalizeJenjang(values.jenjang);

  const nama = values.nama.trim();

  if (!nama) {
    rowErrors.push("Nama Lengkap wajib diisi");
  } else if (/\d/.test(nama)) {
    rowErrors.push("Nama Lengkap tidak boleh mengandung angka");
  }

  if (!values.desa.trim()) {
    rowErrors.push("Desa wajib diisi");
  } else if (!desa) {
    rowErrors.push("Desa tidak valid");
  }

  if (!values.kelompok.trim()) {
    rowErrors.push("Kelompok wajib diisi");
  } else if (!desa || !kelompok) {
    rowErrors.push("Kelompok tidak sesuai dengan desa");
  }

  if (!values.jenisKelamin.trim()) {
    rowErrors.push("Jenis Kelamin wajib diisi");
  } else if (!jenisKelamin) {
    rowErrors.push("Jenis Kelamin tidak valid");
  }

  if (!values.jenjang.trim()) {
    rowErrors.push("Jenjang wajib diisi");
  } else if (!jenjang) {
    rowErrors.push(
      "Jenjang tidak valid. Gunakan pilihan jenjang yang tersedia",
    );
  }

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

  const tempatLahir = values.tempatLahir.trim();

  if (!tempatLahir) {
    rowWarnings.push("Tempat kosong");
  }

  let tahunLahir: number | null = null;

  if (!values.tahunLahir.trim()) {
    rowWarnings.push("Tahun Lahir kosong");
  } else {
    tahunLahir = parseYear(values.tahunLahir);

    if (tahunLahir === null) {
      rowWarnings.push(
        `Tahun Lahir tidak valid. Isi dengan tahun antara 1900 dan ${CURRENT_YEAR}`,
      );
    }
  }

  const noHpInput = values.noHp.trim();
  let noHp: string | null = null;

  if (!noHpInput) {
    rowWarnings.push("No HP kosong");
  } else if (!isValidPhone(noHpInput)) {
    rowWarnings.push("Format No HP tidak valid");
  } else {
    noHp = normalizePhone(noHpInput);
  }

  const pekerjaan = values.pekerjaan.trim();
  const alamat = values.alamat.trim();

  if (!pekerjaan) {
    rowWarnings.push("Pekerjaan kosong");
  }

  if (!alamat) {
    rowWarnings.push("Alamat kosong");
  }

  const duplicateKey = createIdentityKey(nama, desa, kelompok);

  if (seenKeys.has(duplicateKey)) {
    return {
      data: null,
      error: {
        rowNumber,
        message:
          "Data duplikat dengan baris lain dalam file berdasarkan Nama Lengkap, Desa, dan Kelompok",
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
      jenis_kelamin: jenisKelamin,
      tempat_lahir: emptyToNull(tempatLahir),
      tahun_lahir: tahunLahir,
      no_hp: noHp,
      pekerjaan: emptyToNull(pekerjaan),
      jenjang,
      kelas: calculateKelasFromJenjang(jenjang),
      alamat: emptyToNull(alamat),
      presentFields,
    },
    error: null,
    warnings: rowWarnings.map((message) => ({
      rowNumber,
      message,
    })),
  };
}

function buildImportResult(
  rows: string[][],
  rowOffset: number,
): ImportParseResult {
  if (rows.length === 0) {
    throw new Error("File tidak memiliki data.");
  }

  const headerMap = buildHeaderMap(rows[0]);

  validateHeaders(headerMap);

  const presentFields = getPresentFields(headerMap);

  const data: ImportRow[] = [];
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];
  const seenKeys = new Set<string>();

  function getValue(row: string[], header: HeaderName): string {
    const columnIndex = headerMap.get(header);

    if (columnIndex === undefined) {
      return "";
    }

    return String(row[columnIndex] ?? "").trim();
  }

  for (let index = 1; index < rows.length; index++) {
    const row = rows[index];

    const values: ValidateValues = {
      desa: getValue(row, "DESA"),
      kelompok: getValue(row, "KELOMPOK"),
      nama: getValue(row, "NAMA LENGKAP"),
      jenisKelamin: getValue(row, "JENIS KELAMIN"),
      tempatLahir: getValue(row, "TEMPAT"),
      tahunLahir: getValue(row, "TAHUN LAHIR"),
      noHp: getValue(row, "NO HP"),
      pekerjaan: getValue(row, "PEKERJAAN"),
      jenjang: getValue(row, "JENJANG"),
      alamat: getValue(row, "ALAMAT"),
    };

    const isEmptyRow = Object.values(values).every(
      (value) => !value.trim(),
    );

    if (isEmptyRow) continue;

    const result = validateRow(
      index + rowOffset,
      values,
      presentFields,
      seenKeys,
    );

    if (result.data) {
      data.push(result.data);
    }

    if (result.error) {
      errors.push(result.error);
    }

    warnings.push(...result.warnings);
  }

  return {
    data,
    errors,
    warnings,
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

  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];

  for (
    let column = 1;
    column <= Math.max(headerRow.cellCount, worksheet.columnCount);
    column++
  ) {
    headers[column - 1] = normalizeHeader(
      getCellValue(headerRow.getCell(column)),
    );
  }

  const rows: string[][] = [headers];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const excelRow = worksheet.getRow(rowNumber);
    const values: string[] = [];

    for (let column = 1; column <= headers.length; column++) {
      values[column - 1] = getCellValue(excelRow.getCell(column));
    }

    rows.push(values);
  }

  return buildImportResult(rows, 1);
}

function detectDelimiter(content: string): "," | ";" {
  const firstLine = content.split(/\r\n|\n|\r/).find((line) => line.trim());

  if (!firstLine) return ",";

  let commaCount = 0;
  let semicolonCount = 0;
  let insideQuotes = false;

  for (let index = 0; index < firstLine.length; index++) {
    const char = firstLine[index];

    if (char === '"') {
      if (insideQuotes && firstLine[index + 1] === '"') {
        index++;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (!insideQuotes) {
      if (char === ",") commaCount++;
      if (char === ";") semicolonCount++;
    }
  }

  return semicolonCount > commaCount ? ";" : ",";
}

function parseCsvContent(content: string): string[][] {
  const normalized = content
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  if (!normalized.trim()) {
    return [];
  }

  const delimiter = detectDelimiter(normalized);

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < normalized.length; index++) {
    const char = normalized[index];

    if (char === '"') {
      if (insideQuotes && normalized[index + 1] === '"') {
        currentValue += '"';
        index++;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (char === delimiter && !insideQuotes) {
      currentRow.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    if (char === "\n" && !insideQuotes) {
      currentRow.push(currentValue.trim());

      if (currentRow.some((value) => value.trim() !== "")) {
        rows.push(currentRow);
      }

      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  currentRow.push(currentValue.trim());

  if (currentRow.some((value) => value.trim() !== "")) {
    rows.push(currentRow);
  }

  if (insideQuotes) {
    throw new Error(
      "Format CSV tidak valid. Terdapat tanda kutip yang tidak berpasangan.",
    );
  }

  return rows;
}

async function parseCsv(file: File): Promise<ImportParseResult> {
  const content = await file.text();
  const rows = parseCsvContent(content);

  if (rows.length === 0) {
    throw new Error("File CSV kosong.");
  }

  return buildImportResult(rows, 1);
}

export async function parseImportExcel(
  file: File,
): Promise<ImportParseResult> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx")) {
    return parseXlsx(file);
  }

  if (fileName.endsWith(".csv")) {
    return parseCsv(file);
  }

  throw new Error(
    "Format file tidak didukung. Gunakan file .xlsx atau .csv hasil Export Data Generus.",
  );
}
