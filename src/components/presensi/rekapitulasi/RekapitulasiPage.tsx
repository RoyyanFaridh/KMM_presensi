"use client";

import { useEffect, useMemo, useState } from "react";

import { getRekapitulasiPresensi } from "../../../backend/presensi/actions";

import type { RekapitulasiPresensi } from "../../../backend/presensi/types";

import RekapitulasiFilter from "./RekapitulasiFilter";
import RekapitulasiLegend from "./RekapitulasiLegend";
import RekapitulasiTable from "./RekapitulasiTable";

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

const EMPTY_DATA: RekapitulasiPresensi = {
  mudamudi: [],
  kegiatan: [],
  kehadiran: [],
};

export default function RekapitulasiPage() {
  const [data, setData] = useState<RekapitulasiPresensi>(EMPTY_DATA);

  /*
   * searchInput = nilai yang sedang diketik user.
   *
   * search = nilai yang sudah melewati debounce dan
   * benar-benar digunakan untuk request server.
   */
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [selectedBulan, setSelectedBulan] = useState("");
  const [selectedKegiatan, setSelectedKegiatan] = useState("");
  const [selectedDesa, setSelectedDesa] = useState("");
  const [selectedKelompok, setSelectedKelompok] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ============================================================
   * DEBOUNCE SEARCH
   * ============================================================
   *
   * User bisa mengetik:
   *
   * A
   * Ah
   * Ahm
   * Ahma
   * Ahmad
   *
   * Tetapi server hanya dipanggil setelah user berhenti
   * mengetik selama 400 ms.
   */

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  /*
   * Setiap filter berubah, kembali ke halaman pertama.
   *
   * Search menggunakan state "search", bukan "searchInput",
   * supaya perubahan setiap karakter tidak langsung
   * melakukan request.
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    selectedBulan,
    selectedKegiatan,
    selectedDesa,
    selectedKelompok,
    selectedKelas,
    itemsPerPage,
  ]);

  /*
   * ============================================================
   * LOAD DATA
   * ============================================================
   */

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

        if (cancelled) {
          return;
        }

        if (result.error) {
          setError(result.error);
          setData(EMPTY_DATA);
          setTotalItems(0);

          return;
        }

        setData(result.data);
        setTotalItems(result.pagination.totalItems);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Gagal memuat rekapitulasi:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat rekapitulasi presensi.",
        );

        setData(EMPTY_DATA);
        setTotalItems(0);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

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

  /*
   * ============================================================
   * BULAN OPTIONS
   * ============================================================
   */

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
      .map(([value, label]) => ({
        value,
        label,
      }));
  }, [data.kegiatan]);

  /*
   * ============================================================
   * KEGIATAN OPTIONS
   * ============================================================
   */

  const kegiatanOptions = useMemo(() => {
    return [...data.kegiatan].sort(
      (a, b) =>
        new Date(`${b.tanggal_mulai}T00:00:00+07:00`).getTime() -
        new Date(`${a.tanggal_mulai}T00:00:00+07:00`).getTime(),
    );
  }, [data.kegiatan]);

  /*
   * Jika kegiatan yang sedang dipilih sudah tidak tersedia
   * setelah filter berubah, reset pilihan kegiatan.
   */

  useEffect(() => {
    if (
      selectedKegiatan &&
      !kegiatanOptions.some(
        (kegiatan) => kegiatan.id.toString() === selectedKegiatan,
      )
    ) {
      setSelectedKegiatan("");
    }
  }, [kegiatanOptions, selectedKegiatan]);

  const filteredKegiatan = useMemo(() => {
    return kegiatanOptions.filter(
      (kegiatan) =>
        !selectedKegiatan || kegiatan.id.toString() === selectedKegiatan,
    );
  }, [kegiatanOptions, selectedKegiatan]);

  /*
   * ============================================================
   * PAGINATION
   * ============================================================
   */

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <main className="flex min-h-0 flex-1 flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
        <div className="shrink-0">
          <div className="mb-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
              Presensi
            </p>

            <div className="mt-1">
              <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                Rekapitulasi Presensi
              </h1>

              <p className="mt-1 max-w-xs text-[10px] leading-4 text-gray-500 sm:max-w-none sm:text-xs">
                Lihat riwayat kehadiran Muda-Mudi pada setiap kegiatan.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
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
            onSearchChange={setSearchInput}
            onMonthChange={setSelectedBulan}
            onKegiatanChange={setSelectedKegiatan}
            onDesaChange={(value) => {
              setSelectedDesa(value);
              setSelectedKelompok("");
            }}
            onKelompokChange={setSelectedKelompok}
            onKelasChange={setSelectedKelas}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex shrink-0 flex-col gap-3 border-b border-gray-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Rekap Kehadiran
              </h2>

              <p className="mt-0.5 text-[10px] text-gray-500 sm:text-[11px]">
                {loading
                  ? "Memuat data..."
                  : `${totalItems} Muda-Mudi • ${filteredKegiatan.length} kegiatan`}
              </p>
            </div>

            {!loading && <RekapitulasiLegend />}
          </div>

          <div className="min-h-0 flex-1">
            <RekapitulasiTable
              loading={loading}
              mudaMudi={data.mudamudi}
              kegiatan={filteredKegiatan}
              kehadiran={data.kehadiran}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onItemsPerPageChange={setItemsPerPage}
              onGoToPage={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
