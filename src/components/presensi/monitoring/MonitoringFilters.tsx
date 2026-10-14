"use client";

import { useState } from "react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;

  selectedDesa: string[];
  onDesaChange: (value: string[]) => void;
  desaOptions: string[];

  selectedKelompok: string[];
  onKelompokChange: (value: string[]) => void;
  kelompokOptions: string[];

  selectedKelas: string[];
  onKelasChange: (value: string[]) => void;
  kelasOptions: string[];

  selectedStatus: string[];
  onStatusChange: (value: string[]) => void;
  statusOptions: string[];

  onReset: () => void;
};

type FilterCheckboxGroupProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
};

function FilterCheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: FilterCheckboxGroupProps) {
  const isSemua = selected.length === 0;

  function toggleOption(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className="min-w-0">
      <p className="mb-2 text-[11px] font-medium text-gray-600">{label}</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([])}
          aria-pressed={isSemua}
          className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition ${
            isSemua
              ? "border-teal-400 bg-teal-50 text-teal-700"
              : "border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          Semua
        </button>

        {options.map((option) => {
          const isSelected = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              aria-pressed={isSelected}
              className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition ${
                isSelected
                  ? "border-teal-400 bg-teal-50 text-teal-700"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MonitoringFilters({
  search,
  onSearchChange,
  selectedDesa,
  onDesaChange,
  desaOptions,
  selectedKelompok,
  onKelompokChange,
  kelompokOptions,
  selectedKelas,
  onKelasChange,
  kelasOptions,
  selectedStatus,
  onStatusChange,
  statusOptions,
  onReset,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [
    selectedDesa,
    selectedKelompok,
    selectedKelas,
    selectedStatus,
  ].filter((selected) => selected.length > 0).length;

  const hasActiveFilters = activeFilterCount > 0 || search.trim().length > 0;

  return (
    <div className="mb-1 w-full min-w-0">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5">
        <div className="relative min-w-0">
          <svg
            aria-hidden="true"
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
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari nama peserta..."
            aria-label="Cari nama peserta"
            className="h-9.5 w-full min-w-0 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((current) => !current)}
          aria-expanded={showFilters}
          aria-controls="monitoring-filter-panel"
          className={`flex h-9.5 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 text-[12px] transition ${
            showFilters || activeFilterCount > 0
              ? "border-teal-200 bg-teal-50 text-teal-700"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-3.5 w-3.5 shrink-0"
          >
            <path d="M4 6h16" />
            <path d="M7 12h10" />
            <path d="M10 18h4" />
          </svg>

          <span>Filter</span>

          {activeFilterCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-700 px-1 text-[9px] font-medium text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div
          id="monitoring-filter-panel"
          className="mt-2.5 w-full min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[12px] font-semibold text-gray-800">
                Filter Data
              </h3>

              <p className="mt-0.5 text-[10px] text-gray-400">
                Pilih satu atau beberapa kriteria untuk menyaring data presensi
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(false)}
              aria-label="Tutup filter"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <svg
                aria-hidden="true"
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

          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            <FilterCheckboxGroup
              label="Desa"
              options={desaOptions}
              selected={selectedDesa}
              onChange={onDesaChange}
            />

            <FilterCheckboxGroup
              label="Kelompok"
              options={kelompokOptions}
              selected={selectedKelompok}
              onChange={onKelompokChange}
            />

            <FilterCheckboxGroup
              label="Kelas"
              options={kelasOptions}
              selected={selectedKelas}
              onChange={onKelasChange}
            />

            <FilterCheckboxGroup
              label="Status Presensi"
              options={statusOptions}
              selected={selectedStatus}
              onChange={onStatusChange}
            />
          </div>

          {activeFilterCount > 0 && (
            <p className="mt-3 text-[10px] text-gray-500">
              {activeFilterCount} kategori filter aktif.
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={onReset}
              disabled={!hasActiveFilters}
              className="text-[11px] text-gray-500 underline underline-offset-2 transition hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              Reset filter
            </button>

            <button
              type="button"
              onClick={() => setShowFilters(false)}
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
