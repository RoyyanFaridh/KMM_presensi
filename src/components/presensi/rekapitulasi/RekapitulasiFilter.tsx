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
  "h-10 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 sm:h-9 sm:text-[12px]";

const LABEL_CLASS =
  "mb-1.5 block text-[11px] font-medium text-gray-600 sm:text-xs";

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
        (a, b) => b.tanggal_mulai.localeCompare(a.tanggal_mulai) || b.id - a.id,
      ),
    [kegiatan],
  );

  return (
    <section className="mb-5">
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-4 lg:grid-cols-[minmax(220px,1.4fr)_minmax(150px,0.8fr)_minmax(190px,1fr)_auto] lg:items-end lg:gap-3">
        <div className="col-span-2 min-w-0 lg:col-span-1">
          <label htmlFor="rekap-search" className={LABEL_CLASS}>
            Cari Muda-Mudi
          </label>

          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
              placeholder="Cari nama..."
              className={`${CONTROL_CLASS} pl-9`}
            />
          </div>
        </div>

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
            <option value="">Semua periode</option>
            {bulanOptions.map((bulan) => (
              <option key={bulan.value} value={bulan.value}>
                {bulan.label}
              </option>
            ))}
          </select>
        </div>

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
            <option value="">Semua kegiatan</option>
            {filteredKegiatan.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 min-w-0 sm:col-span-1 lg:col-span-1">
          <button
            type="button"
            onClick={() => setShowFilter((current) => !current)}
            aria-expanded={showFilter}
            aria-controls="rekap-filter-tambahan"
            className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg border px-3 text-xs font-medium transition sm:h-9 sm:w-auto sm:min-w-28 sm:text-[12px] ${
              showFilter || activeFilterCount > 0
                ? "border-teal-200 bg-teal-50 text-teal-700"
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

            <span>Filter</span>

            {activeFilterCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-600 px-1 text-[9px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                showFilter ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {showFilter && (
        <div
          id="rekap-filter-tambahan"
          className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:mt-3 sm:p-5"
        >
          <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-gray-800">
                Filter tambahan
              </h3>

              <p className="mt-1 text-[10px] leading-4 text-gray-400 sm:text-[11px]">
                Persempit data berdasarkan wilayah dan kelas.
              </p>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="self-start text-[11px] font-medium text-teal-700 transition hover:text-teal-800 sm:self-auto"
              >
                Reset filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-4 lg:grid-cols-3">
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

                <div className="flex h-10 items-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50 px-3 text-xs text-gray-600 sm:h-9 sm:text-[12px]">
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

            <div className="col-span-2 min-w-0 sm:col-span-1">
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
