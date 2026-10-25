"use client";

import { useMemo, useState } from "react";

import {
  DESA_OPTIONS,
  KELOMPOK_BY_DESA,
  KELAS_OPTIONS,
} from "../../../backend/mudamudi/constants";

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
  selectedKelas: string;
  kegiatan: {
    id: number;
    nama: string;
    tanggal_mulai: string;
  }[];
  bulanOptions: BulanOption[];
  mudamudi: unknown[];
  adminDesa: string | null;
  onSearchChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onKegiatanChange: (value: string) => void;
  onDesaChange: (value: string) => void;
  onKelompokChange: (value: string) => void;
  onKelasChange: (value: string) => void;
};

const CONTROL_CLASS =
  "h-8 w-full min-w-0 rounded-md border border-gray-200 bg-white px-2 text-[11px] text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-100";

const LABEL_CLASS = "mb-1 block text-[10px] font-medium text-gray-500";

type Desa = keyof typeof KELOMPOK_BY_DESA;

const DESA_LIST: Desa[] = DESA_OPTIONS.filter(
  (desa): desa is Desa => desa in KELOMPOK_BY_DESA,
);

const KELOMPOK_LIST: string[] = Array.from(
  new Set<string>(
    Object.values(KELOMPOK_BY_DESA).flatMap((kelompok) => [...kelompok]),
  ),
).sort((a, b) => a.localeCompare(b, "id"));

function isDesa(value: string): value is Desa {
  return value in KELOMPOK_BY_DESA;
}

export default function RekapitulasiFilter({
  search,
  selectedMonth,
  selectedKegiatan,
  selectedDesa,
  selectedKelompok,
  selectedKelas,
  kegiatan,
  bulanOptions,
  adminDesa,
  onSearchChange,
  onMonthChange,
  onKegiatanChange,
  onDesaChange,
  onKelompokChange,
  onKelasChange,
}: Props) {
  const [showFilter, setShowFilter] = useState(false);

  const isSuperAdmin = adminDesa === null;

  const desaOptions = useMemo(() => DESA_LIST, []);

  const kelompokOptions = useMemo<string[]>(() => {
    const desaAktif = selectedDesa || adminDesa || "";

    if (desaAktif && isDesa(desaAktif)) {
      return [...KELOMPOK_BY_DESA[desaAktif]];
    }

    if (!isSuperAdmin) {
      return [];
    }

    return KELOMPOK_LIST;
  }, [selectedDesa, isSuperAdmin, adminDesa]);

  const activeFilterCount = [
    isSuperAdmin && selectedDesa,
    selectedKelompok,
    selectedKelas,
  ].filter(Boolean).length;

  const hasActiveFilter = activeFilterCount > 0;

  const handleDesaChange = (value: string) => {
    onDesaChange(value);

    if (!value) {
      return;
    }

    if (
      selectedKelompok &&
      (!isDesa(value) ||
        !(KELOMPOK_BY_DESA[value] as readonly string[]).includes(
          selectedKelompok,
        ))
    ) {
      onKelompokChange("");
    }
  };

  const handleReset = () => {
    onDesaChange(isSuperAdmin ? "" : (adminDesa ?? ""));
    onKelompokChange("");
    onKelasChange("");
  };

  const filteredKegiatan = useMemo(
    () =>
      [...kegiatan].sort(
        (a, b) =>
          b.tanggal_mulai.localeCompare(a.tanggal_mulai) || b.id - a.id,
      ),
    [kegiatan],
  );

  return (
    <section className="mb-2 space-y-2">
      {/* Filter utama */}
      <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_32px] items-end gap-x-3 gap-y-3 lg:grid-cols-[minmax(180px,1.35fr)_minmax(140px,0.8fr)_minmax(170px,1fr)_auto] lg:gap-x-4 lg:gap-y-3">
          {/* Pencarian */}
          <div className="col-span-3 min-w-0 lg:col-span-1">
            <label htmlFor="rekap-search" className={LABEL_CLASS}>
              Cari Muda-Mudi
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
                id="rekap-search"
                type="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Cari nama peserta..."
                className={`${CONTROL_CLASS} pl-8`}
              />
            </div>
          </div>

          {/* Periode */}
          <div className="min-w-0">
            <label htmlFor="rekap-month" className={LABEL_CLASS}>
              Periode
            </label>

            <select
              id="rekap-month"
              value={selectedMonth}
              onChange={(event) => onMonthChange(event.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Semua</option>
              {bulanOptions.map((bulan) => (
                <option key={bulan.value} value={bulan.value}>
                  {bulan.label}
                </option>
              ))}
            </select>
          </div>

          {/* Kegiatan */}
          <div className="min-w-0">
            <label htmlFor="rekap-kegiatan" className={LABEL_CLASS}>
              Kegiatan
            </label>

            <select
              id="rekap-kegiatan"
              value={selectedKegiatan}
              onChange={(event) => onKegiatanChange(event.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Semua</option>
              {filteredKegiatan.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter lanjutan */}
          <button
            type="button"
            onClick={() => setShowFilter((current) => !current)}
            aria-label={
              showFilter ? "Tutup filter lanjutan" : "Buka filter lanjutan"
            }
            aria-expanded={showFilter}
            aria-controls="rekap-filter-tambahan"
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

        {/* Reset filter */}
        {hasActiveFilter && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="px-1 py-0.5 text-[10px] font-medium text-teal-700 hover:text-teal-900"
            >
              Reset filter lanjutan
            </button>
          </div>
        )}
      </div>

      {/* Filter lanjutan */}
      {showFilter && (
        <div
          id="rekap-filter-tambahan"
          className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-[11px] font-semibold text-gray-700">
              Filter lanjutan
            </h3>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] font-medium text-red-600 hover:text-red-700"
              >
                Hapus pilihan
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
            {isSuperAdmin ? (
              <div className="min-w-0">
                <label htmlFor="rekap-desa" className={LABEL_CLASS}>
                  Desa
                </label>

                <select
                  id="rekap-desa"
                  value={selectedDesa}
                  onChange={(event) => handleDesaChange(event.target.value)}
                  className={CONTROL_CLASS}
                >
                  <option value="">Semua desa</option>
                  {desaOptions.map((desa) => (
                    <option key={desa} value={desa}>
                      {desa}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="min-w-0">
                <label className={LABEL_CLASS}>Desa</label>

                <div className="flex h-8 items-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 px-2 text-[11px] text-gray-600">
                  <span className="truncate">{adminDesa || "-"}</span>
                </div>
              </div>
            )}

            <div className="min-w-0">
              <label htmlFor="rekap-kelompok" className={LABEL_CLASS}>
                Kelompok
              </label>

              <select
                id="rekap-kelompok"
                value={selectedKelompok}
                onChange={(event) => onKelompokChange(event.target.value)}
                className={CONTROL_CLASS}
              >
                <option value="">Semua kelompok</option>
                {kelompokOptions.map((kelompok) => (
                  <option key={kelompok} value={kelompok}>
                    {kelompok}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 min-w-0 lg:col-span-1">
              <label htmlFor="rekap-kelas" className={LABEL_CLASS}>
                Kelas
              </label>

              <select
                id="rekap-kelas"
                value={selectedKelas}
                onChange={(event) => onKelasChange(event.target.value)}
                className={CONTROL_CLASS}
              >
                <option value="">Semua kelas</option>
                {KELAS_OPTIONS.map((kelas) => (
                  <option key={kelas} value={kelas}>
                    {kelas}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}