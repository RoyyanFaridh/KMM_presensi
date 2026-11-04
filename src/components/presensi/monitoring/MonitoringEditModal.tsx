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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-xs sm:px-6 sm:py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="monitoring-edit-title"
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
                className="text-xs font-semibold tracking-tight text-[#202824]"
              >
                Edit Status Presensi
              </h2>

              <p className="text-[10px] text-[#78827C]">
                {peserta.nama}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup"
            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#9AA39D] transition hover:bg-[#F5F7F5] hover:text-[#202824] disabled:cursor-not-allowed disabled:opacity-50"
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
              <div className="mb-2">
                <h3 className="text-xs font-semibold text-[#202824]">
                  Informasi Peserta
                </h3>
              </div>

              <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3.5">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                      Desa
                    </p>
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
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                      Kelas
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium text-[#202824]">
                      {peserta.kelas}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                      Status Saat Ini
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium text-[#202824]">
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
                className="mb-1.5 block text-xs font-medium text-[#78827C]"
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
                  className={`h-10 w-full appearance-none rounded-xl border bg-white px-3 pr-9 text-xs outline-none transition focus:ring-2 ${
                    status ? "text-[#202824]" : "text-[#9AA39D]"
                  } ${
                    error
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-50"
                      : "border-[#E5EAE6] focus:border-[#287A50] focus:ring-[#65B98A]/20"
                  } disabled:cursor-not-allowed disabled:bg-[#F5F7F5]`}
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

                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#78827C]">
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
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
                </div>
              </div>

              {!status && !error && (
                <p className="mt-1 text-[10px] text-[#78827C]">
                  Pilih status untuk menyimpan perubahan.
                </p>
              )}
            </section>

            {/* KETERANGAN */}
            <section>
              <label
                htmlFor="monitoring-edit-keterangan"
                className="mb-1.5 block text-xs font-medium text-[#78827C]"
              >
                Keterangan
                <span className="ml-1 font-normal text-[#9AA39D]">
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
                className="w-full resize-none rounded-xl border border-[#E5EAE6] bg-white px-3 py-2.5 text-xs text-[#202824] placeholder:text-[#9AA39D] outline-none transition focus:border-[#287A50] focus:ring-2 focus:ring-[#65B98A]/20 disabled:cursor-not-allowed disabled:bg-[#F5F7F5]"
              />

              <p className="mt-1 text-right text-[10px] text-[#9AA39D]">
                {keterangan.length}/500
              </p>
            </section>

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4M12 16h.01"
                  />
                </svg>

                <p className="text-xs leading-4 text-rose-600">{error}</p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#E5EAE6] bg-[#F5F7F5]/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 w-full rounded-xl border border-[#E5EAE6] bg-white px-4 text-xs font-medium text-[#78827C] transition hover:bg-[#F5F7F5] hover:text-[#202824] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading || !status}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-[#287A50] px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#206440] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
