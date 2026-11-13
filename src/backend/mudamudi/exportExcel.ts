
import ExcelJS from "exceljs";
import { Mudamudi } from "./types";
import {
  DESA_OPTIONS,
  KELOMPOK_BY_DESA,
  JENJANG_OPTIONS,
} from "./constants";

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
  "Tahun Lahir",
  "No HP",
  "Pekerjaan",
  "Jenjang",
  "Kelas",
  "Alamat",
] as const;

const FONT_NAME = "Arial";
const FONT_SIZE = 10;
const VALIDATION_LAST_ROW = 1000;

const JENIS_KELAMIN_OPTIONS = ["Laki-laki", "Perempuan"] as const;

const JENJANG_KELAS_MAP: Record<string, string> = {
  "Belum Sekolah": "PAUD",
  PAUD: "PAUD",
  TK: "TK",
  "SD-1": "Caberawit A",
  "SD-2": "Caberawit A",
  "SD-3": "Caberawit A",
  "SD-4": "Caberawit B",
  "SD-5": "Caberawit B",
  "SD-6": "Caberawit B",
  "SMP-1": "Pra Remaja",
  "SMP-2": "Pra Remaja",
  "SMP-3": "Pra Remaja",
  "SMA-1": "Remaja",
  "SMA-2": "Remaja",
  "SMA-3": "Remaja",
  Kuliah: "Usia Nikah",
  Kerja: "Usia Nikah",
};

const BORDER_STYLE: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFD9D9D9" } },
  bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
  left: { style: "thin", color: { argb: "FFD9D9D9" } },
  right: { style: "thin", color: { argb: "FFD9D9D9" } },
};

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
  column: "E" | "J",
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

function getKelasFormula(rowNumber: number): string {
  const jenjangCell = `J${rowNumber}`;
  const kelasAwalCell = `M${rowNumber}`;

  const mappings = Object.entries(JENJANG_KELAS_MAP);

  let formula = kelasAwalCell;

  for (let index = mappings.length - 1; index >= 0; index--) {
    const [jenjang, kelas] = mappings[index];

    formula = `IF(${jenjangCell}="${jenjang}","${kelas}",${formula})`;
  }

  return `IF(${jenjangCell}="";${kelasAwalCell};${formula})`.replace(
    /;/g,
    ",",
  );
}

function getKelasFormulaResult(
  jenjang: string | null | undefined,
  kelasAwal: string | null | undefined,
): string {
  if (!jenjang) return kelasAwal ?? "";

  return JENJANG_KELAS_MAP[jenjang] ?? kelasAwal ?? "";
}

function unlockEditableCells(sheet: ExcelJS.Worksheet): void {
  const editableColumns = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "L",
  ];

  for (
    let rowNumber = 2;
    rowNumber <= VALIDATION_LAST_ROW;
    rowNumber++
  ) {
    editableColumns.forEach((column) => {
      sheet.getCell(`${column}${rowNumber}`).protection = {
        locked: false,
      };
    });

    sheet.getCell(`K${rowNumber}`).protection = {
      locked: true,
    };

    sheet.getCell(`M${rowNumber}`).protection = {
      locked: true,
    };
  }
}

export async function exportPresensiExcel({
  data,
  adminDesa,
}: ExportOptions): Promise<void> {
  const activeData = data.filter((item) => !item.deleted_at);

  const scopedData = adminDesa
    ? activeData.filter((item) => item.desa === adminDesa)
    : activeData;

  const sorted = sortByDesaThenKelompokThenNama(scopedData);

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "GENARA";
  workbook.subject = "Database Generus";
  workbook.title = "Database Generus";
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
    { key: "tahun_lahir", width: 14 },
    { key: "no_hp", width: 18 },
    { key: "pekerjaan", width: 22 },
    { key: "jenjang", width: 16 },
    { key: "kelas", width: 18 },
    { key: "alamat", width: 38 },
    { key: "kelas_awal", width: 18, hidden: true },
  ];

  const headerRow = sheet.addRow([...HEADER, "Kelas Awal"]);

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

  sorted.forEach((item, index) => {
    const rowNumber = index + 2;
    const kelasAwal = item.kelas ?? "";

    const row = sheet.addRow([
      index + 1,
      item.desa ?? "",
      item.kelompok ?? "",
      toCapitalEachWord(item.nama),
      item.jenis_kelamin ?? "",
      item.tempat_lahir ?? "",
      item.tahun_lahir !== null ? item.tahun_lahir : "",
      item.no_hp == null ? "" : String(item.no_hp),
      item.pekerjaan ?? "",
      item.jenjang ?? "",
      {
        formula: getKelasFormula(rowNumber),
        result: getKelasFormulaResult(item.jenjang, kelasAwal),
      },
      item.alamat ?? "",
      kelasAwal,
    ]);

    row.height = 20;

    row.eachCell((cell, columnNumber) => {
      cell.font = {
        name: FONT_NAME,
        size: FONT_SIZE,
        bold: false,
      };

      cell.border = BORDER_STYLE;

      const leftAlignedColumns = [4, 12];

      setCellAlignment(
        cell,
        leftAlignedColumns.includes(columnNumber) ? "left" : "center",
      );
    });

    row.getCell(7).numFmt = "0";
    row.getCell(8).numFmt = "@";

    row.getCell(11).font = {
      name: FONT_NAME,
      size: FONT_SIZE,
      bold: false,
      color: { argb: "FF287A50" },
    };
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
    "J",
    JENJANG_OPTIONS,
    "Jenjang Pendidikan",
    "Pilih jenjang pendidikan dari daftar yang tersedia.",
  );

  sheet.autoFilter = {
    from: "A1",
    to: `L${Math.max(sorted.length + 1, 1)}`,
  };

  unlockEditableCells(sheet);

  await sheet.protect("", {
    selectLockedCells: false,
    selectUnlockedCells: true,
    autoFilter: true,
    sort: true,
  });

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `Database Generus_${getTimestamp()}.xlsx`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
