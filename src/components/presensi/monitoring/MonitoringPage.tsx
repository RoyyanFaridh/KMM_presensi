"use client";

import { useMemo, useRef, useState } from "react";

import {
  getMonitoringPresensi,
  updatePresensiStatus,
} from "../../../backend/presensi/actions";

import { Kegiatan } from "../../../backend/kegiatan/types";

import {
  MonitoringPeserta,
  MonitoringPresensi,
  PresensiStatus,
} from "../../../backend/presensi/types";

import MonitoringKegiatanSelector from "./MonitoringKegiatanSelector";
import MonitoringSummary from "./MonitoringSummary";
import MonitoringFilters from "./MonitoringFilters";
import MonitoringTable from "./MonitoringTable";
import MonitoringDetailModal from "./MonitoringDetailModal";
import MonitoringEditModal from "./MonitoringEditModal";

type Props = {
  kegiatan: Kegiatan[];
};

type MonitoringResult =
  | {
      data: MonitoringPresensi | null;
      error: string;
    }
  | {
      data: MonitoringPresensi;
      error?: never;
    };

const STATUS_OPTIONS = [
  "Hadir",
  "Terlambat",
  "Izin",
  "Sakit",
  "Alpa",
  "Belum Hadir",
];

function getPesertaStatus(peserta: MonitoringPeserta): string {
  if (!peserta.status) {
    return "Belum Hadir";
  }

  const statusMap: Record<string, string> = {
    hadir: "Hadir",
    terlambat: "Terlambat",
    izin: "Izin",
    sakit: "Sakit",
    alpa: "Alpa",
    "belum hadir": "Belum Hadir",
  };

  const normalizedStatus = String(peserta.status)
    .trim()
    .toLocaleLowerCase("id");

  return statusMap[normalizedStatus] ?? String(peserta.status);
}

