"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getRekapitulasiPresensi,
  getRekapitulasiPresensiExport,
  getRekapitulasiKegiatanExportOptions,
} from "../../../backend/presensi/actions";

import type {
  RekapitulasiPresensi,
  RekapitulasiKegiatan,
} from "../../../backend/presensi/types";

import { exportRekapitulasiExcel } from "../../../backend/presensi/exportRekapitulasiExcel";

import RekapitulasiFilter from "./RekapitulasiFilter";
import RekapitulasiTable from "./RekapitulasiTable";
import RekapitulasiExportModal, {
  type ExportFilters,
} from "./RekapitulasiExportModal";

function getMonthValue(tanggal: string) {
  return tanggal.slice(0, 7);
}

function formatBulan(tanggal: string) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${tanggal}T00:00:00+07:00`));
}

type RekapitulasiResult = {
  data: RekapitulasiPresensi;
  pagination: {
    page: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
  error?: string;
};

type Props = {
  adminDesa: string | null;
};

const EMPTY_DATA: RekapitulasiPresensi = {
  mudamudi: [],
  kegiatan: [],
  kehadiran: [],
};

const EMPTY_EXPORT_FILTERS: ExportFilters = {
  bulan: "",
  kegiatanId: "",
  desa: [],
  kelompok: [],
  kelas: [],
  search: "",
};

export default function RekapitulasiPage({ adminDesa }: Props) {
  const [data, setData] = useState<RekapitulasiPresensi>(EMPTY_DATA);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [selectedBulan, setSelectedBulan] = useState("");
  const [selectedKegiatan, setSelectedKegiatan] = useState("");
  const [selectedDesa, setSelectedDesa] = useState(adminDesa ?? "");
  const [selectedKelompok, setSelectedKelompok] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  const [allExportKegiatan, setAllExportKegiatan] = useState<
    RekapitulasiKegiatan[]
  >([]);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilters, setExportFilters] =
    useState<ExportFilters>(EMPTY_EXPORT_FILTERS);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedDesa(adminDesa ?? "");
    setSelectedKelompok("");
  }, [adminDesa]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = searchInput.trim();

      if (nextSearch !== search) {
        setCurrentPage(1);
        setSearch(nextSearch);
      }
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput, search]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const result = (await getRekapitulasiPresensi({
          page: currentPage,
          itemsPerPage,
          search,
          bulan: selectedBulan || undefined,
          kegiatanId: selectedKegiatan ? Number(selectedKegiatan) : undefined,
          desa: selectedDesa || undefined,
          kelompok: selectedKelompok || undefined,
          kelas: selectedKelas || undefined,
        })) as RekapitulasiResult;

        if (cancelled) return;

        if ("error" in result) {
          setError(result.error ?? "Gagal memuat data rekapitulasi.");
          // Jangan menghapus data sebelumnya saat pembaruan gagal.
          return;
        }

        setData(result.data);
        setTotalItems(result.pagination.totalItems);
      } catch (err) {
        if (cancelled) return;

        console.error("Gagal memuat rekapitulasi:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat rekapitulasi presensi.",
        );

        // Data sebelumnya tetap ditampilkan jika request gagal.
      } finally {
        if (!cancelled) {
          setLoading(false);
          setHasLoaded(true);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [
    currentPage,
    itemsPerPage,
    search,
    selectedBulan,
    selectedKegiatan,
    selectedDesa,
    selectedKelompok,
    selectedKelas,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadExportOptions() {
      try {
        const result = await getRekapitulasiKegiatanExportOptions();

        if (cancelled) return;

        if ("error" in result) {
          console.error("Gagal memuat pilihan kegiatan ekspor:", result.error);
          return;
        }

        setAllExportKegiatan(result.data);
      } catch (err) {
        if (!cancelled) {
          console.error("Gagal memuat pilihan kegiatan ekspor:", err);
        }
      }
    }

    void loadExportOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  const bulanOptions = useMemo(() => {
    const bulan = new Map<string, string>();

    data.kegiatan.forEach((kegiatan) => {
      const value = getMonthValue(kegiatan.tanggal_mulai);

      if (!bulan.has(value)) {
        bulan.set(value, formatBulan(kegiatan.tanggal_mulai));
      }
    });

    return Array.from(bulan.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([value, label]) => ({ value, label }));
  }, [data.kegiatan]);

  const kegiatanOptions = useMemo(() => {
    return [...data.kegiatan].sort(
      (a, b) =>
        new Date(`${b.tanggal_mulai}T00:00:00+07:00`).getTime() -
        new Date(`${a.tanggal_mulai}T00:00:00+07:00`).getTime(),
    );
  }, [data.kegiatan]);

  useEffect(() => {
    if (
      selectedKegiatan &&
      !kegiatanOptions.some(
        (kegiatan) => kegiatan.id.toString() === selectedKegiatan,
      )
    ) {
      setCurrentPage(1);
      setSelectedKegiatan("");
    }
  }, [kegiatanOptions, selectedKegiatan]);

  const filteredKegiatan = useMemo(() => {
    return kegiatanOptions.filter(
      (kegiatan) =>
        !selectedKegiatan || kegiatan.id.toString() === selectedKegiatan,
    );
  }, [kegiatanOptions, selectedKegiatan]);

  const exportBulanOptions = useMemo(() => {
    const bulan = new Map<string, string>();

    allExportKegiatan.forEach((kegiatan) => {
      const value = getMonthValue(kegiatan.tanggal_mulai);

      if (!bulan.has(value)) {
        bulan.set(value, formatBulan(kegiatan.tanggal_mulai));
      }
    });

    return Array.from(bulan.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([value, label]) => ({ value, label }));
  }, [allExportKegiatan]);

  const exportKegiatanOptions = useMemo(() => {
    return [...allExportKegiatan]
      .filter(
        (kegiatan) =>
          !exportFilters.bulan ||
          getMonthValue(kegiatan.tanggal_mulai) === exportFilters.bulan,
      )
      .sort(
        (a, b) =>
          new Date(`${b.tanggal_mulai}T00:00:00+07:00`).getTime() -
          new Date(`${a.tanggal_mulai}T00:00:00+07:00`).getTime(),
      );
  }, [allExportKegiatan, exportFilters.bulan]);

  useEffect(() => {
    if (
      exportFilters.kegiatanId &&
      !exportKegiatanOptions.some(
        (kegiatan) => kegiatan.id.toString() === exportFilters.kegiatanId,
      )
    ) {
      setExportFilters((previous) => ({
        ...previous,
        kegiatanId: "",
      }));
    }
  }, [exportKegiatanOptions, exportFilters.kegiatanId]);

  function openExportModal() {
    setExportFilters({
      bulan: selectedBulan,
      kegiatanId: selectedKegiatan,
      desa: selectedDesa ? [selectedDesa] : [],
      kelompok: selectedKelompok ? [selectedKelompok] : [],
      kelas: selectedKelas ? [selectedKelas] : [],
      search: searchInput,
    });

    setShowExportModal(true);
  }

  function closeExportModal() {
    if (exportLoading) return;
    setShowExportModal(false);
  }

  async function handleExportExcel(filters: ExportFilters) {
    setExportLoading(true);

    try {
      const exportParams = {
        bulan: filters.bulan || undefined,
        kegiatanId: filters.kegiatanId ? Number(filters.kegiatanId) : undefined,
        desa:
          adminDesa !== null
            ? [adminDesa]
            : filters.desa.length > 0
              ? filters.desa
              : undefined,
        kelompok: filters.kelompok.length > 0 ? filters.kelompok : undefined,
        kelas: filters.kelas.length > 0 ? filters.kelas : undefined,
        search: filters.search.trim() || undefined,
      };

      const result = await getRekapitulasiPresensiExport(exportParams);

      if ("error" in result) {
        throw new Error(result.error);
      }

      await exportRekapitulasiExcel({
        data: result.data,
        filters: exportParams,
      });

      setShowExportModal(false);
    } finally {
      setExportLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!showExportModal) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !exportLoading) {
        setShowExportModal(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showExportModal, exportLoading]);

  function updateFilter<T>(setter: (value: T) => void, value: T) {
    setCurrentPage(1);
    setter(value);
  }

  function handleItemsPerPageChange(value: number) {
    setCurrentPage(1);
    setItemsPerPage(value);
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
        <div className="shrink-0">
          <div className="mb-6 flex items-center justify-between gap-3 sm:items-end">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600 sm:text-[10px]">
                Presensi
              </p>

              <div className="mt-1.5">
                <h1 className="text-base font-semibold tracking-tight text-gray-900 sm:text-xl">
                  Rekapitulasi Presensi
                </h1>

                <p className="mt-1 max-w-xs text-[10px] leading-4 text-gray-500 sm:max-w-none sm:text-xs">
                  Lihat riwayat kehadiran Muda-Mudi pada setiap kegiatan.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openExportModal}
              aria-label="Ekspor Excel"
              title="Ekspor Excel"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:h-9 sm:w-auto sm:gap-2 sm:rounded-lg sm:px-4"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-5 w-5 sm:h-4 sm:w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3"
                />
              </svg>
              <span className="hidden text-[11px] font-semibold sm:inline">
                Ekspor Excel
              </span>
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[11px] leading-5 text-red-700"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5m0 3h.01" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <RekapitulasiFilter
            search={searchInput}
            selectedMonth={selectedBulan}
            selectedKegiatan={selectedKegiatan}
            selectedDesa={selectedDesa}
            selectedKelompok={selectedKelompok}
            selectedKelas={selectedKelas}
            kegiatan={kegiatanOptions}
            bulanOptions={bulanOptions}
            mudamudi={data.mudamudi}
            adminDesa={adminDesa}
            onSearchChange={setSearchInput}
            onMonthChange={(value) => updateFilter(setSelectedBulan, value)}
            onKegiatanChange={(value) =>
              updateFilter(setSelectedKegiatan, value)
            }
            onDesaChange={(value) => {
              setCurrentPage(1);
              setSelectedDesa(value);
              setSelectedKelompok("");
            }}
            onKelompokChange={(value) =>
              updateFilter(setSelectedKelompok, value)
            }
            onKelasChange={(value) => updateFilter(setSelectedKelas, value)}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading && hasLoaded && (
            <div
              role="status"
              className="flex shrink-0 items-center gap-2 border-b border-teal-100 bg-teal-50/70 px-4 py-2 text-[10px] text-teal-800"
            >
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-teal-200 border-t-teal-700" />
              Memperbarui rekapitulasi...
            </div>
          )}

          <div className="min-h-0 flex-1" aria-busy={loading}>
            <RekapitulasiTable
              loading={loading && !hasLoaded}
              mudaMudi={data.mudamudi}
              kegiatan={filteredKegiatan}
              kehadiran={data.kehadiran}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onItemsPerPageChange={handleItemsPerPageChange}
              onGoToPage={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {showExportModal && (
        <RekapitulasiExportModal
          adminDesa={adminDesa}
          filters={exportFilters}
          bulanOptions={exportBulanOptions}
          kegiatanOptions={exportKegiatanOptions}
          onFiltersChange={setExportFilters}
          onClose={closeExportModal}
          onExport={handleExportExcel}
        />
      )}
    </main>
  );
}
