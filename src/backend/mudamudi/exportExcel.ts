import ExcelJS from "exceljs";
import { Mudamudi } from "./types";
import { DESA_OPTIONS, KELOMPOK_BY_DESA } from "./constants";

type ExportOptions = {
  data: Mudamudi[];
  adminDesa: string | null;
};

const HEADER = [
  "No",
  "Desa",
  "Kelompok",
  "Nama Lengkap",
  "Jenis Kelamin",
  "Tempat",
  "Tanggal Lahir",
  "Umur",
  "No HP",
  "Pekerjaan",
  "Kelas",
  "Nama Ayah",
  "Nama Ibu",
  "No HP orangtua",
  "Alamat",
] as const;

const FONT_NAME = "Arial";
const FONT_SIZE = 10;
const VALIDATION_LAST_ROW = 1000;

const JENIS_KELAMIN_OPTIONS = ["Laki-laki", "Perempuan"] as const;

const KELAS_OPTIONS = [
  "PAUD",
  "Caberawit",
  "Pra Remaja",
  "Remaja",
  "Usia Nikah",
  "MT",
] as const;

const BORDER_STYLE: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFD9D9D9" } },
  bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
  left: { style: "thin", color: { argb: "FFD9D9D9" } },
  right: { style: "thin", color: { argb: "FFD9D9D9" } },
};

const BULAN_INDONESIA = [
  "januari",
  "februari",
  "maret",
  "april",
  "mei",
  "juni",
  "juli",
  "agustus",
  "september",
  "oktober",
  "november",
  "desember",
] as const;

function getKelompokIndex(desa: string, kelompok: string): number {
  const options = KELOMPOK_BY_DESA[desa as keyof typeof KELOMPOK_BY_DESA];

  if (!options) return Number.MAX_SAFE_INTEGER;

  const index = options.indexOf(kelompok as never);

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function getDesaIndex(desa: string): number {
  const index = (DESA_OPTIONS as readonly string[]).indexOf(desa);

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function sortByDesaThenKelompokThenNama(data: Mudamudi[]): Mudamudi[] {
  return [...data].sort((a, b) => {
    const desaDifference = getDesaIndex(a.desa) - getDesaIndex(b.desa);

    if (desaDifference !== 0) return desaDifference;

    const kelompokDifference =
      getKelompokIndex(a.desa, a.kelompok) -
      getKelompokIndex(b.desa, b.kelompok);

    if (kelompokDifference !== 0) return kelompokDifference;

    return a.nama.localeCompare(b.nama, "id", {
      sensitivity: "base",
    });
  });
}

function toCapitalEachWord(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .trim()
    .toLocaleLowerCase("id-ID")
    .replace(
      /(^|[\s-])([\p{L}])/gu,
      (_, separator: string, letter: string) =>
        separator + letter.toLocaleUpperCase("id-ID"),
    );
}

/**
 * Mengubah tanggal menjadi Date lokal tanpa menggeser hari.
 * Tanggal yang tidak dikenali dibiarkan sebagai teks agar tidak
 * diam-diam berubah menjadi tanggal yang berbeda.
 */
function parseTanggalLahir(
  value: string | Date | null | undefined,
): Date | string | null {
  if (value == null || value === "") return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;

    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      12,
      0,
      0,
    );
  }

  const input = String(value).trim();

  if (!input) return null;

  let year: number;
  let month: number;
  let day: number;

  const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/);
  const dmyMatch = input.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else if (dmyMatch) {
    day = Number(dmyMatch[1]);
    month = Number(dmyMatch[2]);
    year = Number(dmyMatch[3]);
  } else {
    return input;
  }

  const date = new Date(year, month - 1, day, 12, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return input;
  }

  return date;
}

/**
 * Formula umur:
 * - Mendukung tanggal yang disimpan sebagai angka tanggal Excel.
 * - Mendukung teks "12 Januari 2017", "5 Februari 2016",
 *   dan nama bulan Indonesia lainnya.
 * - Mendukung teks DD-MM-YYYY dan DD/MM/YYYY.
 * - Menghasilkan 0 jika tanggal kosong atau tidak valid.
 *
 * Formula ini menggunakan fungsi Excel standar.
 */
function getAgeFormula(rowNumber: number): string {
  const cell = `G${rowNumber}`;
  const text = `TRIM(${cell}&"")`;

  const firstSpace = `FIND(" ",${text}&" ")`;

  const secondSpace = `FIND(" ",${text}&" ",${firstSpace}+1)`;

  const dayFromText = `VALUE(LEFT(${text},${firstSpace}-1))`;

  const monthFromText = `LOWER(MID(${text},${firstSpace}+1,${secondSpace}-${firstSpace}-1))`;

  const yearFromText = `VALUE(RIGHT(${text},4))`;

  const monthNumber =
    `MATCH(${monthFromText},` +
    `{"januari","februari","maret","april","mei","juni",` +
    `"juli","agustus","september","oktober","november","desember"},0)`;

  const indonesianTextDate = `DATE(${yearFromText},${monthNumber},${dayFromText})`;

  // Mendukung teks DD-MM-YYYY atau DD/MM/YYYY.
  const separatorPosition = `IFERROR(FIND("-",${text}),IFERROR(FIND("/",${text}),0))`;

  const numericTextDate =
    `DATE(VALUE(RIGHT(${text},4)),` +
    `VALUE(MID(${text},${separatorPosition}+1,` +
    `FIND(MID(${text},${separatorPosition},1),${text},` +
    `${separatorPosition}+1)-${separatorPosition}-1)),` +
    `VALUE(LEFT(${text},${separatorPosition}-1)))`;

  const parsedTextDate = `IFERROR(${indonesianTextDate},${numericTextDate})`;

  return (
    `IF(${text}="",0,IFERROR(` +
    `IF(ISNUMBER(${cell}),` +
    `IF(OR(${cell}>TODAY(),${cell}<=0),0,DATEDIF(${cell},TODAY(),"Y")),` +
    `IF(${parsedTextDate}>TODAY(),0,` +
    `DATEDIF(${parsedTextDate},TODAY(),"Y"))),0))`
  );
}

