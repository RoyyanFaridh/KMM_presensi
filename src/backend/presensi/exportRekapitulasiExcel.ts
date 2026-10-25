import ExcelJS from "exceljs";

import type {
  PresensiStatus,
  RekapitulasiPresensi,
  RekapitulasiKegiatan,
  RekapitulasiMudaMudi,
} from "./types";

type FilterValue = string | string[];

type ExportFilters = {
  bulan?: string;
  kegiatanId?: number;
  desa?: FilterValue;
  kelompok?: FilterValue;
  kelas?: FilterValue;
  search?: string;
};

type ExportOptions = {
  data: RekapitulasiPresensi;
  filters: ExportFilters;
};

const STATUS_LABEL: Record<PresensiStatus, string> = {
  hadir: "Hadir",
  terlambat: "Terlambat",
  izin: "Izin",
  sakit: "Sakit",
  alpa: "Alpa",
};

const STATUS_COLORS: Record<PresensiStatus, { fill: string; font: string }> = {
  hadir: { fill: "FFD1FAE5", font: "FF065F46" },
  terlambat: { fill: "FFEDE9FE", font: "FF5B21B6" },
  izin: { fill: "FFFEF3C7", font: "FF92400E" },
  sakit: { fill: "FFDBEAFE", font: "FF1D4ED8" },
  alpa: { fill: "FFFEE2E2", font: "FF991B1B" },
};

function isMudamudiTargeted(
  kegiatan: RekapitulasiKegiatan,
  mudamudi: RekapitulasiMudaMudi,
): boolean {
  const desaSesuai =
    !kegiatan.desa ||
    kegiatan.desa.length === 0 ||
    kegiatan.desa.includes(mudamudi.desa);

  const kelasSesuai =
    !kegiatan.kelas ||
    kegiatan.kelas.length === 0 ||
    kegiatan.kelas.includes(mudamudi.kelas);

  const genderSesuai =
    !kegiatan.jenis_kelamin ||
    kegiatan.jenis_kelamin === mudamudi.jenis_kelamin;

  return desaSesuai && kelasSesuai && genderSesuai;
}

function formatTanggal(tanggal: string): string {
  if (!tanggal) return "-";

  const parsed = new Date(`${tanggal.slice(0, 10)}T00:00:00+07:00`);

  if (Number.isNaN(parsed.getTime())) return tanggal;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(parsed);
}

function formatBulan(bulan?: string): string {
  if (!bulan) return "Semua bulan";

  const match = /^(\d{4})-(\d{2})$/.exec(bulan);

  if (!match) return bulan;

  const tanggal = new Date(`${match[1]}-${match[2]}-01T00:00:00+07:00`);

  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(tanggal);
}

function getFilterValue(value?: FilterValue): string {
  if (Array.isArray(value)) {
    const selected = value.map((item) => item.trim()).filter(Boolean);

    return selected.length > 0 ? selected.join(", ") : "Semua";
  }

  return value?.trim() || "Semua";
}

function styleHeader(row: ExcelJS.Row, color = "FF0D7F78"): void {
  row.height = 28;

  row.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: color },
    };

    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 10,
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    cell.border = {
      top: { style: "thin", color: { argb: "FFD1D5DB" } },
      bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
      left: { style: "thin", color: { argb: "FFE5E7EB" } },
      right: { style: "thin", color: { argb: "FFE5E7EB" } },
    };
  });
}

function styleDataRow(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.font = {
      size: 10,
      color: { argb: "FF1F2937" },
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };

    cell.border = {
      bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      right: { style: "thin", color: { argb: "FFF3F4F6" } },
    };
  });
}

