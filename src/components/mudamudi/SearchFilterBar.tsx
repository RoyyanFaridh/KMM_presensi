"use client";

import { useState } from "react";
import {
  DESA_OPTIONS,
  KELAS_OPTIONS,
  KELOMPOK_BY_DESA,
  JENIS_KELAMIN_OPTIONS,
} from "../../backend/mudamudi/constants";
import { SortConfig } from "../../backend/mudamudi/types";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  filterDesa: string;
  setFilterDesa: (v: string) => void;
  filterkelas: string;
  setFilterkelas: (v: string) => void;
  filterKelompok: string;
  setFilterKelompok: (v: string) => void;
  filterJenisKelamin: string;
  setFilterJenisKelamin: (v: string) => void;
  hasActiveFilters: boolean;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  onReset: () => void;
};

export default function SearchFilterBar({
  search,
  setSearch,
  filterDesa,
  setFilterDesa,
  filterkelas,
  setFilterkelas,
  filterKelompok,
  setFilterKelompok,
  filterJenisKelamin,
  setFilterJenisKelamin,
  sortConfig,
  setSortConfig,
  hasActiveFilters,
  onReset,
}: Props) {
  const [showFilter, setShowFilter] = useState(false);

  const kelompokOptions = filterDesa
    ? (KELOMPOK_BY_DESA[filterDesa as keyof typeof KELOMPOK_BY_DESA] ?? [])
    : Object.values(KELOMPOK_BY_DESA).flat();

  const activeFilterCount = [
    filterDesa,
    filterJenisKelamin,
    filterkelas,
    filterKelompok,
  ].filter(Boolean).length;

  function handleDesaChange(desa: string) {
    setFilterDesa(desa);

    if (
      filterKelompok &&
      desa &&
      !(KELOMPOK_BY_DESA[desa as keyof typeof KELOMPOK_BY_DESA] ?? []).includes(
        filterKelompok as never,
      )
    ) {
      setFilterKelompok("");
    }
  }

  return (
    <div className="mb-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5">
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
            placeholder="Cari nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9.5 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilter((prev) => !prev)}
          className={`
            flex h-9.5 items-center justify-center gap-1.5
            rounded-lg border px-3 text-[12px]
            transition
            ${
              showFilter || hasActiveFilters
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

          <div className="grid gap-4 md:grid-cols-4 md:gap-6">
            <div>
              <div className="mb-4 border-b border-gray-100 pb-4">
                <p className="mb-2 text-[11px] font-medium text-gray-600">
                  Urutkan
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                    <input
                      type="radio"
                      name="sort"
                      checked={
                        sortConfig?.key === "created_at" &&
                        sortConfig?.direction === "desc"
                      }
                      onChange={() =>
                        setSortConfig({
                          key: "created_at",
                          direction: "desc",
                        })
                      }
                      className="h-3.5 w-3.5 accent-teal-600"
                    />
                    Terbaru
                  </label>

                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                    <input
                      type="radio"
                      name="sort"
                      checked={
                        sortConfig?.key === "nama" &&
                        sortConfig?.direction === "asc"
                      }
                      onChange={() =>
                        setSortConfig({
                          key: "nama",
                          direction: "asc",
                        })
                      }
                      className="h-3.5 w-3.5 accent-teal-600"
                    />
                    Nama A - Z
                  </label>

                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                    <input
                      type="radio"
                      name="sort"
                      checked={
                        sortConfig?.key === "nama" &&
                        sortConfig?.direction === "desc"
                      }
                      onChange={() =>
                        setSortConfig({
                          key: "nama",
                          direction: "desc",
                        })
                      }
                      className="h-3.5 w-3.5 accent-teal-600"
                    />
                    Nama Z - A
                  </label>
                </div>
              </div>

              <p className="mb-2 text-[11px] font-medium text-gray-600">Desa</p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                  <input
                    type="radio"
                    name="desa"
                    value=""
                    checked={filterDesa === ""}
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
                      name="desa"
                      value={desa}
                      checked={filterDesa === desa}
                      onChange={() => handleDesaChange(desa)}
                      className="h-3.5 w-3.5 accent-teal-600"
                    />
                    {desa}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 md:border-t-0 md:border-l md:pl-6 md:pt-0">
              <p className="mb-2 text-[11px] font-medium text-gray-600">
                Jenis Kelamin
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                  <input
                    type="radio"
                    name="jenis-kelamin"
                    value=""
                    checked={filterJenisKelamin === ""}
                    onChange={(e) => setFilterJenisKelamin(e.target.value)}
                    className="h-3.5 w-3.5 accent-teal-600"
                  />
                  Semua
                </label>

                {JENIS_KELAMIN_OPTIONS.map((jk) => (
                  <label
                    key={jk}
                    className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600"
                  >
                    <input
                      type="radio"
                      name="jenis-kelamin"
                      value={jk}
                      checked={filterJenisKelamin === jk}
                      onChange={(e) => setFilterJenisKelamin(e.target.value)}
                      className="h-3.5 w-3.5 accent-teal-600"
                    />
                    {jk}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 md:border-t-0 md:border-l md:pl-6 md:pt-0">
              <p className="mb-2 text-[11px] font-medium text-gray-600">
                kelas
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                  <input
                    type="radio"
                    name="kelas"
                    value=""
                    checked={filterkelas === ""}
                    onChange={(e) => setFilterkelas(e.target.value)}
                    className="h-3.5 w-3.5 accent-teal-600"
                  />
                  Semua
                </label>

                {KELAS_OPTIONS.map((kelas) => (
                  <label
                    key={kelas}
                    className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600"
                  >
                    <input
                      type="radio"
                      name="kelas"
                      value={kelas}
                      checked={filterkelas === kelas}
                      onChange={(e) => setFilterkelas(e.target.value)}
                      className="h-3.5 w-3.5 accent-teal-600"
                    />
                    {kelas}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <p className="mb-2 text-[11px] font-medium text-gray-600">
                Kelompok
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                  <input
                    type="radio"
                    name="kelompok"
                    value=""
                    checked={filterKelompok === ""}
                    onChange={(e) => setFilterKelompok(e.target.value)}
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
                      name="kelompok"
                      value={kelompok}
                      checked={filterKelompok === kelompok}
                      onChange={(e) => setFilterKelompok(e.target.value)}
                      className="h-3.5 w-3.5 accent-teal-600"
                    />
                    {kelompok}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={onReset}
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