function getTimestamp(): string {
  const now = new Date();

  const pad = (value: number) => String(value).padStart(2, "0");

  const tanggal = `${now.getFullYear()}-${pad(
    now.getMonth() + 1,
  )}-${pad(now.getDate())}`;

  const jam = `${pad(now.getHours())}-${pad(now.getMinutes())}`;

  return `${tanggal}_${jam}`;
}

function setCellAlignment(
  cell: ExcelJS.Cell,
  horizontal: ExcelJS.Alignment["horizontal"] = "center",
): void {
  cell.alignment = {
    horizontal,
    vertical: "middle",
    wrapText: true,
  };
}

function applyDataValidation(
  sheet: ExcelJS.Worksheet,
  column: "E" | "K",
  values: readonly string[],
  promptTitle: string,
  prompt: string,
): void {
  const formula = `"${values.join(",")}"`;

  for (let rowNumber = 2; rowNumber <= VALIDATION_LAST_ROW; rowNumber++) {
    sheet.getCell(`${column}${rowNumber}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [formula],
      showInputMessage: true,
      promptTitle,
      prompt,
      showErrorMessage: true,
      errorStyle: "stop",
      errorTitle: "Pilihan tidak valid",
      error: "Silakan pilih salah satu opsi dari daftar.",
    };
  }
}

export async function exportPresensiExcel({
  data,
  adminDesa,
}: ExportOptions): Promise<void> {
  const scopedData = adminDesa
    ? data.filter((item) => item.desa === adminDesa)
    : data;

  const sorted = sortByDesaThenKelompokThenNama(scopedData);

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "SIKEMA";
  workbook.subject = "Database Muda-Mudi";
  workbook.title = "Database Muda-Mudi";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.calcProperties.fullCalcOnLoad = true;

  const sheet = workbook.addWorksheet("Database", {
    views: [
      {
        state: "frozen",
        ySplit: 1,
        activeCell: "A2",
      },
    ],
    properties: {
      defaultRowHeight: 18,
    },
  });

  sheet.columns = [
    { key: "no", width: 6 },
    { key: "desa", width: 16 },
    { key: "kelompok", width: 18 },
    { key: "nama", width: 30 },
    { key: "jenis_kelamin", width: 18 },
    { key: "tempat", width: 18 },
    { key: "tanggal_lahir", width: 24 },
    { key: "umur", width: 10 },
    { key: "no_hp", width: 18 },
    { key: "pekerjaan", width: 22 },
    { key: "kelas", width: 18 },
    { key: "nama_ayah", width: 28 },
    { key: "nama_ibu", width: 28 },
    { key: "no_hp_ortu", width: 20 },
    { key: "alamat", width: 38 },
  ];

  // Header
  const headerRow = sheet.addRow([...HEADER]);

  headerRow.height = 30;

  headerRow.eachCell((cell) => {
    cell.font = {
      name: FONT_NAME,
      size: FONT_SIZE,
      bold: true,
    };

    setCellAlignment(cell, "center");
    cell.border = BORDER_STYLE;
  });

  // Data
  sorted.forEach((item, index) => {
    const rowNumber = index + 2;

    const row = sheet.addRow([
      index + 1,
      item.desa ?? "",
      item.kelompok ?? "",
      toCapitalEachWord(item.nama),
      item.jenis_kelamin ?? "",
      item.tempat_lahir ?? "",
      parseTanggalLahir(item.tanggal_lahir),
      {
        formula: getAgeFormula(rowNumber),
      },
      item.no_hp == null ? "" : String(item.no_hp),
      item.pekerjaan ?? "",
      item.kelas ?? "",
      item.nama_ayah ?? "",
      item.nama_ibu ?? "",
      item.no_hp_ortu == null ? "" : String(item.no_hp_ortu),
      item.alamat ?? "",
    ]);

    row.height = 20;

    row.eachCell((cell, columnNumber) => {
      cell.font = {
        name: FONT_NAME,
        size: FONT_SIZE,
        bold: false,
      };

      cell.border = BORDER_STYLE;

      const leftAlignedColumns = [4, 12, 13, 15];

      setCellAlignment(
        cell,
        leftAlignedColumns.includes(columnNumber) ? "left" : "center",
      );
    });

    row.getCell(7).numFmt = "[$-id-ID]dd mmmm yyyy";
    row.getCell(8).numFmt = "0";
    row.getCell(9).numFmt = "@";
    row.getCell(14).numFmt = "@";
  });

  applyDataValidation(
    sheet,
    "E",
    JENIS_KELAMIN_OPTIONS,
    "Jenis Kelamin",
    "Pilih Laki-laki atau Perempuan.",
  );

  applyDataValidation(
    sheet,
    "K",
    KELAS_OPTIONS,
    "Kelas",
    "Pilih kelas dari daftar yang tersedia.",
  );

  sheet.autoFilter = {
    from: "A1",
    to: `O${Math.max(sorted.length + 1, 1)}`,
  };

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `Database Muda-Mudi_${getTimestamp()}.xlsx`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
