"use client";

import { useEffect, useMemo, useState } from "react";

import { getRekapitulasiPresensi } from "../../../backend/presensi/actions";

import type { RekapitulasiPresensi } from "../../../backend/presensi/types";

import { formatRentangTanggal } from "../../../backend/kegiatan/format";

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

export default function RekapitulasiPage() {
  const [data, setData] = useState<RekapitulasiPresensi>({
    mudamudi: [],
    kegiatan: [],
    kehadiran: [],
  });

  const [search, setSearch] = useState("");
  const [selectedBulan, setSelectedBulan] = useState("");
  const [selectedKegiatan, setSelectedKegiatan] = useState("");
  const [selectedDesa, setSelectedDesa] = useState("");
  const [selectedKelompok, setSelectedKelompok] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const result = await getRekapitulasiPresensi();

        if (result.error) {
          setError(result.error);
          return;
        }

        setData(result.data);
      } catch (err) {
        console.error(err);

        setError("Terjadi kesalahan saat memuat rekapitulasi presensi.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
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
      .map(([value, label]) => ({
        value,
        label,
      }));
  }, [data.kegiatan]);

  const kegiatanOptions = useMemo(() => {
    return [...data.kegiatan]
      .filter((kegiatan) => {
        if (!selectedBulan) {
          return true;
        }

        return getMonthValue(kegiatan.tanggal_mulai) === selectedBulan;
      })
      .sort(
        (a, b) =>
          new Date(`${b.tanggal_mulai}T00:00:00+07:00`).getTime() -
          new Date(`${a.tanggal_mulai}T00:00:00+07:00`).getTime(),
      );
  }, [data.kegiatan, selectedBulan]);

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

  const filteredMudaMudi = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return data.mudamudi.filter((mudamudi) => {
      const matchesSearch =
        keyword === "" || mudamudi.nama.toLowerCase().includes(keyword);

      const matchesDesa = !selectedDesa || mudamudi.desa === selectedDesa;

      const matchesKelompok =
        !selectedKelompok || mudamudi.kelompok === selectedKelompok;

      return matchesSearch && matchesDesa && matchesKelompok;
    });
  }, [data.mudamudi, search, selectedDesa, selectedKelompok]);

  const filteredKegiatan = useMemo(() => {
    return kegiatanOptions.filter(
      (kegiatan) =>
        !selectedKegiatan || kegiatan.id.toString() === selectedKegiatan,
    );
  }, [kegiatanOptions, selectedKegiatan]);

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
            search={search}
            selectedMonth={selectedBulan}
            selectedKegiatan={selectedKegiatan}
            selectedDesa={selectedDesa}
            selectedKelompok={selectedKelompok}
            kegiatan={kegiatanOptions}
            bulanOptions={bulanOptions}
            mudamudi={data.mudamudi}
            onSearchChange={setSearch}
            onMonthChange={setSelectedBulan}
            onKegiatanChange={setSelectedKegiatan}
            onDesaChange={(value) => {
              setSelectedDesa(value);
              setSelectedKelompok("");
            }}
            onKelompokChange={setSelectedKelompok}
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
                  : `${filteredMudaMudi.length} Muda-Mudi • ${filteredKegiatan.length} kegiatan`}
              </p>
            </div>

            {!loading && <RekapitulasiLegend />}
          </div>

          <div className="min-h-0 flex-1">
            <RekapitulasiTable
              loading={loading}
              mudaMudi={filteredMudaMudi}
              kegiatan={filteredKegiatan}
              kehadiran={data.kehadiran}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
