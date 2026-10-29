import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

import { RekapitulasiBeritaAcara } from "./beritaAcaraData";

export type BeritaAcaraKegiatan = {
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  lokasi: string;
};

export type PemateriRow = {
  waktu: string;
  materi: string;
  petugas: string;
  keterangan: string;
};

export type JabatanKyaiOption = "KYAI DAERAH" | "KYAI DESA" | "KYAI KELOMPOK";

export type BeritaAcaraFormData = {
  pembawaAcara: string;
  petugas: string;
  kyaiDesa: string;
  jabatanKyai: JabatanKyaiOption;
  pemateriList: PemateriRow[];
  infaqAmplop: number;
  infaqPpg: number;
  infaqPresensi: number;
  totalInfaq: number;
};

const NAMA_HARI = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const FONT_FAMILY = "Times New Roman";
const FONT_SIZE_TITLE = 28; // 14 pt bold
const FONT_SIZE_HEADING = 22; // 11 pt bold
const FONT_SIZE_BODY = 22; // 11 pt regular
const FONT_SIZE_TABLE_HEADER = 19; // 9.5 pt bold
const FONT_SIZE_TABLE_DATA = 19; // 9.5 pt regular
const FONT_SIZE_PEMATERI = 20; // 10 pt regular

export function formatTanggalBeritaAcara(tanggalRaw: string): string {
  if (!tanggalRaw) return "-";

  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(tanggalRaw.trim());

  if (!match) return tanggalRaw;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const dateObj = new Date(year, month - 1, day);
  const hari = NAMA_HARI[dateObj.getDay()] ?? "";

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${hari}, ${pad(day)}/${pad(month)}/${year}`;
}

export function formatRentangTanggalBeritaAcara(
  tanggalMulai: string,
  tanggalSelesai: string,
): string {
  if (!tanggalMulai && !tanggalSelesai) return "-";

  const mulaiFormatted = formatTanggalBeritaAcara(tanggalMulai);

  if (!tanggalSelesai || tanggalMulai === tanggalSelesai) {
    return mulaiFormatted;
  }

  const selesaiFormatted = formatTanggalBeritaAcara(tanggalSelesai);

  return `${mulaiFormatted} sampai ${selesaiFormatted}`;
}

export function formatRupiahIndonesia(nominal: number): string {
  const safeNumber = Number.isFinite(nominal) && nominal >= 0 ? nominal : 0;
  return `Rp${safeNumber.toLocaleString("id-ID")}`;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "_").replace(/\s+/g, "_");
}

export async function generateBeritaAcaraDocx(
  kegiatan: BeritaAcaraKegiatan,
  rekap: RekapitulasiBeritaAcara,
  formData: BeritaAcaraFormData,
): Promise<Blob> {
  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  };

  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
  };

  const underlineBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
  };

  const cellMarginsRekap = {
    top: 60,
    bottom: 60,
    left: 60,
    right: 60,
  };

  const cellMarginsPemateri = {
    top: 60,
    bottom: 60,
    left: 80,
    right: 80,
  };

  // 1. Judul Dokumen BERITA ACARA (uppercase, bold, rata tengah)
  const titleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 180 },
    children: [
      new TextRun({
        text: "BERITA ACARA",
        bold: true,
        font: FONT_FAMILY,
        size: FONT_SIZE_TITLE,
      }),
    ],
  });

  // 2. Identitas Kegiatan (Titik dua sejajar vertikal, TANPA underline)
  const tanggalText = formatRentangTanggalBeritaAcara(
    kegiatan.tanggal_mulai,
    kegiatan.tanggal_selesai,
  );

  const identitasTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 25, bottom: 25, left: 0, right: 40 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: "Acara",
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 3, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 25, bottom: 25, left: 0, right: 40 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: ":",
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 77, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 25, bottom: 25, left: 0, right: 0 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: kegiatan.nama || "-",
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 25, bottom: 25, left: 0, right: 40 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: "Hari/Tanggal",
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 3, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 25, bottom: 25, left: 0, right: 40 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: ":",
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 77, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 25, bottom: 25, left: 0, right: 0 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: tanggalText,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 25, bottom: 25, left: 0, right: 40 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: "Tempat",
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 3, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 25, bottom: 25, left: 0, right: 40 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: ":",
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 77, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 25, bottom: 25, left: 0, right: 0 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: kegiatan.lokasi || "-",
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 25, bottom: 25, left: 0, right: 40 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: "Pembawa Acara",
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 3, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 25, bottom: 25, left: 0, right: 40 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: ":",
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 77, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 25, bottom: 25, left: 0, right: 0 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: formData.pembawaAcara || "-",
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 3. Tabel Rekapitulasi Kehadiran Bertingkat (Proporsional Portrait, Seluruh Header Rata Tengah Horizontal & Vertikal)
  // Header Baris 1: No. (rowSpan 2), Kelompok (rowSpan 2), Kehadiran (colSpan 3), Izin (colSpan 2), Wajib Hadir (colSpan 2), Persentase Kehadiran (rowSpan 2)
  const rekapHeaderRow1 = new TableRow({
    cantSplit: true,
    tableHeader: true,
    children: [
      new TableCell({
        rowSpan: 2,
        width: { size: 5, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "No.",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        rowSpan: 2,
        width: { size: 19, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Kelompok",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        columnSpan: 3,
        width: { size: 24, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Kehadiran",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        columnSpan: 2,
        width: { size: 16, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Izin",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        columnSpan: 2,
        width: { size: 16, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Wajib Hadir",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        rowSpan: 2,
        width: { size: 20, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Persentase Kehadiran",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Header Baris 2: Sub-kolom Kehadiran (Putra, Putri, Total), Izin (Putra, Putri), Wajib Hadir (Putra, Putri)
  const rekapHeaderRow2 = new TableRow({
    cantSplit: true,
    tableHeader: true,
    children: [
      // Subkolom Kehadiran
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Putra",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Putri",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Total",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      // Subkolom Izin
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Putra",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Putri",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      // Subkolom Wajib Hadir
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Putra",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Putri",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Baris Data: 10 kolom mandiri per kelompok, angka & persentase rata tengah horizontal dan vertikal
  const rekapDataRows = rekap.perKelompok.map((item, index) => {
    return new TableRow({
      cantSplit: true,
      children: [
        // 1. No.
        new TableCell({
          width: { size: 5, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsRekap,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: String(index + 1),
                  font: FONT_FAMILY,
                  size: FONT_SIZE_TABLE_DATA,
                }),
              ],
            }),
          ],
        }),
        // 2. Kelompok
        new TableCell({
          width: { size: 19, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsRekap,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: item.kelompok,
                  font: FONT_FAMILY,
                  size: FONT_SIZE_TABLE_DATA,
                }),
              ],
            }),
          ],
        }),
        // 3. Kehadiran Putra
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsRekap,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: String(item.hadirPutra),
                  font: FONT_FAMILY,
                  size: FONT_SIZE_TABLE_DATA,
                }),
              ],
            }),
          ],
        }),
        // 4. Kehadiran Putri
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsRekap,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: String(item.hadirPutri),
                  font: FONT_FAMILY,
                  size: FONT_SIZE_TABLE_DATA,
                }),
              ],
            }),
          ],
        }),
        // 5. Kehadiran Total
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsRekap,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: String(item.totalHadir),
                  font: FONT_FAMILY,
                  size: FONT_SIZE_TABLE_DATA,
                }),
              ],
            }),
          ],
        }),
        // 6. Izin Putra
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsRekap,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: String(item.izinPutra),
                  font: FONT_FAMILY,
                  size: FONT_SIZE_TABLE_DATA,
                }),
              ],
            }),
          ],
        }),
        // 7. Izin Putri
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsRekap,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: String(item.izinPutri),
                  font: FONT_FAMILY,
                  size: FONT_SIZE_TABLE_DATA,
                }),
              ],
            }),
          ],
        }),
        // 8. Wajib Hadir Putra
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsRekap,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: String(item.wajibPutra),
                  font: FONT_FAMILY,
                  size: FONT_SIZE_TABLE_DATA,
                }),
              ],
            }),
          ],
        }),
        // 9. Wajib Hadir Putri
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsRekap,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: String(item.wajibPutri),
                  font: FONT_FAMILY,
                  size: FONT_SIZE_TABLE_DATA,
                }),
              ],
            }),
          ],
        }),
        // 10. Persentase Kehadiran
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsRekap,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: item.persentaseText,
                  font: FONT_FAMILY,
                  size: FONT_SIZE_TABLE_DATA,
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  // Baris Total Keseluruhan (colSpan 2 untuk Total + 8 kolom angka rata tengah horizontal dan vertikal)
  const rekapTotalRow = new TableRow({
    cantSplit: true,
    children: [
      new TableCell({
        columnSpan: 2,
        width: { size: 24, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F9FAFB" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Total",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      // Hadir Putra Total
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F9FAFB" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: String(rekap.total.hadirPutra),
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      // Hadir Putri Total
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F9FAFB" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: String(rekap.total.hadirPutri),
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      // Hadir Total Total
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F9FAFB" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: String(rekap.total.totalHadir),
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      // Izin Putra Total
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F9FAFB" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: String(rekap.total.izinPutra),
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      // Izin Putri Total
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F9FAFB" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: String(rekap.total.izinPutri),
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      // Wajib Hadir Putra Total
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F9FAFB" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: String(rekap.total.wajibPutra),
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      // Wajib Hadir Putri Total
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F9FAFB" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: String(rekap.total.wajibPutri),
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
      // Persentase Kehadiran Total
      new TableCell({
        width: { size: 20, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsRekap,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F9FAFB" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: rekap.total.persentaseText,
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_TABLE_HEADER,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const rekapTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorder,
    rows: [rekapHeaderRow1, rekapHeaderRow2, ...rekapDataRows, rekapTotalRow],
  });

  // 4. Tabel Pemateri (Semua Header Rata Tengah Horizontal & Vertikal)
  const validPemateri = formData.pemateriList.filter(
    (row) =>
      row.waktu.trim() ||
      row.materi.trim() ||
      row.petugas.trim() ||
      row.keterangan.trim(),
  );

  const pemateriRowsToRender =
    validPemateri.length > 0
      ? validPemateri
      : [
          { waktu: "", materi: "", petugas: "", keterangan: "" },
          { waktu: "", materi: "", petugas: "", keterangan: "" },
        ];

  const pemateriHeaderRow = new TableRow({
    cantSplit: true,
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 6, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsPemateri,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "No.",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_PEMATERI,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 16, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsPemateri,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Waktu",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_PEMATERI,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 34, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsPemateri,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Materi",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_PEMATERI,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 24, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsPemateri,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Petugas",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_PEMATERI,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 20, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        margins: cellMarginsPemateri,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: "F3F4F6" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Keterangan",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_PEMATERI,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const pemateriDataRows = pemateriRowsToRender.map((item, index) => {
    return new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: 6, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsPemateri,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: String(index + 1),
                  font: FONT_FAMILY,
                  size: FONT_SIZE_PEMATERI,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 16, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsPemateri,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: item.waktu.trim() || "-",
                  font: FONT_FAMILY,
                  size: FONT_SIZE_PEMATERI,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 34, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsPemateri,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: item.materi.trim() || "-",
                  font: FONT_FAMILY,
                  size: FONT_SIZE_PEMATERI,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 24, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsPemateri,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: item.petugas.trim() || "-",
                  font: FONT_FAMILY,
                  size: FONT_SIZE_PEMATERI,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          margins: cellMarginsPemateri,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: item.keterangan.trim() || "-",
                  font: FONT_FAMILY,
                  size: FONT_SIZE_PEMATERI,
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  const pemateriTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorder,
    rows: [pemateriHeaderRow, ...pemateriDataRows],
  });

  // 5. Rekapitulasi Infak (Titik dua sejajar vertikal dan underline hanya pada area nominal)
  const totalInfaq =
    (formData.infaqAmplop || 0) +
    (formData.infaqPpg || 0) +
    (formData.infaqPresensi || 0);

  const infaqTable = new Table({
    width: { size: 55, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 38, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 20, bottom: 20, left: 0, right: 30 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: "Infaq Amplop",
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 4, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 20, bottom: 20, left: 0, right: 30 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: ":",
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 58, type: WidthType.PERCENTAGE },
            borders: underlineBorder,
            margins: { top: 20, bottom: 20, left: 30, right: 30 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: formatRupiahIndonesia(formData.infaqAmplop),
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 38, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 20, bottom: 20, left: 0, right: 30 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: "Infaq PPG",
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 4, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 20, bottom: 20, left: 0, right: 30 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: ":",
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 58, type: WidthType.PERCENTAGE },
            borders: underlineBorder,
            margins: { top: 20, bottom: 20, left: 30, right: 30 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: formatRupiahIndonesia(formData.infaqPpg),
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 38, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 20, bottom: 20, left: 0, right: 30 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: "Infaq Presensi",
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 4, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 20, bottom: 20, left: 0, right: 30 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: ":",
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 58, type: WidthType.PERCENTAGE },
            borders: underlineBorder,
            margins: { top: 20, bottom: 20, left: 30, right: 30 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: formatRupiahIndonesia(formData.infaqPresensi),
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 38, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 20, bottom: 20, left: 0, right: 30 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: "Jumlah",
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 4, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 20, bottom: 20, left: 0, right: 30 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: ":",
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 58, type: WidthType.PERCENTAGE },
            borders: underlineBorder,
            margins: { top: 20, bottom: 20, left: 30, right: 30 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: formatRupiahIndonesia(totalInfaq),
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 6. Tabel Pengesahan dan Tanda Tangan (3 Kolom x 4 Baris TANPA BORDER, Rata Tengah Horizontal)
  // Nama ditampilkan langsung tanpa tanda kurung atau pembungkus tambahan
  const jabatanKyaiDisplay = formData.jabatanKyai || "KYAI DESA";

  const tandaTanganTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      // Baris 1: Mengetahui di kolom 2
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [new Paragraph("")],
          }),
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Mengetahui,",
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [new Paragraph("")],
          }),
        ],
      }),
      // Baris 2: Petugas (kolom 1), Jabatan Kyai Terpilih (kolom 3)
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Petugas,",
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [new Paragraph("")],
          }),
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: jabatanKyaiDisplay,
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      // Baris 3: Ruang tanda tangan basah (~2-3 cm, tidak membuat halaman terpisah sendiri)
      new TableRow({
        cantSplit: true,
        height: { value: 1200, rule: HeightRule.ATLEAST },
        children: [
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [new Paragraph("")],
          }),
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [new Paragraph("")],
          }),
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [new Paragraph("")],
          }),
        ],
      }),
      // Baris 4: Nama Petugas (kolom 1), Nama Kyai (kolom 3) - TANPA TANDA KURUNG
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: formData.petugas.trim() || "",
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [new Paragraph("")],
          }),
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: formData.kyaiDesa.trim() || "",
                    bold: true,
                    font: FONT_FAMILY,
                    size: FONT_SIZE_BODY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
            },
            margin: {
              top: 1134, // ~2 cm
              bottom: 1134,
              left: 1134,
              right: 1134,
            },
          },
        },
        children: [
          titleParagraph,
          identitasTable,
          new Paragraph({ spacing: { before: 120 } }),
          rekapTable,
          new Paragraph({
            keepNext: true,
            spacing: { before: 160, after: 60 },
            children: [
              new TextRun({
                text: "PEMATERI",
                bold: true,
                font: FONT_FAMILY,
                size: FONT_SIZE_HEADING,
              }),
            ],
          }),
          pemateriTable,
          new Paragraph({ spacing: { before: 120 } }),
          infaqTable,
          new Paragraph({ spacing: { before: 160 } }),
          tandaTanganTable,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export async function downloadBeritaAcaraDocxFile(
  kegiatan: BeritaAcaraKegiatan,
  rekap: RekapitulasiBeritaAcara,
  formData: BeritaAcaraFormData,
): Promise<void> {
  const blob = await generateBeritaAcaraDocx(kegiatan, rekap, formData);

  const safeKegiatan = sanitizeFileName(kegiatan.nama || "Kegiatan");
  const safeTanggal = (kegiatan.tanggal_mulai || "Tanggal").slice(0, 10);
  const fileName = `Berita_Acara_${safeKegiatan}_${safeTanggal}.docx`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
