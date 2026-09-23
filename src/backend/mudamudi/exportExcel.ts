import ExcelJS from "exceljs";
import { Mudamudi } from "./types";
import { DESA_OPTIONS, KELOMPOK_BY_DESA } from "./constants";

type ExportOptions = {
  data: Mudamudi[];
  adminDesa: string | null;
};

function getKelompokIndex(desa: string, kelompok: string): number {
  const kelompokOptions =
    KELOMPOK_BY_DESA[desa as keyof typeof KELOMPOK_BY_DESA];

  return kelompokOptions ? kelompokOptions.indexOf(kelompok as never) : -1;
}

function sortByDesaThenKelompokThenNama(data: Mudamudi[]): Mudamudi[] {
  return [...data].sort((a, b) => {
    const desaIndexA = DESA_OPTIONS.indexOf(a.desa);

    const desaIndexB = DESA_OPTIONS.indexOf(b.desa);

    if (desaIndexA !== desaIndexB) {
      return desaIndexA - desaIndexB;
    }

    const kelompokIndexA = getKelompokIndex(a.desa, a.kelompok);

    const kelompokIndexB = getKelompokIndex(b.desa, b.kelompok);

    if (kelompokIndexA !== kelompokIndexB) {
      return kelompokIndexA - kelompokIndexB;
    }

    return a.nama.localeCompare(b.nama, "id");
  });
}

function calculateAge(tanggalLahir: string | null): number | null {
  if (!tanggalLahir) {
    return null;
  }

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

function formatTanggalExcel(tanggal: string | null): string {
  if (!tanggal) {
    return "";
  }

  const date = new Date(`${tanggal}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return tanggal;
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${pad(date.getDate())}-${pad(
    date.getMonth() + 1,
  )}-${date.getFullYear()}`;
}

function getTimestamp(): string {
  const now = new Date();

  const pad = (n: number) => String(n).padStart(2, "0");

  const tanggal = `${now.getFullYear()}-${pad(
    now.getMonth() + 1,
  )}-${pad(now.getDate())}`;

  const jam = `${pad(now.getHours())}-${pad(now.getMinutes())}`;

  return `${tanggal}_${jam}`;
}

export async function exportPresensiExcel({ data, adminDesa }: ExportOptions) {
  const scopedData = adminDesa
    ? data.filter((item) => item.desa === adminDesa)
    : data;

  const sorted = sortByDesaThenKelompokThenNama(scopedData);

  const header = [
    "NO",
    "DESA",
    "KELOMPOK",
    "NAMA",
    "JENIS KELAMIN",
    "TEMPAT LAHIR",
    "TANGGAL LAHIR",
    "UMUR",
    "NO HP",
    "PEKERJAAN",
    "KELAS/kelas",
    "NAMA AYAH",
    "NAMA IBU",
    "NO HP ORTU",
    "ALAMAT",
  ];

  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Data Muda Mudi");

  sheet.columns = [
    { width: 6 },
    { width: 14 },
    { width: 16 },
    { width: 30 },
    { width: 18 },
    { width: 18 },
    { width: 16 },
    { width: 8 },
    { width: 16 },
    { width: 22 },
    { width: 18 },
    { width: 25 },
    { width: 25 },
    { width: 18 },
    { width: 35 },
  ];

  const headerRow = sheet.addRow(header);

  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
    };

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    cell.border = {
      top: {
        style: "thin",
      },
      bottom: {
        style: "thin",
      },
      left: {
        style: "thin",
      },
      right: {
        style: "thin",
      },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FFE5E7EB",
      },
    };
  });

  headerRow.height = 28;

  sorted.forEach((s, i) => {
    const row = sheet.addRow([
      i + 1,
      s.desa,
      s.kelompok,
      s.nama,
      s.jenis_kelamin ?? "",
      s.tempat_lahir ?? "",
      formatTanggalExcel(s.tanggal_lahir),
      calculateAge(s.tanggal_lahir),
      s.no_hp ?? "",
      s.pekerjaan ?? "",
      s.kelas,
      s.nama_ayah ?? "",
      s.nama_ibu ?? "",
      s.no_hp_ortu ?? "",
      s.alamat ?? "",
    ]);

    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: {
          style: "thin",
        },
        bottom: {
          style: "thin",
        },
        left: {
          style: "thin",
        },
        right: {
          style: "thin",
        },
      };

      cell.alignment = {
        horizontal:
          colNumber === 4 ||
          colNumber === 6 ||
          colNumber === 10 ||
          colNumber === 12 ||
          colNumber === 13 ||
          colNumber === 15
            ? "left"
            : "center",
        vertical: "middle",
        wrapText: true,
      };
    });
  });

  sheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `Data Mudamudi_${getTimestamp()}.xlsx`;

  link.click();

  URL.revokeObjectURL(url);
}
