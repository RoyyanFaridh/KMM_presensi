
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
  selectedJenjang: string[];
  onJenjangChange: (value: string[]) => void;
  jenjangOptions: string[];
  selectedStatus: string[];
  onStatusChange: (value: string[]) => void;
  statusOptions: string[];
  onReset: () => void;
};

const CONTROL_CLASS =
  "h-9 w-full min-w-0 rounded-xl border border-[#E5EAE6] bg-white px-3 text-xs text-[#202824] placeholder:text-[#9AA39D] outline-none transition-colors focus:border-[#287A50] focus:ring-2 focus:ring-[#65B98A]/20";

const LABEL_CLASS = "mb-1.5 block text-xs font-medium text-[#78827C]";

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

  const allSelected =
    options.length > 0 && selected.length === options.length;

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
              className="inline-flex max-w-full items-center gap-1 rounded-lg border border-[#65B98A]/30 bg-[#E6F2EA] px-2 py-0.5 text-xs font-medium text-[#206440] transition hover:bg-[#E6F2EA]/80"
            >
              <span className="max-w-37.5 truncate">{option}</span>
              <span
                aria-hidden="true"
                className="shrink-0 font-bold text-[#287A50]"
              >
                ×
              </span>
            </button>
          ))}

          {selected.length > 1 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="px-1 text-xs text-[#9AA39D] transition hover:text-rose-600"
            >
              Hapus semua
            </button>
          )}
        </div>
      )}

      {allSelected && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="mt-1 text-xs font-medium text-[#287A50] hover:text-[#206440]"
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
  selectedJenjang,
  onJenjangChange,
  jenjangOptions,
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
    selectedJenjang,
    selectedStatus,
  ].filter((selected) => selected.length > 0).length;

  const hasActiveFilter = activeFilterCount > 0;
  const hasActiveSearch = search.trim().length > 0;
  const hasActiveCriteria = hasActiveFilter || hasActiveSearch;

  return (
    <section className="mb-4 space-y-3">
      <div className="rounded-2xl border border-[#E5EAE6] bg-white p-3.5 shadow-sm sm:p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_36px] items-end gap-x-3 gap-y-3 lg:grid-cols-[minmax(180px,1fr)_auto]">
          <div className="min-w-0">
            <label htmlFor="monitoring-search" className={LABEL_CLASS}>
              Cari Generus
            </label>

            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA39D]"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>

              <input
                id="monitoring-search"
                type="text"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Cari nama Generus..."
                className={`${CONTROL_CLASS} pl-9 pr-8`}
              />

              {search.length > 0 && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[#9AA39D] transition hover:bg-[#F5F7F5] hover:text-[#202824]"
                >
                  <svg
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
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors lg:h-9 lg:w-auto lg:min-w-28 lg:gap-2 lg:px-3 ${showFilter || hasActiveFilter
                ? "border-[#287A50] bg-[#E6F2EA] font-medium text-[#287A50]"
                : "border-[#E5EAE6] bg-white text-[#78827C] hover:bg-[#F5F7F5] hover:text-[#202824]"
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

            <span className="hidden text-xs font-medium lg:inline">
              Filter
            </span>

            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#287A50] px-1 text-[10px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className={`hidden h-3.5 w-3.5 shrink-0 transition-transform lg:inline ${showFilter ? "rotate-180" : ""
                }`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {hasActiveCriteria && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5EAE6] pt-2.5">
            <p className="text-xs text-[#78827C]">
              {hasActiveFilter
                ? `${activeFilterCount} kategori filter aktif`
                : "Pencarian aktif"}
            </p>

            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-[#287A50] transition hover:text-[#206440]"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>

      {showFilter && (
        <div
          id="monitoring-filter-panel"
          className="rounded-2xl border border-[#E5EAE6] bg-white p-4 shadow-sm"
        >
          <div className="mb-3.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-[#202824]">
                Filter lanjutan
              </h3>
              <p className="mt-0.5 text-xs text-[#78827C]">
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
                  onJenjangChange([]);
                  onStatusChange([]);
                }}
                className="shrink-0 text-xs font-medium text-rose-600 transition hover:text-rose-700"
              >
                Hapus pilihan
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5 lg:gap-4">
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
              id="monitoring-jenjang"
              label="Jenjang"
              options={jenjangOptions}
              selected={selectedJenjang}
              onChange={onJenjangChange}
            />

            <FilterSelect
              id="monitoring-status"
              label="Status Presensi"
              options={statusOptions}
              selected={selectedStatus}
              onChange={onStatusChange}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E5EAE6] pt-3">
            <button
              type="button"
              onClick={onReset}
              disabled={!hasActiveCriteria}
              className="text-xs font-medium text-[#78827C] transition hover:text-[#202824] disabled:cursor-not-allowed disabled:text-[#9AA39D]"
            >
              Reset semua filter
            </button>

            <button
              type="button"
              onClick={() => setShowFilter(false)}
              className="h-8.5 rounded-xl bg-[#287A50] px-4 text-xs font-medium text-white shadow-sm transition hover:bg-[#206440]"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
