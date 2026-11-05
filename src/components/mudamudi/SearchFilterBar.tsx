
"use client";

import { useState } from "react";
import {
  DESA_OPTIONS,
  JENJANG_OPTIONS,
  KELAS_OPTIONS,
  KELOMPOK_BY_DESA,
  JENIS_KELAMIN_OPTIONS,
} from "../../backend/mudamudi/constants";
import type { SortConfig, SortKey } from "../../backend/mudamudi/types";

type SortOption = {
  label: string;
  key: SortKey;
  direction: "asc" | "desc";
};

type Props = {
  search: string;
  setSearch: (v: string) => void;
  filterDesa: string[];
  setFilterDesa: (v: string[]) => void;
  filterKelompok: string[];
  setFilterKelompok: (v: string[]) => void;
  filterJenisKelamin: string[];
  setFilterJenisKelamin: (v: string[]) => void;
  filterJenjang: string[];
  setFilterJenjang: (v: string[]) => void;
  filterKelas: string[];
  setFilterKelas: (v: string[]) => void;
  hasActiveFilters: boolean;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  onReset: () => void;
  adminDesa: string | null;
};

const SORT_OPTIONS: SortOption[] = [
  { label: "Terbaru", key: "created_at", direction: "desc" },
  { label: "Nama A - Z", key: "nama", direction: "asc" },
  { label: "Nama Z - A", key: "nama", direction: "desc" },
];

const KELOMPOK_OPTIONS_BY_DESA: Record<string, readonly string[]> =
  KELOMPOK_BY_DESA;

const ALL_KELOMPOK_OPTIONS: string[] = Object.values(
  KELOMPOK_OPTIONS_BY_DESA,
).flat();

