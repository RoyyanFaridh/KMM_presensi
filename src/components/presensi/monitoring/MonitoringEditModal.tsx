"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  MonitoringPeserta,
  PresensiStatus,
} from "../../../backend/presensi/types";

type Props = {
  peserta: MonitoringPeserta | null;
  loading: boolean;
  error: string;
  onClose: () => void;
  onSave: (status: PresensiStatus, keterangan: string) => void;
};

const STATUS_OPTIONS: {
  value: PresensiStatus;
  label: string;
}[] = [
  {
    value: "hadir",
    label: "Hadir",
  },
  {
    value: "terlambat",
    label: "Terlambat",
  },
  {
    value: "izin",
    label: "Izin",
  },
  {
    value: "sakit",
    label: "Sakit",
  },
  {
    value: "alpa",
    label: "Alpa",
  },
];

function getInitialStatus(status: PresensiStatus | null): PresensiStatus {
  return status ?? "izin";
}

export default function MonitoringEditModal({
  peserta,
  loading,
  error,
  onClose,
  onSave,
}: Props) {
  const [status, setStatus] = useState<PresensiStatus>("izin");
  const [keterangan, setKeterangan] = useState("");

  useEffect(() => {
    if (!peserta) {
      return;
    }

    setStatus(getInitialStatus(peserta.status));
    setKeterangan(peserta.keterangan ?? "");
  }, [peserta]);

  if (!peserta) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    onSave(status, keterangan.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900">
                Edit Status Presensi
              </h2>

              <p className="mt-0.5 truncate text-[11px] text-gray-500">
                {peserta.nama}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Tutup"
              className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Informasi peserta */}
          <div className="px-4 pt-4">
            <div className="rounded-lg bg-gray-50 px-3 py-2.5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                <div>
                  <p className="text-gray-400">Desa</p>
                  <p className="font-medium text-gray-700">{peserta.desa}</p>
                </div>

                <div>
                  <p className="text-gray-400">Kelompok</p>
                  <p className="font-medium text-gray-700">
                    {peserta.kelompok}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">Kelas</p>
                  <p className="font-medium text-gray-700">{peserta.kelas}</p>
                </div>

                <div>
                  <p className="text-gray-400">Status saat ini</p>
                  <p className="font-medium text-gray-700">
                    {peserta.status
                      ? STATUS_OPTIONS.find(
                          (item) => item.value === peserta.status,
                        )?.label
                      : "Belum Hadir"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="px-4 pt-4">
            <label
              htmlFor="monitoring-edit-status"
              className="mb-1.5 block text-xs font-medium text-gray-700"
            >
              Status Presensi
            </label>

            <select
              id="monitoring-edit-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as PresensiStatus)
              }
              disabled={loading}
              className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Keterangan */}
          <div className="px-4 pt-3">
            <label
              htmlFor="monitoring-edit-keterangan"
              className="mb-1.5 block text-xs font-medium text-gray-700"
            >
              Keterangan
              <span className="ml-1 font-normal text-gray-400">(opsional)</span>
            </label>

            <textarea
              id="monitoring-edit-keterangan"
              value={keterangan}
              onChange={(event) => setKeterangan(event.target.value)}
              disabled={loading}
              rows={3}
              placeholder="Tambahkan keterangan..."
              maxLength={500}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-gray-100"
            />

            <p className="mt-1 text-right text-[10px] text-gray-400">
              {keterangan.length}/500
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 pt-3">
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-[11px] font-medium text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
