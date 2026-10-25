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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm sm:px-6 sm:py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full min-w-0 max-w-md max-h-[82dvh] overflow-hidden rounded-xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="monitoring-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-teal-50 text-teal-600">
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
                className="text-[14px] font-semibold leading-5 text-gray-800"
              >
                Detail Presensi
              </h2>

              <p className="mt-0.5 truncate text-[10px] leading-4 text-gray-400">
                Informasi presensi peserta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
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
        <div className="max-h-[68dvh] space-y-4 overflow-y-auto px-5 py-5">
          {/* PESERTA */}
          <section>
            <div className="mb-3">
              <h3 className="text-[11px] font-semibold text-gray-700">
                Informasi Peserta
              </h3>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
              <div className="mb-3">
                <p className="text-[10px] font-medium text-gray-400">Nama</p>

                <p className="mt-0.5 wrap-break-word text-[12px] font-semibold text-gray-800">
                  {peserta.nama}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-400">Desa</p>

                  <p className="mt-0.5 truncate text-[11px] font-medium text-gray-700">
                    {peserta.desa}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-400">
                    Kelompok
                  </p>

                  <p className="mt-0.5 truncate text-[11px] font-medium text-gray-700">
                    {peserta.kelompok}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-400">Kelas</p>

                  <p className="mt-0.5 truncate text-[11px] font-medium text-gray-700">
                    {peserta.kelas}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-400">
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
            <div className="mb-3">
              <h3 className="text-[11px] font-semibold text-gray-700">
                Detail Presensi
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-[10px] font-medium text-gray-400">Metode</p>

                <p className="mt-0.5 text-[11px] font-medium text-gray-700">
                  {peserta.metode === "qr"
                    ? "QR"
                    : peserta.metode === "manual"
                      ? "Manual"
                      : "-"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-medium text-gray-400">
                  Waktu Check-in
                </p>

                <p className="mt-0.5 text-[11px] font-medium text-gray-700">
                  {formatWaktuCheckin(peserta.waktu_checkin)}
                </p>
              </div>
            </div>
          </section>

          {/* KETERANGAN */}
          <section className="border-t border-gray-100 pt-4">
            <div className="mb-2">
              <p className="text-[10px] font-medium text-gray-400">
                Keterangan
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 px-3 py-2.5">
              <p className="wrap-break-word text-[11px] leading-relaxed text-gray-700">
                {peserta.keterangan || "Tidak ada keterangan."}
              </p>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 justify-end border-t border-gray-100 bg-gray-50/50 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
