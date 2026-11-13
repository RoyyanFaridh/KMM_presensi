
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
import BeritaAcaraModal from "./BeritaAcaraModal";

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
  if (!peserta.status) return "Belum Hadir";

  const normalizedStatus = String(peserta.status)
    .trim()
    .toLocaleLowerCase("id");

  const statusMap: Record<string, string> = {
    hadir: "Hadir",
    terlambat: "Terlambat",
    izin: "Izin",
    sakit: "Sakit",
    alpa: "Alpa",
    "belum hadir": "Belum Hadir",
  };

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

function calculateTotals(peserta: MonitoringPeserta[]) {
  const totals = {
    totalHadir: 0,
    totalTerlambat: 0,
    totalIzin: 0,
    totalSakit: 0,
    totalAlpa: 0,
    totalBelumHadir: 0,
  };

  for (const item of peserta) {
    switch (String(item.status ?? "").trim().toLowerCase()) {
      case "hadir":
        totals.totalHadir++;
        break;
      case "terlambat":
        totals.totalTerlambat++;
        break;
      case "izin":
        totals.totalIzin++;
        break;
      case "sakit":
        totals.totalSakit++;
        break;
      case "alpa":
        totals.totalAlpa++;
        break;
      default:
        totals.totalBelumHadir++;
        break;
    }
  }

  return totals;
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
  const [selectedJenjang, setSelectedJenjang] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  const [showBeritaAcara, setShowBeritaAcara] = useState(false);

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
    setSelectedJenjang([]);
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
        return;
      }

      if (!result.data) {
        setError("Data monitoring tidak ditemukan.");
        return;
      }

      setData(result.data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      console.error("Gagal memuat monitoring:", err);
      setError("Terjadi kesalahan saat memuat data monitoring.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  function handleSelectKegiatan(kegiatanId: number) {
    if (kegiatanId === selectedKegiatanId && data) return;

    requestIdRef.current += 1;

    setSelectedKegiatanId(kegiatanId);
    setData(null);
    setError("");
    setShowBeritaAcara(false);

    resetFilters();

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
    if (!editPeserta || selectedKegiatanId === null || editLoading) return;

    const pesertaId = editPeserta.mudamudi_id;
    const kegiatanId = selectedKegiatanId;

    setEditLoading(true);
    setEditError("");

    try {
      const result = await updatePresensiStatus({
        presensiId: editPeserta.presensi_id,
        kegiatanId,
        mudamudiId: pesertaId,
        status,
        keterangan,
      });

      if (!result.success) {
        setEditError(result.error || "Data presensi gagal diperbarui.");
        return;
      }

      if (!result.data) {
        setEditError("Hasil pembaruan data presensi tidak tersedia.");
        return;
      }

      const updated = result.data;

      setData((current) => {
        if (!current) return current;

        const peserta = current.peserta.map((item) =>
          item.mudamudi_id === updated.mudamudiId
            ? {
              ...item,
              presensi_id: updated.presensiId,
              status: updated.status,
              waktu_checkin: updated.waktuCheckin,
              metode: updated.metode,
              keterangan: updated.keterangan,
            }
            : item,
        );

        return {
          ...current,
          peserta,
          totalPeserta: peserta.length,
          ...calculateTotals(peserta),
        };
      });

      setEditPeserta(null);
      setEditError("");
    } catch (err) {
      console.error("Gagal memperbarui status presensi:", err);
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

  const jenjangOptions = useMemo(() => {
    if (!data) return [];

    return getUniqueSortedValues(
      data.peserta.map((peserta) => peserta.jenjang),
    );
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

      const cocokJenjang =
        selectedJenjang.length === 0 ||
        (peserta.jenjang != null &&
          selectedJenjang.includes(peserta.jenjang));

      const cocokStatus =
        selectedStatus.length === 0 ||
        selectedStatus.includes(getPesertaStatus(peserta));

      return (
        cocokPencarian &&
        cocokDesa &&
        cocokKelompok &&
        cocokKelas &&
        cocokJenjang &&
        cocokStatus
      );
    });
  }, [
    data,
    search,
    selectedDesa,
    selectedKelompok,
    selectedKelas,
    selectedJenjang,
    selectedStatus,
  ]);

  const selectedKegiatan = useMemo(() => {
    return kegiatan.find((item) => item.id === selectedKegiatanId) ?? null;
  }, [kegiatan, selectedKegiatanId]);

  const canDownloadBeritaAcara =
    Boolean(data) && !loading && !error && Boolean(selectedKegiatan);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#287A50]">
              Presensi
            </p>

            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#202824]">
              Monitoring Presensi
            </h1>

            <p className="mt-1 max-w-xs text-[10px] leading-4 text-[#78827C] sm:max-w-none sm:text-xs">
              Pantau dan kelola kehadiran peserta berdasarkan kegiatan.
            </p>
          </div>

          {canDownloadBeritaAcara && (
            <button
              type="button"
              onClick={() => setShowBeritaAcara(true)}
              aria-label="Unduh Berita Acara"
              title="Unduh Berita Acara (.docx)"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#287A50] px-3 py-2.5 text-white shadow-xs transition hover:bg-[#206440] focus:outline-none focus:ring-2 focus:ring-[#65B98A]/30 sm:px-4"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3"
                />
              </svg>

              <span className="whitespace-nowrap text-[11px] font-semibold sm:text-xs">
                Berita Acara
              </span>
            </button>
          )}
        </div>
      </div>

      <MonitoringKegiatanSelector
        kegiatan={kegiatan}
        selectedKegiatanId={selectedKegiatanId}
        onSelect={handleSelectKegiatan}
      />

      {loading && !data && (
        <div className="rounded-2xl border border-[#E5EAE6] bg-white p-6 text-center shadow-xs">
          <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[#E5EAE6] border-t-[#287A50]" />
          <p className="mt-3 text-xs text-[#78827C]">
            Memuat data monitoring...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-xs font-medium text-red-700">{error}</p>

          {selectedKegiatanId !== null && (
            <button
              type="button"
              onClick={() => void loadMonitoring(selectedKegiatanId)}
              className="mt-2 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
            >
              Coba Lagi
            </button>
          )}
        </div>
      )}

      {!loading && !error && !data && kegiatan.length > 0 && (
        <div className="rounded-2xl border border-dashed border-[#E5EAE6] bg-white px-4 py-8 text-center shadow-xs">
          <p className="text-xs font-medium text-[#202824]">
            Pilih kegiatan untuk melihat monitoring.
          </p>
          <p className="mt-1 text-[11px] text-[#78827C]">
            Data presensi akan ditampilkan setelah kegiatan dipilih.
          </p>
        </div>
      )}

      {!loading && !error && kegiatan.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#E5EAE6] bg-white px-4 py-8 text-center shadow-xs">
          <p className="text-xs font-medium text-[#202824]">
            Belum ada kegiatan yang tersedia.
          </p>
          <p className="mt-1 text-[11px] text-[#78827C]">
            Tambahkan kegiatan terlebih dahulu untuk melakukan monitoring
            presensi.
          </p>
        </div>
      )}

      {data && (
        <>
          <MonitoringSummary
            totalPeserta={data.totalPeserta}
            totalHadir={data.totalHadir}
            totalTerlambat={data.totalTerlambat}
            totalIzin={data.totalIzin}
            totalSakit={data.totalSakit}
            totalAlpa={data.totalAlpa}
            totalBelumHadir={data.totalBelumHadir}
            peserta={data.peserta}
            jenjangSasaran={data.kegiatan.jenjang}
          />

          {data.totalAlpa > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-medium text-red-800">
                Terdapat {data.totalAlpa} peserta dengan status Alpa.
              </p>
              <p className="mt-0.5 text-[11px] text-red-700">
                Status Alpa dapat diberikan secara manual oleh admin atau
                secara otomatis oleh sistem setelah kegiatan berakhir apabila
                peserta belum melakukan presensi.
              </p>
            </div>
          )}

          <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xs">
            <div className="flex min-w-0 items-center gap-3 border-b border-[#E5EAE6] p-3 sm:p-4">
              <div className="min-w-0 flex-1">
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
                  selectedJenjang={selectedJenjang}
                  onJenjangChange={setSelectedJenjang}
                  jenjangOptions={jenjangOptions}
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
                <p className="text-sm font-medium text-[#202824]">
                  Peserta tidak ditemukan
                </p>
                <p className="mt-1 text-xs text-[#78827C]">
                  Tidak ada peserta yang sesuai dengan pencarian atau filter
                  yang dipilih.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-3 rounded-xl border border-[#E5EAE6] px-3 py-2 text-xs font-medium text-[#202824] transition hover:bg-[#F0F4F1]"
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

      {showBeritaAcara && selectedKegiatan && data && (
        <BeritaAcaraModal
          kegiatan={selectedKegiatan}
          monitoringData={data}
          onClose={() => setShowBeritaAcara(false)}
        />
      )}
    </div>
  );
}