function getUniqueSortedValues(
  values: Array<string | null | undefined>,
): string[] {
  return [
    ...new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((a, b) => a.localeCompare(b, "id"));
}

export default function MonitoringPage({ kegiatan }: Props) {
  const [selectedKegiatanId, setSelectedKegiatanId] = useState<number | null>(
    null,
  );

  const [data, setData] = useState<MonitoringPresensi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedDesa, setSelectedDesa] = useState<string[]>([]);
  const [selectedKelompok, setSelectedKelompok] = useState<string[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  const [detailPeserta, setDetailPeserta] = useState<MonitoringPeserta | null>(
    null,
  );

  const [editPeserta, setEditPeserta] = useState<MonitoringPeserta | null>(
    null,
  );

  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const requestIdRef = useRef(0);

  function resetFilters() {
    setSearch("");
    setSelectedDesa([]);
    setSelectedKelompok([]);
    setSelectedKelas([]);
    setSelectedStatus([]);
  }

  async function loadMonitoring(kegiatanId: number) {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError("");

    try {
      const result = (await getMonitoringPresensi(
        kegiatanId,
      )) as MonitoringResult;

      if (requestId !== requestIdRef.current) return;

      if ("error" in result && result.error) {
        setError(result.error);
        setData(null);
        return;
      }

      setData(result.data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      console.error(err);
      setError("Terjadi kesalahan saat memuat data monitoring.");
      setData(null);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  function handleSelectKegiatan(kegiatanId: number) {
    if (kegiatanId === selectedKegiatanId && data) return;

    setSelectedKegiatanId(kegiatanId);
    resetFilters();
    setError("");
    setData(null);
    setDetailPeserta(null);
    setEditPeserta(null);
    setEditError("");

    void loadMonitoring(kegiatanId);
  }

  function handleDesaChange(nextDesa: string[]) {
    setSelectedDesa(nextDesa);

    if (!data) {
      setSelectedKelompok([]);
      return;
    }

    const pesertaSesuaiDesa =
      nextDesa.length > 0
        ? data.peserta.filter(
            (peserta) => peserta.desa && nextDesa.includes(peserta.desa),
          )
        : data.peserta;

    const kelompokTersedia = new Set(
      getUniqueSortedValues(
        pesertaSesuaiDesa.map((peserta) => peserta.kelompok),
      ),
    );

    setSelectedKelompok((current) =>
      current.filter((kelompok) => kelompokTersedia.has(kelompok)),
    );
  }

  function handleOpenDetail(peserta: MonitoringPeserta) {
    setDetailPeserta(peserta);
  }

  function handleOpenEdit(peserta: MonitoringPeserta) {
    setEditError("");
    setEditPeserta(peserta);
  }

  function handleCloseEdit() {
    if (editLoading) return;

    setEditPeserta(null);
    setEditError("");
  }

  async function handleSaveStatus(status: PresensiStatus, keterangan: string) {
    if (!editPeserta || selectedKegiatanId === null) return;

    setEditLoading(true);
    setEditError("");

    try {
      const result = await updatePresensiStatus({
        presensiId: editPeserta.presensi_id,
        kegiatanId: selectedKegiatanId,
        mudamudiId: editPeserta.mudamudi_id,
        status,
        keterangan,
      });

      if (!result.success) {
        setEditError(result.error || "Data presensi gagal diperbarui.");
        return;
      }

      setEditPeserta(null);
      await loadMonitoring(selectedKegiatanId);
    } catch (err) {
      console.error(err);
      setEditError("Terjadi kesalahan saat memperbarui data presensi.");
    } finally {
      setEditLoading(false);
    }
  }

  const desaOptions = useMemo(() => {
    if (!data) return [];

    return getUniqueSortedValues(data.peserta.map((peserta) => peserta.desa));
  }, [data]);

  const kelompokOptions = useMemo(() => {
    if (!data) return [];

    const pesertaSesuaiDesa =
      selectedDesa.length > 0
        ? data.peserta.filter(
            (peserta) => peserta.desa && selectedDesa.includes(peserta.desa),
          )
        : data.peserta;

    return getUniqueSortedValues(
      pesertaSesuaiDesa.map((peserta) => peserta.kelompok),
    );
  }, [data, selectedDesa]);

  const kelasOptions = useMemo(() => {
    if (!data) return [];

    return getUniqueSortedValues(data.peserta.map((peserta) => peserta.kelas));
  }, [data]);

  const filteredPeserta = useMemo(() => {
    if (!data) return [];

    const keyword = search.trim().toLocaleLowerCase("id");

    return data.peserta.filter((peserta) => {
      const cocokPencarian =
        !keyword || peserta.nama.toLocaleLowerCase("id").includes(keyword);

      const cocokDesa =
        selectedDesa.length === 0 ||
        (peserta.desa !== null && selectedDesa.includes(peserta.desa));

      const cocokKelompok =
        selectedKelompok.length === 0 ||
        (peserta.kelompok !== null &&
          selectedKelompok.includes(peserta.kelompok));

      const cocokKelas =
        selectedKelas.length === 0 ||
        (peserta.kelas !== null && selectedKelas.includes(peserta.kelas));

      const cocokStatus =
        selectedStatus.length === 0 ||
        selectedStatus.includes(getPesertaStatus(peserta));

      return (
        cocokPencarian &&
        cocokDesa &&
        cocokKelompok &&
        cocokKelas &&
        cocokStatus
      );
    });
  }, [
    data,
    search,
    selectedDesa,
    selectedKelompok,
    selectedKelas,
    selectedStatus,
  ]);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
          Presensi
        </p>

        <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-gray-900">
          Monitoring Presensi
        </h1>

        <p className="mt-0.5 text-xs text-gray-500">
          Pantau dan kelola kehadiran peserta berdasarkan kegiatan.
        </p>
      </div>

      <MonitoringKegiatanSelector
        kegiatan={kegiatan}
        selectedKegiatanId={selectedKegiatanId}
        onSelect={handleSelectKegiatan}
      />

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600" />
          <p className="mt-3 text-xs text-gray-500">
            Memuat data monitoring...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-xs font-medium text-red-700">{error}</p>

          {selectedKegiatanId !== null && (
            <button
              type="button"
              onClick={() => void loadMonitoring(selectedKegiatanId)}
              className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
            >
              Coba Lagi
            </button>
          )}
        </div>
      )}

      {!loading && !error && !data && kegiatan.length > 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center">
          <p className="text-xs font-medium text-gray-700">
            Pilih kegiatan untuk melihat monitoring.
          </p>

          <p className="mt-1 text-[11px] text-gray-500">
            Data presensi akan ditampilkan setelah kegiatan dipilih.
          </p>
        </div>
      )}

      {!loading && !error && kegiatan.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center">
          <p className="text-xs font-medium text-gray-700">
            Belum ada kegiatan yang tersedia.
          </p>

          <p className="mt-1 text-[11px] text-gray-500">
            Tambahkan kegiatan terlebih dahulu untuk melakukan monitoring
            presensi.
          </p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <MonitoringSummary
            totalPeserta={data.totalPeserta}
            totalHadir={data.totalHadir}
            totalTerlambat={data.totalTerlambat}
            totalIzin={data.totalIzin}
            totalSakit={data.totalSakit}
            totalAlpa={data.totalAlpa}
            totalBelumHadir={data.totalBelumHadir}
          />

          {data.totalAlpa > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-medium text-red-800">
                Terdapat {data.totalAlpa} peserta dengan status Alpa.
              </p>

              <p className="mt-0.5 text-[11px] text-red-700">
                Status Alpa dapat diberikan secara manual oleh admin atau secara
                otomatis oleh sistem setelah kegiatan berakhir apabila peserta
                belum melakukan presensi.
              </p>
            </div>
          )}

          <div className="w-full min-w-0 rounded-xl border border-gray-200 bg-white">
            <div className="w-full min-w-0 space-y-4 border-b border-gray-200 p-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Data Presensi Peserta
                </h2>

                <p className="mt-1 text-[11px] text-gray-500">
                  Menampilkan{" "}
                  <span className="font-semibold text-gray-700">
                    {filteredPeserta.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-gray-700">
                    {data.peserta.length}
                  </span>{" "}
                  peserta yang terdaftar dalam kegiatan ini.
                </p>
              </div>

              <div className="block w-full min-w-0">
                <MonitoringFilters
                  search={search}
                  onSearchChange={setSearch}
                  selectedDesa={selectedDesa}
                  onDesaChange={handleDesaChange}
                  desaOptions={desaOptions}
                  selectedKelompok={selectedKelompok}
                  onKelompokChange={setSelectedKelompok}
                  kelompokOptions={kelompokOptions}
                  selectedKelas={selectedKelas}
                  onKelasChange={setSelectedKelas}
                  kelasOptions={kelasOptions}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  statusOptions={STATUS_OPTIONS}
                  onReset={resetFilters}
                />
              </div>
            </div>

            {filteredPeserta.length > 0 ? (
              <MonitoringTable
                peserta={filteredPeserta}
                onDetail={handleOpenDetail}
                onEdit={handleOpenEdit}
              />
            ) : (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-medium text-gray-700">
                  Peserta tidak ditemukan
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Tidak ada peserta yang sesuai dengan pencarian atau filter
                  yang dipilih.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-3 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Reset Pencarian dan Filter
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <MonitoringDetailModal
        peserta={detailPeserta}
        onClose={() => setDetailPeserta(null)}
      />

      <MonitoringEditModal
        peserta={editPeserta}
        loading={editLoading}
        error={editError}
        onClose={handleCloseEdit}
        onSave={handleSaveStatus}
      />
    </div>
  );
}
