"use client";

import { useMemo, useState } from "react";

import { DESA_OPTIONS } from "../../../backend/mudamudi/constants";

import type {
  RekapitulasiKegiatan,
  RekapitulasiMudaMudi,
} from "../../../backend/presensi/types";

type BulanOption = {
  value: string;
  label: string;
};

type Props = {
  search: string;
  selectedMonth: string;
  selectedKegiatan: string;
  selectedDesa: string;
  selectedKelompok: string;
  kegiatan: RekapitulasiKegiatan[];
  bulanOptions: BulanOption[];
  mudamudi: RekapitulasiMudaMudi[];
  onSearchChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onKegiatanChange: (value: string) => void;
  onDesaChange: (value: string) => void;
  onKelompokChange: (value: string) => void;
};

export default function RekapitulasiFilter({
  search,
  selectedMonth,
  selectedKegiatan,
  selectedDesa,
  selectedKelompok,
  kegiatan,
  bulanOptions,
  mudamudi,
  onSearchChange,
  onMonthChange,
  onKegiatanChange,
  onDesaChange,
  onKelompokChange,
}: Props) {
  const [showFilter, setShowFilter] = useState(false);

  const kelompokOptions = useMemo(() => {
    const kelompok = new Set<string>();

    mudamudi.forEach((item) => {
      if (selectedDesa && item.desa !== selectedDesa) {
        return;
      }

      kelompok.add(item.kelompok);
    });

    return Array.from(kelompok).sort((a, b) => a.localeCompare(b, "id"));
  }, [mudamudi, selectedDesa]);

  const activeFilterCount = [selectedDesa, selectedKelompok].filter(
    Boolean,
  ).length;

  function handleDesaChange(desa: string) {
    onDesaChange(desa);

    if (selectedKelompok) {
      const kelompokMasihValid = mudamudi.some(
        (item) =>
          item.kelompok === selectedKelompok && (!desa || item.desa === desa),
      );

      if (!kelompokMasihValid) {
        onKelompokChange("");
      }
    }
  }

  return (
    <div className="mb-4">
      {/* =========================================================
          MOBILE
          Search + Filter icon
          Bulan + Kegiatan
          ========================================================= */}
      <div className="space-y-2.5 sm:hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_40px] gap-2">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              type="text"
              placeholder="Cari Muda-Mudi..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9.5 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilter((prev) => !prev)}
            aria-label="Buka filter"
            title="Filter"
            className={`
              relative flex h-9.5 w-10 items-center justify-center
              rounded-lg border transition
              ${
                showFilter || activeFilterCount > 0
                  ? "border-teal-200 bg-teal-50 text-teal-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path d="M4 6h16" />
              <path d="M7 12h10" />
              <path d="M10 18h4" />
            </svg>

            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-700 px-1 text-[9px] font-medium text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="h-9.5 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-2.5 text-[11px] text-gray-600 outline-none transition focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
            aria-label="Pilih bulan"
          >
            <option value="">Semua bulan</option>

            {bulanOptions.map((bulan) => (
              <option key={bulan.value} value={bulan.value}>
                {bulan.label}
              </option>
            ))}
          </select>

          <select
            value={selectedKegiatan}
            onChange={(e) => onKegiatanChange(e.target.value)}
            className="h-9.5 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-2.5 text-[11px] text-gray-600 outline-none transition focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
            aria-label="Pilih kegiatan"
          >
            <option value="">Semua kegiatan</option>

            {kegiatan.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =========================================================
          DESKTOP / TABLET
          ========================================================= */}
      <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_180px_200px_auto] sm:gap-2.5">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>

          <input
            type="text"
            placeholder="Cari Muda-Mudi..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9.5 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
          />
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="h-9.5 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-600 outline-none transition focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
          aria-label="Pilih bulan"
        >
          <option value="">Semua bulan</option>

          {bulanOptions.map((bulan) => (
            <option key={bulan.value} value={bulan.value}>
              {bulan.label}
            </option>
          ))}
        </select>

        <select
          value={selectedKegiatan}
          onChange={(e) => onKegiatanChange(e.target.value)}
          className="h-9.5 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-600 outline-none transition focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
          aria-label="Pilih kegiatan"
        >
          <option value="">Semua kegiatan</option>

          {kegiatan.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowFilter((prev) => !prev)}
          className={`
            flex h-9.5 items-center justify-center gap-1.5
            rounded-lg border px-3 text-[12px]
            transition
            ${
              showFilter || activeFilterCount > 0
                ? "border-teal-200 bg-teal-50 text-teal-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-3.5 w-3.5"
          >
            <path d="M4 6h16" />
            <path d="M7 12h10" />
            <path d="M10 18h4" />
          </svg>
          Filter
          {activeFilterCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-700 px-1 text-[9px] font-medium text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* =========================================================
          FILTER PANEL
          ========================================================= */}
      {showFilter && (
        <div className="mt-2.5 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[12px] font-semibold text-gray-800">
                Filter Data
              </h3>

              <p className="mt-0.5 text-[10px] text-gray-400">
                Pilih kriteria untuk menyaring data
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFilter(false)}
              aria-label="Tutup filter"
              className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 6L6 18"
                />
              </svg>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {/* Desa */}
            <div>
              <p className="mb-2 text-[11px] font-medium text-gray-600">Desa</p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                  <input
                    type="radio"
                    name="rekapitulasi-desa"
                    value=""
                    checked={selectedDesa === ""}
                    onChange={() => handleDesaChange("")}
                    className="h-3.5 w-3.5 accent-teal-600"
                  />
                  Semua
                </label>

                {DESA_OPTIONS.map((desa) => (
                  <label
                    key={desa}
                    className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600"
                  >
                    <input
                      type="radio"
                      name="rekapitulasi-desa"
                      value={desa}
                      checked={selectedDesa === desa}
                      onChange={() => handleDesaChange(desa)}
                      className="h-3.5 w-3.5 accent-teal-600"
                    />

                    {desa}
                  </label>
                ))}
              </div>
            </div>

            {/* Kelompok */}
            <div className="border-t border-gray-100 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <p className="mb-2 text-[11px] font-medium text-gray-600">
                Kelompok
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                  <input
                    type="radio"
                    name="rekapitulasi-kelompok"
                    value=""
                    checked={selectedKelompok === ""}
                    onChange={() => onKelompokChange("")}
                    className="h-3.5 w-3.5 accent-teal-600"
                  />
                  Semua
                </label>

                {kelompokOptions.map((kelompok) => (
                  <label
                    key={kelompok}
                    className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600"
                  >
                    <input
                      type="radio"
                      name="rekapitulasi-kelompok"
                      value={kelompok}
                      checked={selectedKelompok === kelompok}
                      onChange={() => onKelompokChange(kelompok)}
                      className="h-3.5 w-3.5 accent-teal-600"
                    />

                    {kelompok}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={() => {
                onDesaChange("");
                onKelompokChange("");
              }}
              className="text-[11px] text-gray-500 underline underline-offset-2 transition hover:text-gray-700"
            >
              Reset filter
            </button>

            <button
              type="button"
              onClick={() => setShowFilter(false)}
              className="rounded-lg bg-teal-700 px-3.5 py-2 text-[11px] font-medium text-white transition hover:bg-teal-800"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
