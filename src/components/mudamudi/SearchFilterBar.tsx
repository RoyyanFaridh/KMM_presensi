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
  adminDesa: string | null;
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
  adminDesa,
}: Props) {
  const [showFilter, setShowFilter] = useState(false);

  const isSuperAdmin = adminDesa === null;

  const kelompokOptions = adminDesa
    ? (KELOMPOK_BY_DESA[adminDesa as keyof typeof KELOMPOK_BY_DESA] ?? [])
    : filterDesa
      ? (KELOMPOK_BY_DESA[filterDesa as keyof typeof KELOMPOK_BY_DESA] ?? [])
      : Object.values(KELOMPOK_BY_DESA).flat();

  const activeFilterCount = [
    filterJenisKelamin,
    filterkelas,
    filterKelompok,
    isSuperAdmin ? filterDesa : "",
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

  function handleReset() {
    if (isSuperAdmin) {
      onReset();
      return;
    }

    setFilterDesa("");
    setFilterKelompok("");
    setFilterJenisKelamin("");
    setFilterkelas("");
    setSearch("");
  }

  return (
    <div className="mb-4 space-y-2">
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
            placeholder="Cari nama Generus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9.5 pr-8 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />

          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-3 w-3"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilter((prev) => !prev)}
          className={`
            flex h-10 items-center justify-center gap-1.5
            rounded-xl border px-3.5 text-[12px] font-medium
            transition shadow-xs
            ${
              showFilter || hasActiveFilters
                ? "border-teal-300 bg-teal-50 text-teal-800 ring-2 ring-teal-100"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
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
            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-teal-700 px-1 text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter badges / chips */}
      {(activeFilterCount > 0 || search.trim().length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-medium text-gray-400 mr-1">
            Filter aktif:
          </span>

          {search.trim().length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50/70 px-2 py-0.5 text-[11px] text-teal-800">
              <span>Cari: &ldquo;{search}&rdquo;</span>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="hover:text-teal-950 font-bold ml-0.5"
                title="Hapus filter cari"
              >
                ×
              </button>
            </span>
          )}

          {isSuperAdmin && filterDesa && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50/70 px-2 py-0.5 text-[11px] text-teal-800">
              <span>Desa: {filterDesa}</span>
              <button
                type="button"
                onClick={() => handleDesaChange("")}
                className="hover:text-teal-950 font-bold ml-0.5"
                title="Hapus filter desa"
              >
                ×
              </button>
            </span>
          )}

          {filterKelompok && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50/70 px-2 py-0.5 text-[11px] text-teal-800">
              <span>Kelompok: {filterKelompok}</span>
              <button
                type="button"
                onClick={() => setFilterKelompok("")}
                className="hover:text-teal-950 font-bold ml-0.5"
                title="Hapus filter kelompok"
              >
                ×
              </button>
            </span>
          )}

          {filterJenisKelamin && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50/70 px-2 py-0.5 text-[11px] text-teal-800">
              <span>JK: {filterJenisKelamin}</span>
              <button
                type="button"
                onClick={() => setFilterJenisKelamin("")}
                className="hover:text-teal-950 font-bold ml-0.5"
                title="Hapus filter jenis kelamin"
              >
                ×
              </button>
            </span>
          )}

          {filterkelas && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50/70 px-2 py-0.5 text-[11px] text-teal-800">
              <span>Kelas: {filterkelas}</span>
              <button
                type="button"
                onClick={() => setFilterkelas("")}
                className="hover:text-teal-950 font-bold ml-0.5"
                title="Hapus filter kelas"
              >
                ×
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-medium text-red-600 hover:text-red-700 ml-1 transition"
          >
            Reset Semua
          </button>
        </div>
      )}

      {showFilter && (
        <div className="mt-2.5 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[12px] font-semibold text-gray-800">
                Filter Data Generus
              </h3>

              <p className="mt-0.5 text-[10px] text-gray-400">
                Pilih kriteria untuk menyaring data Generus
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

              {isSuperAdmin ? (
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
              ) : (
                <div className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2">
                  <p className="text-[11px] font-medium text-teal-700">
                    {adminDesa}
                  </p>

                  <p className="mt-0.5 text-[9px] text-teal-600/70">
                    Mengikuti wilayah akun
                  </p>
                </div>
              )}
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
                Kelas
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
              onClick={handleReset}
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
