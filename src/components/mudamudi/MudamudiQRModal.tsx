"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";

import { Mudamudi } from "../../backend/mudamudi/types";
import { toTitleCase } from "../../backend/mudamudi/format";

type Props = {
  data: Mudamudi;
  onClose: () => void;
};

export default function MudamudiQRModal({ data, onClose }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const qrValue = `SIKEMA:MUDA_MUDI:${data.qr_id}`;

  async function handleDownload() {
    if (!cardRef.current || isDownloading) {
      return;
    }

    try {
      setIsDownloading(true);

      await document.fonts?.ready;

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 4,
        backgroundColor: "#f9fafb",
        cacheBust: true,
      });

      const safeName =
        data.nama
          ?.trim()
          .replace(/[^a-zA-Z0-9\s-_]/g, "")
          .replace(/\s+/g, "-") || "Generus";

      const link = document.createElement("a");

      link.download = `QR-GENARA-${safeName}.png`;
      link.href = dataUrl;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Gagal mengunduh QR:", error);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 py-6">
      <div className="relative flex max-h-[95vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xl">
        <div className="shrink-0 border-b border-[#E5EAE6] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#E5EAE6] bg-[#E6F2EA] text-[#287A50]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path
                    strokeLinecap="round"
                    d="M8 8h3M8 12h1M8 16h3M13 8h3M13 12h3M13 16h3"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <h2 className="text-[11px] font-semibold tracking-tight text-[#202824]">
                  Kartu QR Presensi Generus
                </h2>

                <p className="text-[9px] leading-3.5 text-[#78827C]">
                  QR personal yang digunakan untuk presensi kegiatan GENARA
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              title="Tutup"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[#78827C] transition hover:bg-[#F0F4F1] hover:text-[#202824]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6 6 18"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto bg-[#F5F7F5] px-5 py-6">
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className="relative aspect-7/10 w-full max-w-75 rounded-[20px] bg-[#F5F7F5] p-[4%]"
            >
              <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                <div className="flex h-full w-full flex-col px-[8%] py-[7%]">
                  <div className="text-center">
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#287A50]">
                      GENARA
                    </p>

                    <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-[#202824]">
                      Kartu QR Presensi
                    </h3>

                    <div className="mx-auto mt-2 h-0.5 w-7 rounded-full bg-[#287A50]" />
                  </div>

                  <div className="flex flex-1 items-center justify-center">
                    <div className="rounded-2xl border border-[#E5EAE6] bg-white p-[5%] shadow-xs">
                      <QRCodeSVG
                        value={qrValue}
                        level="M"
                        includeMargin
                        className="block h-auto w-[clamp(145px,55vw,190px)]"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="wrap-break-word text-[14px] font-semibold leading-tight text-[#202824]">
                      {toTitleCase(data.nama)}
                    </p>

                    <p className="mt-1 text-[9px] leading-3.5 text-[#78827C]">
                      {data.desa} · {data.kelompok}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-[#E5EAE6] pt-2.5 text-center">
                    <p className="font-mono text-[6px] leading-none text-[#9AA39D]">
                      {data.qr_id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[9px] text-[#78827C]">
              Preview ukuran{" "}
              <span className="font-medium text-[#202824]">70 × 100 mm</span>
            </p>

            <p className="mt-0.5 text-[8px] text-[#9AA39D]">
              Format ID Card · Portrait
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#E5EAE6] bg-white px-5 py-3">
          <div className="min-w-0">
            <p className="text-[9px] text-[#78827C]">
              QR personal{" "}
              <span className="font-medium text-[#202824]">Generus</span>
            </p>

            <p className="mt-0.5 text-[8px] text-[#9AA39D]">
              Siap dicetak sebagai ID Card
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center justify-center rounded-xl border border-[#E5EAE6] bg-white px-3 text-[10px] font-medium text-[#202824] transition hover:bg-[#F0F4F1]"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-[#287A50] px-3.5 text-[10px] font-semibold text-white transition hover:bg-[#206440] active:bg-[#206440] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloading ? (
                <>
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="opacity-25"
                    />

                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Menyiapkan...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v12"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m7 10 5 5 5-5"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 21h14"
                    />
                  </svg>
                  Download PNG
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