export default function SearchFilterBar({
  search,
  setSearch,
  filterDesa,
  setFilterDesa,
  filterKelompok,
  setFilterKelompok,
  filterJenisKelamin,
  setFilterJenisKelamin,
  filterJenjang,
  setFilterJenjang,
  filterKelas,
  setFilterKelas,
  sortConfig,
  setSortConfig,
  hasActiveFilters,
  onReset,
  adminDesa,
}: Props) {
  const [showFilter, setShowFilter] = useState(false);

  const isSuperAdmin = adminDesa === null;

  const kelompokOptions: string[] = isSuperAdmin
    ? filterDesa.length > 0
      ? filterDesa.flatMap(
        (desa) => [...(KELOMPOK_OPTIONS_BY_DESA[desa] ?? [])],
      )
      : [...ALL_KELOMPOK_OPTIONS]
    : [...(KELOMPOK_OPTIONS_BY_DESA[adminDesa] ?? [])];

  const uniqueKelompokOptions = [...new Set(kelompokOptions)];

  const activeFilterCount =
    filterDesa.length +
    filterKelompok.length +
    filterJenisKelamin.length +
    filterJenjang.length +
    filterKelas.length;

  function toggleArrayValue(
    value: string,
    current: string[],
    setter: (values: string[]) => void,
  ) {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function handleDesaChange(desa: string) {
    const nextDesa = filterDesa.includes(desa)
      ? filterDesa.filter((item) => item !== desa)
      : [...filterDesa, desa];

    setFilterDesa(nextDesa);

    if (isSuperAdmin) {
      const allowedKelompok: string[] =
        nextDesa.length > 0
          ? nextDesa.flatMap(
            (item) => KELOMPOK_OPTIONS_BY_DESA[item] ?? [],
          )
          : ALL_KELOMPOK_OPTIONS;

      setFilterKelompok(
        filterKelompok.filter((kelompok) =>
          allowedKelompok.includes(kelompok),
        ),
      );
    }
  }

  function handleKelompokChange(kelompok: string) {
    toggleArrayValue(
      kelompok,
      filterKelompok,
      setFilterKelompok,
    );
  }

  function removeChip(
    value: string,
    current: string[],
    setter: (values: string[]) => void,
  ) {
    setter(current.filter((item) => item !== value));
  }

  function handleReset() {
    onReset();
  }

  const checkboxClass =
    "h-3.5 w-3.5 shrink-0 rounded accent-[#287A50]";

  const optionClass =
    "flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600";

  const sectionTitleClass =
    "mb-1.5 text-[11px] font-semibold text-gray-700";

  const sectionClass =
    "min-w-0 border-t border-gray-100 pt-3 first:border-t-0 first:pt-0";

  const optionGridClass =
    "grid grid-cols-2 gap-x-3 gap-y-2 lg:grid-cols-3 2xl:grid-cols-4";

  function renderChips(
    label: string,
    values: string[],
    setter: (values: string[]) => void,
  ) {
    return values.map((value) => (
      <span
        key={`${label}-${value}`}
        className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAE6] bg-[#E6F2EA] px-2 py-0.5 text-[11px] font-medium text-[#206440]"
      >
        {label}: {value}
        <button
          type="button"
          onClick={() => removeChip(value, values, setter)}
          aria-label={`Hapus filter ${label} ${value}`}
        >
          ×
        </button>
      </span>
    ));
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
            className="h-10 w-full rounded-xl border border-[#E5EAE6] bg-white pl-9.5 pr-8 text-[12px] text-[#202824] outline-none transition placeholder:text-[#78827C] focus:border-[#287A50] focus:ring-2 focus:ring-[#65B98A]/20"
          />

          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[#78827C] transition hover:bg-[#F0F4F1] hover:text-[#202824]"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilter((prev) => !prev)}
          className={`flex h-10 items-center justify-center gap-1.5 rounded-xl border px-3.5 text-[12px] font-medium shadow-xs transition ${showFilter || hasActiveFilters
              ? "border-[#65B98A] bg-[#E6F2EA] text-[#287A50] ring-2 ring-[#65B98A]/20"
              : "border-[#E5EAE6] bg-white text-[#202824] hover:border-[#65B98A]/40 hover:bg-[#F0F4F1]"
            }`}
        >
          Filter

          {activeFilterCount > 0 && (
            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#287A50] px-1 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {(activeFilterCount > 0 || search.trim().length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="mr-1 text-[11px] font-medium text-[#78827C]">
            Filter aktif:
          </span>

          {search.trim() && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAE6] bg-[#E6F2EA] px-2 py-0.5 text-[11px] font-medium text-[#206440]">
              Cari: &ldquo;{search}&rdquo;
              <button
                type="button"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            </span>
          )}

          {renderChips("Desa", filterDesa, setFilterDesa)}
          {renderChips("Kelompok", filterKelompok, setFilterKelompok)}
          {renderChips(
            "Jenis Kelamin",
            filterJenisKelamin,
            setFilterJenisKelamin,
          )}
          {renderChips("Jenjang", filterJenjang, setFilterJenjang)}
          {renderChips("Kelas", filterKelas, setFilterKelas)}

          <button
            type="button"
            onClick={handleReset}
            className="ml-1 text-[11px] font-semibold text-red-600 transition hover:text-red-700"
          >
            Reset Semua
          </button>
        </div>
      )}

      {showFilter && (
        <div className="mt-2.5 flex max-h-[48vh] flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-lg shadow-black/5">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-2.5">
            <div>
              <h3 className="text-[12px] font-bold text-[#202824]">
                Filter Data Generus
              </h3>
              <p className="mt-0.5 text-[10px] text-[#78827C]">
                Pilih satu atau beberapa kriteria filter
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFilter(false)}
              aria-label="Tutup filter"
              className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2 lg:gap-x-8">
              <div className="min-w-0 space-y-3">
                <section className={sectionClass}>
                  <p className={sectionTitleClass}>Urutkan</p>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {SORT_OPTIONS.map((option) => (
                      <label
                        key={option.label}
                        className={optionClass}
                      >
                        <input
                          type="radio"
                          name="sort"
                          checked={
                            sortConfig?.key === option.key &&
                            sortConfig?.direction === option.direction
                          }
                          onChange={() =>
                            setSortConfig({
                              key: option.key,
                              direction: option.direction,
                            })
                          }
                          className="h-3.5 w-3.5 shrink-0 accent-[#287A50]"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </section>

                <section className={sectionClass}>
                  <p className={sectionTitleClass}>Desa</p>

                  {isSuperAdmin ? (
                    <div className={optionGridClass}>
                      {DESA_OPTIONS.map((desa) => (
                        <label
                          key={desa}
                          className={optionClass}
                        >
                          <input
                            type="checkbox"
                            checked={filterDesa.includes(desa)}
                            onChange={() => handleDesaChange(desa)}
                            className={checkboxClass}
                          />
                          {desa}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-[#D5EBDD] bg-[#E6F2EA] px-3 py-2">
                      <p className="text-[11px] font-medium text-[#287A50]">
                        {adminDesa}
                      </p>
                      <p className="mt-0.5 text-[9px] text-[#287A50]/70">
                        Mengikuti wilayah akun
                      </p>
                    </div>
                  )}
                </section>

                <section className={sectionClass}>
                  <p className={sectionTitleClass}>Kelompok</p>

                  <div className={optionGridClass}>
                    {uniqueKelompokOptions.map((kelompok) => (
                      <label
                        key={kelompok}
                        className={optionClass}
                      >
                        <input
                          type="checkbox"
                          checked={filterKelompok.includes(kelompok)}
                          onChange={() => handleKelompokChange(kelompok)}
                          className={checkboxClass}
                        />
                        <span>{kelompok}</span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>

              <div className="min-w-0 space-y-3 border-t border-gray-100 pt-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <section className={sectionClass}>
                  <p className={sectionTitleClass}>Jenis Kelamin</p>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {JENIS_KELAMIN_OPTIONS.map((jk) => (
                      <label
                        key={jk}
                        className={optionClass}
                      >
                        <input
                          type="checkbox"
                          checked={filterJenisKelamin.includes(jk)}
                          onChange={() =>
                            toggleArrayValue(
                              jk,
                              filterJenisKelamin,
                              setFilterJenisKelamin,
                            )
                          }
                          className={checkboxClass}
                        />
                        {jk}
                      </label>
                    ))}
                  </div>
                </section>

                <section className={sectionClass}>
                  <p className={sectionTitleClass}>Jenjang</p>

                  <div className={optionGridClass}>
                    {JENJANG_OPTIONS.map((jenjang) => (
                      <label
                        key={jenjang}
                        className={optionClass}
                      >
                        <input
                          type="checkbox"
                          checked={filterJenjang.includes(jenjang)}
                          onChange={() =>
                            toggleArrayValue(
                              jenjang,
                              filterJenjang,
                              setFilterJenjang,
                            )
                          }
                          className={checkboxClass}
                        />
                        <span>{jenjang}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className={sectionClass}>
                  <p className={sectionTitleClass}>Kelas</p>

                  <div className={optionGridClass}>
                    {KELAS_OPTIONS.map((kelas) => (
                      <label
                        key={kelas}
                        className={optionClass}
                      >
                        <input
                          type="checkbox"
                          checked={filterKelas.includes(kelas)}
                          onChange={() =>
                            toggleArrayValue(
                              kelas,
                              filterKelas,
                              setFilterKelas,
                            )
                          }
                          className={checkboxClass}
                        />
                        <span>{kelas}</span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-white px-4 py-2.5">
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
              className="rounded-xl bg-[#287A50] px-4 py-2 text-[11px] font-semibold text-white shadow-xs transition hover:bg-[#206440]"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
