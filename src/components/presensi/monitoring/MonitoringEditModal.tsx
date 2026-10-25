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

function getInitialStatus(status: PresensiStatus | null): PresensiStatus | "" {
  return status ?? "";
}

function getStatusLabel(status: PresensiStatus | null) {
  if (!status) {
    return "Belum Hadir";
  }

  return STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status;
}

export default function MonitoringEditModal({
  peserta,
  loading,
  error,
  onClose,
  onSave,
}: Props) {
  const [status, setStatus] = useState<PresensiStatus | "">("");
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

    if (loading || !status) {
      return;
    }

    onSave(status, keterangan.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm sm:px-6 sm:py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="w-full min-w-0 max-w-md max-h-[82dvh] overflow-hidden rounded-xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="monitoring-edit-title"
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
                  d="M12 20h9"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4-1-1-4L16.5 3.5Z"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <h2
                id="monitoring-edit-title"
                className="text-[14px] font-semibold leading-5 text-gray-800"
              >
                Edit Status Presensi
              </h2>

              <p className="mt-0.5 truncate text-[10px] leading-4 text-gray-400">
                {peserta.nama}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup"
            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
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

        <form
          onSubmit={handleSubmit}
          className="flex max-h-[72dvh] min-h-0 flex-col overflow-hidden"
        >
          {/* CONTENT */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {/* INFORMASI PESERTA */}
            <section>
              <div className="mb-3">
                <h3 className="text-[11px] font-semibold text-gray-700">
                  Informasi Peserta
                </h3>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-gray-400">
                      Desa
                    </p>
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
                    <p className="text-[10px] font-medium text-gray-400">
                      Kelas
                    </p>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-gray-700">
                      {peserta.kelas}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-gray-400">
                      Status Saat Ini
                    </p>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-gray-700">
                      {getStatusLabel(peserta.status)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* STATUS */}
            <section>
              <label
                htmlFor="monitoring-edit-status"
                className="mb-1.5 block text-[11px] font-medium text-gray-600"
              >
                Status Presensi
              </label>

              <div className="relative">
                <select
                  id="monitoring-edit-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as PresensiStatus | "")
                  }
                  disabled={loading}
                  required
                  className={`h-9.75 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-[11px] outline-none transition focus:ring-2 sm:text-[12px] ${
                    status ? "text-gray-700" : "text-gray-500"
                  } ${
                    error
                      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                      : "border-gray-200 focus:border-teal-400 focus:ring-teal-50"
                  } disabled:cursor-not-allowed disabled:bg-gray-50`}
                >
                  <option value="" disabled>
                    Pilih status presensi
                  </option>

                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
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
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
                </div>
              </div>

              {!status && !error && (
                <p className="mt-1 text-[9px] leading-3 text-gray-400">
                  Pilih status untuk menyimpan perubahan.
                </p>
              )}
            </section>

            {/* KETERANGAN */}
            <section>
              <label
                htmlFor="monitoring-edit-keterangan"
                className="mb-1.5 block text-[11px] font-medium text-gray-600"
              >
                Keterangan
                <span className="ml-1 font-normal text-gray-400">
                  (opsional)
                </span>
              </label>

              <textarea
                id="monitoring-edit-keterangan"
                value={keterangan}
                onChange={(event) => setKeterangan(event.target.value)}
                disabled={loading}
                rows={3}
                placeholder="Tambahkan keterangan..."
                maxLength={500}
                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-50 sm:text-[12px] disabled:cursor-not-allowed disabled:bg-gray-50"
              />

              <p className="mt-1 text-right text-[9px] text-gray-400">
                {keterangan.length}/500
              </p>
            </section>

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4M12 16h.01"
                  />
                </svg>

                <p className="text-[10px] leading-4 text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white px-4 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading || !status}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#171717] px-5 text-[11px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
