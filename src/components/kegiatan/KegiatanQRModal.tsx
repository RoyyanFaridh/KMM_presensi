"use client";

import { QRCodeSVG } from "qrcode.react";
import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

import { Kegiatan } from "../../backend/kegiatan/types";
import { formatJam, formatTanggal } from "../../backend/kegiatan/format";

type Props = {
  kegiatan: Kegiatan | null;
  onClose: () => void;
};

export default function KegiatanQRModal({ kegiatan, onClose }: Props) {
  if (!kegiatan) {
    return null;
  }

  const currentKegiatan = kegiatan;

  const payload = `SIKEMA:PRESENSI:${currentKegiatan.id}`;

  const tanggalKegiatan =
    currentKegiatan.tanggal_mulai === currentKegiatan.tanggal_selesai
      ? formatTanggal(currentKegiatan.tanggal_mulai)
      : `${formatTanggal(currentKegiatan.tanggal_mulai)} - ${formatTanggal(
          currentKegiatan.tanggal_selesai,
        )}`;

  function getQRDataUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      const svg = document.querySelector(
        "#kegiatan-qr svg",
      ) as SVGElement | null;

      if (!svg) {
        reject(new Error("QR Code tidak ditemukan."));
        return;
      }

      const serializer = new XMLSerializer();

      const source = serializer.serializeToString(svg);

      const svgBlob = new Blob([source], {
        type: "image/svg+xml;charset=utf-8",
      });

      const svgUrl = URL.createObjectURL(svgBlob);

      const image = new Image();

      image.onload = () => {
        const size = 1400;
        const canvas = document.createElement("canvas");

        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext("2d");

        if (!context) {
          URL.revokeObjectURL(svgUrl);
          reject(new Error("Canvas tidak dapat dibuat."));
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, size, size);

        context.imageSmoothingEnabled = false;

        context.drawImage(image, 0, 0, size, size);

        URL.revokeObjectURL(svgUrl);

        resolve(canvas.toDataURL("image/png"));
      };

      image.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error("QR Code gagal diproses."));
      };

      image.src = svgUrl;
    });
  }

  function dataUrlToUint8Array(dataUrl: string) {
    const base64 = dataUrl.split(",")[1];

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let index = 0; index < binaryString.length; index++) {
      bytes[index] = binaryString.charCodeAt(index);
    }

    return bytes;
  }

  async function handleDownload() {
    try {
      const qrDataUrl = await getQRDataUrl();

      const qrBytes = dataUrlToUint8Array(qrDataUrl);

      const documentFile = new Document({
        sections: [
          {
            properties: {
              page: {
                size: {
                  width: 11906,
                  height: 16838,
                },
                margin: {
                  top: 720,
                  right: 850,
                  bottom: 720,
                  left: 850,
                },
              },
            },

            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  after: 80,
                },
                children: [
                  new TextRun({
                    text: "SIKEMA",
                    bold: true,
                    color: "0F766E",
                    size: 24,
                    font: "Arial",
                  }),
                  new TextRun({
                    text: "  |  PRESENSI KEGIATAN",
                    bold: true,
                    color: "6B7280",
                    size: 18,
                    font: "Arial",
                  }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: {
                  bottom: {
                    color: "0F766E",
                    space: 8,
                    style: BorderStyle.SINGLE,
                    size: 14,
                  },
                },
                spacing: {
                  after: 420,
                },
                children: [],
              }),

              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  after: 140,
                },
                children: [
                  new TextRun({
                    text: currentKegiatan.nama,
                    bold: true,
                    color: "111827",
                    size: 40,
                    font: "Arial",
                  }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  after: 380,
                },
                children: [
                  new TextRun({
                    text: "Scan QR Code berikut untuk melakukan presensi",
                    color: "6B7280",
                    size: 21,
                    font: "Arial",
                  }),
                ],
              }),

              new Table({
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: "D1D5DB",
                  },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: "D1D5DB",
                  },
                  left: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: "D1D5DB",
                  },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: "D1D5DB",
                  },
                  insideHorizontal: {
                    style: BorderStyle.SINGLE,
                    size: 2,
                    color: "E5E7EB",
                  },
                  insideVertical: {
                    style: BorderStyle.SINGLE,
                    size: 2,
                    color: "E5E7EB",
                  },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 40,
                          type: WidthType.PERCENTAGE,
                        },
                        verticalAlign: VerticalAlign.CENTER,
                        shading: {
                          type: ShadingType.CLEAR,
                          fill: "F9FAFB",
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: {
                              after: 60,
                            },
                            children: [
                              new TextRun({
                                text: "TANGGAL",
                                bold: true,
                                color: "6B7280",
                                size: 16,
                                font: "Arial",
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: tanggalKegiatan,
                                bold: true,
                                color: "111827",
                                size: 20,
                                font: "Arial",
                              }),
                            ],
                          }),
                        ],
                      }),

                      new TableCell({
                        width: {
                          size: 27,
                          type: WidthType.PERCENTAGE,
                        },
                        verticalAlign: VerticalAlign.CENTER,
                        shading: {
                          type: ShadingType.CLEAR,
                          fill: "F9FAFB",
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: {
                              after: 60,
                            },
                            children: [
                              new TextRun({
                                text: "WAKTU",
                                bold: true,
                                color: "6B7280",
                                size: 16,
                                font: "Arial",
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: `${formatJam(
                                  currentKegiatan.jam_mulai,
                                )} - ${formatJam(currentKegiatan.jam_selesai)}`,
                                bold: true,
                                color: "111827",
                                size: 20,
                                font: "Arial",
                              }),
                            ],
                          }),
                        ],
                      }),

                      new TableCell({
                        width: {
                          size: 33,
                          type: WidthType.PERCENTAGE,
                        },
                        verticalAlign: VerticalAlign.CENTER,
                        shading: {
                          type: ShadingType.CLEAR,
                          fill: "F9FAFB",
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: {
                              after: 60,
                            },
                            children: [
                              new TextRun({
                                text: "LOKASI",
                                bold: true,
                                color: "6B7280",
                                size: 16,
                                font: "Arial",
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: currentKegiatan.lokasi,
                                bold: true,
                                color: "111827",
                                size: 20,
                                font: "Arial",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  before: 550,
                  after: 120,
                },
                children: [
                  new TextRun({
                    text: "SCAN UNTUK PRESENSI",
                    bold: true,
                    color: "0F766E",
                    size: 20,
                    font: "Arial",
                  }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  after: 160,
                },
                children: [
                  new ImageRun({
                    data: qrBytes,
                    transformation: {
                      width: 500,
                      height: 500,
                    },
                    type: "png",
                  }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  before: 100,
                  after: 100,
                },
                children: [
                  new TextRun({
                    text: "Buka kamera pada perangkat Anda, lalu arahkan ke QR Code.",
                    color: "6B7280",
                    size: 18,
                    font: "Arial",
                  }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: {
                  top: {
                    color: "D1D5DB",
                    space: 8,
                    style: BorderStyle.SINGLE,
                    size: 4,
                  },
                },
                spacing: {
                  before: 450,
                  after: 0,
                },
                children: [
                  new TextRun({
                    text: "Sistem Informasi Kegiatan dan Muda Mudi",
                    color: "9CA3AF",
                    size: 16,
                    font: "Arial",
                  }),
                ],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(documentFile);

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `QR-Presensi-${currentKegiatan.id}.docx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal membuat dokumen QR:", error);

      alert("QR gagal dibuat menjadi dokumen. Silakan coba lagi.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-600">
            QR Presensi
          </p>

          <h2 className="mt-1 text-base font-semibold leading-5 text-gray-900">
            {currentKegiatan.nama}
          </h2>

          <div className="mt-2 space-y-0.5 text-xs text-gray-500">
            <p>{tanggalKegiatan}</p>

            <p>
              {formatJam(currentKegiatan.jam_mulai)} -{" "}
              {formatJam(currentKegiatan.jam_selesai)}
            </p>

            <p className="truncate" title={currentKegiatan.lokasi}>
              {currentKegiatan.lokasi}
            </p>
          </div>
        </div>

        <div className="px-5 pt-5">
          <div
            id="kegiatan-qr"
            className="mx-auto w-fit rounded-xl border border-gray-100 bg-white p-4"
          >
            <QRCodeSVG value={payload} size={240} level="M" includeMargin />
          </div>

          <p className="mt-4 text-center text-[10px] leading-4 text-gray-400">
            Tampilkan QR ini kepada peserta untuk melakukan presensi.
          </p>
        </div>

        <div className="flex gap-2 px-5 py-5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 flex-1 rounded-lg border border-gray-200 px-3 text-[11px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="h-9 flex-1 rounded-lg bg-teal-600 px-3 text-[11px] font-medium text-white transition-colors hover:bg-teal-700"
          >
            Download A4
          </button>
        </div>
      </div>
    </div>
  );
}