function getSafeFilename(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

export async function exportRekapitulasiExcel({
  data,
  filters,
}: ExportOptions): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "SIKEMA";
  workbook.subject = "Rekapitulasi Presensi Muda-Mudi";
  workbook.title = "Rekapitulasi Presensi";
  workbook.created = new Date();

  const kegiatan = [...data.kegiatan].sort((a, b) => {
    return b.tanggal_mulai.localeCompare(a.tanggal_mulai) || b.id - a.id;
  });

  const peserta = [...data.mudamudi].sort((a, b) =>
    a.nama.localeCompare(b.nama, "id"),
  );

  const attendanceMap = new Map<string, PresensiStatus>();

  for (const item of data.kehadiran) {
    if (item.status === "tidak_berlaku") {
      continue;
    }

    attendanceMap.set(`${item.mudamudi_id}-${item.kegiatan_id}`, item.status);
  }

  function getStatus(
    mudamudi: RekapitulasiMudaMudi,
    itemKegiatan: RekapitulasiKegiatan,
  ): PresensiStatus | null {
    if (!isMudamudiTargeted(itemKegiatan, mudamudi)) {
      return null;
    }

    return attendanceMap.get(`${mudamudi.id}-${itemKegiatan.id}`) ?? "alpa";
  }

  const totals: Record<PresensiStatus, number> = {
    hadir: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    alpa: 0,
  };

  for (const mudamudi of peserta) {
    for (const itemKegiatan of kegiatan) {
      const status = getStatus(mudamudi, itemKegiatan);

      if (status) {
        totals[status] += 1;
      }
    }
  }

  // SHEET 1: RINGKASAN
  const ringkasan = workbook.addWorksheet("Ringkasan");

  ringkasan.columns = [
    { header: "Informasi", key: "informasi", width: 30 },
    { header: "Nilai", key: "nilai", width: 38 },
  ];

  ringkasan.mergeCells("A1:B1");

  ringkasan.getCell("A1").value = "REKAPITULASI PRESENSI SIKEMA";

  ringkasan.getCell("A1").font = {
    bold: true,
    size: 16,
    color: { argb: "FFFFFFFF" },
  };

  ringkasan.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0D7F78" },
  };

  ringkasan.getCell("A1").alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  ringkasan.getRow(1).height = 36;

  ringkasan.addRow([]);
  ringkasan.addRow(["FILTER EKSPOR", ""]);
  styleHeader(ringkasan.getRow(3));

  const filterRows: [string, string][] = [
    ["Bulan", formatBulan(filters.bulan)],
    [
      "Kegiatan",
      filters.kegiatanId
        ? (kegiatan.find((item) => item.id === filters.kegiatanId)?.nama ??
          "Kegiatan terpilih")
        : "Semua kegiatan",
    ],
    ["Desa", getFilterValue(filters.desa)],
    ["Kelompok", getFilterValue(filters.kelompok)],
    ["Kelas", getFilterValue(filters.kelas)],
    ["Pencarian nama", getFilterValue(filters.search)],
  ];

  for (const item of filterRows) {
    const row = ringkasan.addRow(item);
    styleDataRow(row);
  }

  ringkasan.addRow([]);
  ringkasan.addRow(["RINGKASAN DATA", ""]);
  styleHeader(ringkasan.getRow(ringkasan.rowCount));

  const summaryRows: [string, string | number][] = [
    ["Tanggal ekspor", formatTanggal(new Date().toISOString().slice(0, 10))],
    ["Jumlah peserta", peserta.length],
    ["Jumlah kegiatan", kegiatan.length],
    ["Total catatan status", Object.values(totals).reduce((a, b) => a + b, 0)],
    ["Hadir", totals.hadir],
    ["Terlambat", totals.terlambat],
    ["Izin", totals.izin],
    ["Sakit", totals.sakit],
    ["Alpa", totals.alpa],
  ];

  for (const item of summaryRows) {
    const row = ringkasan.addRow(item);
    styleDataRow(row);
  }

  ringkasan.views = [{ state: "frozen", ySplit: 3 }];

  // SHEET 2: REKAPITULASI
  const rekap = workbook.addWorksheet("Rekapitulasi");

  const columns: Partial<ExcelJS.Column>[] = [
    { header: "No.", key: "no", width: 7 },
    { header: "Nama Muda-Mudi", key: "nama", width: 30 },
    { header: "Desa", key: "desa", width: 18 },
    { header: "Kelompok", key: "kelompok", width: 18 },
    { header: "Kelas", key: "kelas", width: 18 },
  ];

  for (const itemKegiatan of kegiatan) {
    columns.push({
      header: `${itemKegiatan.nama}\n${formatTanggal(
        itemKegiatan.tanggal_mulai,
      )}`,
      key: `kegiatan_${itemKegiatan.id}`,
      width: 24,
    });
  }

  columns.push(
    { header: "Hadir", key: "hadir", width: 10 },
    { header: "Terlambat", key: "terlambat", width: 12 },
    { header: "Izin", key: "izin", width: 10 },
    { header: "Sakit", key: "sakit", width: 10 },
    { header: "Alpa", key: "alpa", width: 10 },
  );

  rekap.columns = columns;
  rekap.getRow(1).height = 42;
  styleHeader(rekap.getRow(1));

  peserta.forEach((mudamudi, index) => {
    const rowData: Record<string, string | number> = {
      no: index + 1,
      nama: mudamudi.nama,
      desa: mudamudi.desa,
      kelompok: mudamudi.kelompok,
      kelas: mudamudi.kelas,
    };

    const participantTotals: Record<PresensiStatus, number> = {
      hadir: 0,
      terlambat: 0,
      izin: 0,
      sakit: 0,
      alpa: 0,
    };

    for (const itemKegiatan of kegiatan) {
      const status = getStatus(mudamudi, itemKegiatan);
      const key = `kegiatan_${itemKegiatan.id}`;

      if (!status) {
        rowData[key] = "-";
        continue;
      }

      rowData[key] = STATUS_LABEL[status];
      participantTotals[status] += 1;
    }

    rowData.hadir = participantTotals.hadir;
    rowData.terlambat = participantTotals.terlambat;
    rowData.izin = participantTotals.izin;
    rowData.sakit = participantTotals.sakit;
    rowData.alpa = participantTotals.alpa;

    const row = rekap.addRow(rowData);

    styleDataRow(row);
    row.height = 24;

    for (const itemKegiatan of kegiatan) {
      const status = getStatus(mudamudi, itemKegiatan);
      const cell = row.getCell(`kegiatan_${itemKegiatan.id}`);

      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };

      if (status) {
        const colors = STATUS_COLORS[status];

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colors.fill },
        };

        cell.font = {
          bold: true,
          color: { argb: colors.font },
          size: 9,
        };
      } else {
        cell.font = {
          color: { argb: "FF6B7280" },
          italic: true,
          size: 10,
        };
      }
    }
  });

  rekap.views = [
    {
      state: "frozen",
      xSplit: 5,
      ySplit: 1,
    },
  ];

  if (rekap.rowCount > 1 && rekap.columnCount > 0) {
    rekap.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: rekap.columnCount },
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `Rekapitulasi_Presensi_${getSafeFilename(date)}.xlsx`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
