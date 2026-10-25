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

const CONTROL_CLASS =
  "h-8 w-full min-w-0 rounded-md border border-gray-200 bg-white px-2 text-[11px] text-gray-700 outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-100";

const LABEL_CLASS = "mb-1 block text-[10px] font-medium text-gray-500";

type FilterSelectProps = {
  id: string;
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
};

function FilterSelect({
  id,
  label,
  options,
  selected,
  onChange,
}: FilterSelectProps) {
  const [value, setValue] = useState("");

  const allSelected = options.length > 0 && selected.length === options.length;

  function toggleOption(option: string) {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];

    onChange(next);
  }

  function handleSelectChange(nextValue: string) {
    setValue(nextValue);

    if (!nextValue) return;

    toggleOption(nextValue);
    setValue("");
  }

  return (
    <div className="min-w-0">
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => handleSelectChange(event.target.value)}
          className={`${CONTROL_CLASS} pr-7`}
        >
          <option value="">
            {selected.length === 0
              ? `Semua ${label.toLowerCase()}`
              : `Tambah ${label.toLowerCase()}`}
          </option>

          {options
            .filter((option) => !selected.includes(option))
            .map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
        </select>
      </div>

      {selected.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {selected.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              title={`Hapus ${option}`}
              className="inline-flex max-w-full items-center gap-1 rounded border border-teal-100 bg-teal-50 px-1.5 py-0.5 text-[10px] text-teal-700 transition hover:border-teal-200 hover:bg-teal-100"
            >
              <span className="max-w-37.5 truncate">{option}</span>
              <span aria-hidden="true" className="shrink-0 text-teal-500">
                ×
              </span>
            </button>
          ))}

          {selected.length > 1 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="px-1 text-[10px] text-gray-400 transition hover:text-red-600"
            >
              Hapus semua
            </button>
          )}
        </div>
      )}

      {options.length > 0 && selected.length === options.length && (
        <p className="mt-1 text-[10px] text-gray-400">
          Semua pilihan telah dipilih
        </p>
      )}

      {allSelected && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="mt-1 text-[10px] font-medium text-teal-700 hover:text-teal-900"
        >
          Reset pilihan
        </button>
      )}
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
  const [showFilter, setShowFilter] = useState(false);

  const activeFilterCount = [
    selectedDesa,
    selectedKelompok,
    selectedKelas,
    selectedStatus,
  ].filter((selected) => selected.length > 0).length;

  const hasActiveFilter = activeFilterCount > 0;
  const hasActiveSearch = search.trim().length > 0;
  const hasActiveCriteria = hasActiveFilter || hasActiveSearch;

  return (
    <section className="mb-2 space-y-2">
      <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_32px] items-end gap-x-3 gap-y-3 lg:grid-cols-[minmax(180px,1fr)_auto]">
          <div className="min-w-0">
            <label htmlFor="monitoring-search" className={LABEL_CLASS}>
              Cari Peserta
            </label>

            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>

              <input
                id="monitoring-search"
                type="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Cari nama peserta..."
                className={`${CONTROL_CLASS} pl-8`}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFilter((current) => !current)}
            aria-label={
              showFilter ? "Tutup filter lanjutan" : "Buka filter lanjutan"
            }
            aria-expanded={showFilter}
            aria-controls="monitoring-filter-panel"
            title="Filter lanjutan"
            className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition lg:h-8 lg:w-auto lg:min-w-28 lg:gap-1.5 lg:px-2 ${
              showFilter || hasActiveFilter
                ? "border-teal-200 bg-teal-50 text-teal-800"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path d="M4 7h16M7 12h10m-7 5h4" />
            </svg>

            <span className="hidden text-[11px] font-medium lg:inline">
              Filter
            </span>

            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-teal-600 px-1 text-[9px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className={`hidden h-3 w-3 shrink-0 transition-transform lg:inline ${
                showFilter ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {hasActiveCriteria && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2">
            <p className="text-[10px] text-gray-500">
              {hasActiveFilter
                ? `${activeFilterCount} kategori filter aktif`
                : "Pencarian aktif"}
            </p>

            <button
              type="button"
              onClick={onReset}
              className="text-[10px] font-medium text-teal-700 transition hover:text-teal-900"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>

      {showFilter && (
        <div
          id="monitoring-filter-panel"
          className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[11px] font-semibold text-gray-700">
                Filter lanjutan
              </h3>
              <p className="mt-0.5 text-[10px] text-gray-400">
                Pilih satu atau beberapa kriteria presensi
              </p>
            </div>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => {
                  onDesaChange([]);
                  onKelompokChange([]);
                  onKelasChange([]);
                  onStatusChange([]);
                }}
                className="shrink-0 text-[10px] font-medium text-red-600 transition hover:text-red-700"
              >
                Hapus pilihan
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <FilterSelect
              id="monitoring-desa"
              label="Desa"
              options={desaOptions}
              selected={selectedDesa}
              onChange={onDesaChange}
            />

            <FilterSelect
              id="monitoring-kelompok"
              label="Kelompok"
              options={kelompokOptions}
              selected={selectedKelompok}
              onChange={onKelompokChange}
            />

            <FilterSelect
              id="monitoring-kelas"
              label="Kelas"
              options={kelasOptions}
              selected={selectedKelas}
              onChange={onKelasChange}
            />

            <FilterSelect
              id="monitoring-status"
              label="Status Presensi"
              options={statusOptions}
              selected={selectedStatus}
              onChange={onStatusChange}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={onReset}
              disabled={!hasActiveCriteria}
              className="text-[10px] font-medium text-gray-500 transition hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              Reset semua filter
            </button>

            <button
              type="button"
              onClick={() => setShowFilter(false)}
              className="h-8 rounded-md bg-teal-700 px-3 text-[11px] font-medium text-white transition hover:bg-teal-800"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
