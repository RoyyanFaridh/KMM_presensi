"use client";

import { MonitoringPeserta } from "../../../backend/presensi/types";

import MonitoringStatusBadge from "./MonitoringStatusBadge";

type Props = {
  peserta: MonitoringPeserta | null;
  onClose: () => void;
};

function formatWaktuCheckin(waktu: string | null) {
  if (!waktu) {
    return "-";
  }

  const date = new Date(waktu);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function MonitoringDetailModal({ peserta, onClose }: Props) {
  if (!peserta) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-xs sm:px-6 sm:py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="monitoring-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-start justify-between border-b border-[#E5EAE6] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#65B98A]/30 bg-[#E6F2EA] text-[#287A50]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
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
                  d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            </div>

            <div className="min-w-0">
              <h2
                id="monitoring-detail-title"
                className="text-xs font-semibold tracking-tight text-[#202824]"
              >
                Detail Presensi
              </h2>

              <p className="text-[10px] text-[#78827C]">
                Informasi presensi peserta kegiatan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#9AA39D] transition hover:bg-[#F5F7F5] hover:text-[#202824]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5">
          {/* PESERTA */}
          <section>
            <div className="mb-2">
              <h3 className="text-xs font-semibold tracking-wide text-[#202824]">
                Informasi Peserta
              </h3>
            </div>

            <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3.5">
              <div className="mb-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">Nama</p>

                <p className="mt-0.5 wrap-break-word text-sm font-bold text-[#202824]">
                  {peserta.nama}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">Desa</p>

                  <p className="mt-0.5 truncate text-xs font-medium text-[#202824]">
                    {peserta.desa}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                    Kelompok
                  </p>

                  <p className="mt-0.5 truncate text-xs font-medium text-[#202824]">
                    {peserta.kelompok}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">Kelas</p>

                  <p className="mt-0.5 truncate text-xs font-medium text-[#202824]">
                    {peserta.kelas}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                    Status
                  </p>

                  <div className="mt-1">
                    <MonitoringStatusBadge status={peserta.status} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* DETAIL PRESENSI */}
          <section>
            <div className="mb-2">
              <h3 className="text-xs font-semibold tracking-wide text-[#202824]">
                Detail Presensi
              </h3>
            </div>

            <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3.5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">Metode</p>

                  <p className="mt-0.5 text-xs font-medium text-[#202824]">
                    {peserta.metode === "qr"
                      ? "QR"
                      : peserta.metode === "manual"
                        ? "Manual"
                        : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                    Waktu Check-in
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-[#202824]">
                    {formatWaktuCheckin(peserta.waktu_checkin)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* KETERANGAN */}
          <section className="border-t border-[#E5EAE6] pt-3">
            <div className="mb-1.5">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                Keterangan
              </p>
            </div>

            <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3.5">
              <p className="wrap-break-word text-xs leading-relaxed text-[#202824]">
                {peserta.keterangan || "Tidak ada keterangan."}
              </p>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 justify-end border-t border-[#E5EAE6] bg-[#F5F7F5]/50 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-xl border border-[#E5EAE6] bg-white px-4 text-xs font-medium text-[#78827C] transition hover:bg-[#F5F7F5] hover:text-[#202824] active:scale-[0.98]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
