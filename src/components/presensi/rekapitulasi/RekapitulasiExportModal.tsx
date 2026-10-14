"use client";

import { useMemo, useState } from "react";

import FilterCheckboxGroup from "../../mudamudi/FilterCheckboxGroup";

import {
  DESA_OPTIONS,
  KELOMPOK_BY_DESA,
  KELAS_OPTIONS,
} from "../../../backend/mudamudi/constants";

import type { RekapitulasiKegiatan } from "../../../backend/presensi/types";

export type ExportFilters = {
  bulan: string;
  kegiatanId: string;
  desa: string[];
  kelompok: string[];
  kelas: string[];
  search: string;
};

type Option = {
  value: string;
  label: string;
};

type Props = {
  adminDesa: string | null;
  filters: ExportFilters;
  bulanOptions: Option[];
  kegiatanOptions: RekapitulasiKegiatan[];
  onFiltersChange: (filters: ExportFilters) => void;
  onClose: () => void;
  onExport: (filters: ExportFilters) => Promise<void>;
};

const INPUT_CLASS =
  "mt-1.5 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400";

const LABEL_CLASS = "block text-[11px] font-medium text-gray-600";

function formatBulan(tanggal: string) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${tanggal}T00:00:00+07:00`));
}

export default function RekapitulasiExportModal({
  adminDesa,
  filters,
  bulanOptions,
  kegiatanOptions,
  onFiltersChange,
  onClose,
  onExport,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const kelompokOptions = useMemo(() => {
    const kelompokByDesa = KELOMPOK_BY_DESA;

    if (adminDesa) {
      return [
        ...(kelompokByDesa[adminDesa as keyof typeof kelompokByDesa] ?? []),
      ];
    }

    if (filters.desa.length > 0) {
      return Array.from(
        new Set(
          filters.desa.flatMap((desa) => [
            ...(kelompokByDesa[desa as keyof typeof kelompokByDesa] ?? []),
          ]),
        ),
      );
    }

    return Array.from(new Set(Object.values(kelompokByDesa).flat()));
  }, [adminDesa, filters.desa]);

  const filteredKegiatan = useMemo(() => {
    return [...kegiatanOptions]
      .filter(
        (kegiatan) =>
          !filters.bulan ||
          kegiatan.tanggal_mulai.slice(0, 7) === filters.bulan,
      )
      .sort(
        (a, b) =>
          new Date(`${b.tanggal_mulai}T00:00:00+07:00`).getTime() -
          new Date(`${a.tanggal_mulai}T00:00:00+07:00`).getTime(),
      );
  }, [filters.bulan, kegiatanOptions]);

  function updateFilters(partial: Partial<ExportFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  function handleReset() {
    onFiltersChange({
      bulan: "",
      kegiatanId: "",
      desa: [],
      kelompok: [],
      kelas: [],
      search: "",
    });

    setError("");
  }

  async function handleExport() {
    setLoading(true);
    setError("");

    try {
      await onExport({
        ...filters,
        desa: adminDesa ? [adminDesa] : filters.desa,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengekspor rekapitulasi.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-gray-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="my-auto flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90dvh] sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-teal-50 text-teal-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 3.75v4h4M8.5 13h7m-7 3.5h7"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <h2
                id="export-modal-title"
                className="text-[14px] font-semibold leading-5 text-gray-800"
              >
                Ekspor Rekapitulasi
              </h2>

              <p className="mt-0.5 text-[10px] leading-4 text-gray-400">
                Atur data yang akan diunduh dalam format Excel.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup modal"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6 6 12 12M18 6 6 18"
              />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div className="flex items-start gap-2.5 rounded-lg border border-teal-100 bg-teal-50/70 px-3 py-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="mt-0.5 h-4 w-4 shrink-0 text-teal-700"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5m0-8h.01" />
            </svg>

            <p className="text-[11px] leading-5 text-teal-900">
              Ekspor mencakup seluruh data yang sesuai dengan filter, termasuk
              peserta di halaman tabel lainnya.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="export-bulan" className={LABEL_CLASS}>
                Periode
              </label>

              <select
                id="export-bulan"
                value={filters.bulan}
                onChange={(event) =>
                  updateFilters({
                    bulan: event.target.value,
                    kegiatanId: "",
                  })
                }
                disabled={loading}
                className={INPUT_CLASS}
              >
                <option value="">Semua periode</option>

                {bulanOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label htmlFor="export-kegiatan" className={LABEL_CLASS}>
                Kegiatan
              </label>

              <select
                id="export-kegiatan"
                value={filters.kegiatanId}
                onChange={(event) =>
                  updateFilters({ kegiatanId: event.target.value })
                }
                disabled={loading}
                className={INPUT_CLASS}
              >
                <option value="">Semua kegiatan</option>

                {filteredKegiatan.map((kegiatan) => (
                  <option key={kegiatan.id} value={String(kegiatan.id)}>
                    {kegiatan.nama} ({formatBulan(kegiatan.tanggal_mulai)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {adminDesa === null ? (
            <FilterCheckboxGroup
              label="Desa"
              options={[...DESA_OPTIONS]}
              selected={filters.desa}
              onChange={(desa) => {
                const nextKelompokOptions = new Set<string>(
                  desa.flatMap((item) => [
                    ...(KELOMPOK_BY_DESA[
                      item as keyof typeof KELOMPOK_BY_DESA
                    ] ?? []),
                  ]),
                );

                updateFilters({
                  desa,
                  kelompok: filters.kelompok.filter((kelompok) =>
                    nextKelompokOptions.has(kelompok),
                  ),
                });
              }}
            />
          ) : (
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-gray-600">
                Desa
              </p>

              <div className="flex min-h-9 items-center rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-[12px] text-gray-600">
                {adminDesa}
              </div>
            </div>
          )}

          <FilterCheckboxGroup
            label="Kelompok"
            options={[...kelompokOptions]}
            selected={filters.kelompok}
            onChange={(kelompok) => updateFilters({ kelompok })}
          />

          <FilterCheckboxGroup
            label="Kelas"
            options={[...KELAS_OPTIONS]}
            selected={filters.kelas}
            onChange={(kelas) => updateFilters({ kelas })}
          />

          <div className="min-w-0">
            <label htmlFor="export-search" className={LABEL_CLASS}>
              Cari nama
            </label>

            <input
              id="export-search"
              type="search"
              value={filters.search}
              onChange={(event) =>
                updateFilters({ search: event.target.value })
              }
              disabled={loading}
              placeholder="Semua nama"
              className={INPUT_CLASS}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] leading-5 text-red-700"
            >
              {error}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-[11px] font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 sm:justify-start"
          >
            Reset filter
          </button>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#171717] px-4 text-[11px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />

                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3"
                    />
                  </svg>
                  Unduh Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
