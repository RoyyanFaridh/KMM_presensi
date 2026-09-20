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

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(waktu));
}

export default function MonitoringDetailModal({ peserta, onClose }: Props) {
  if (!peserta) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="monitoring-detail-title"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div>
            <h2
              id="monitoring-detail-title"
              className="text-sm font-semibold text-gray-900"
            >
              Detail Presensi
            </h2>

            <p className="mt-0.5 text-[11px] text-gray-500">
              Informasi presensi peserta.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Peserta
            </p>

            <p className="mt-0.5 text-sm font-medium text-gray-900">
              {peserta.nama}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                Desa
              </p>

              <p className="mt-0.5 text-xs text-gray-700">{peserta.desa}</p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                Kelompok
              </p>

              <p className="mt-0.5 text-xs text-gray-700">{peserta.kelompok}</p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                Kelas
              </p>

              <p className="mt-0.5 text-xs text-gray-700">{peserta.kelas}</p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                Status
              </p>

              <div className="mt-1">
                <MonitoringStatusBadge status={peserta.status} />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                Metode
              </p>

              <p className="mt-0.5 text-xs text-gray-700">
                {peserta.metode === "qr"
                  ? "QR"
                  : peserta.metode === "manual"
                    ? "Manual"
                    : "-"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                Waktu Check-in
              </p>

              <p className="mt-0.5 text-xs text-gray-700">
                {formatWaktuCheckin(peserta.waktu_checkin)}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Keterangan
            </p>

            <p className="mt-1 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-700">
              {peserta.keterangan || "Tidak ada keterangan."}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
