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

export default function MonitoringPage({ kegiatan }: Props) {
  const [selectedKegiatanId, setSelectedKegiatanId] = useState<number | null>(
    null,
  );

  const [data, setData] = useState<MonitoringPresensi | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [detailPeserta, setDetailPeserta] = useState<MonitoringPeserta | null>(
    null,
  );

  const [editPeserta, setEditPeserta] = useState<MonitoringPeserta | null>(
    null,
  );

  const [editLoading, setEditLoading] = useState(false);

  const [editError, setEditError] = useState("");

  /*
   * Digunakan untuk memastikan response request lama
   * tidak menimpa hasil request yang lebih baru.
   */
  const requestIdRef = useRef(0);

  async function loadMonitoring(kegiatanId: number) {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError("");

    try {
      const result = (await getMonitoringPresensi(
        kegiatanId,
      )) as MonitoringResult;

      /*
       * Abaikan hasil request yang sudah tidak relevan.
       */
      if (requestId !== requestIdRef.current) {
        return;
      }

      if ("error" in result && result.error) {
        setError(result.error);
        setData(null);
        return;
      }

      setData(result.data);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

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
    if (kegiatanId === selectedKegiatanId && data) {
      return;
    }

    setSelectedKegiatanId(kegiatanId);

    setSearch("");
    setError("");
    setData(null);
    setDetailPeserta(null);
    setEditPeserta(null);
    setEditError("");

    loadMonitoring(kegiatanId);
  }

  function handleOpenDetail(peserta: MonitoringPeserta) {
    setDetailPeserta(peserta);
  }

  function handleOpenEdit(peserta: MonitoringPeserta) {
    setEditError("");
    setEditPeserta(peserta);
  }

  function handleCloseEdit() {
    if (editLoading) {
      return;
    }

    setEditPeserta(null);
    setEditError("");
  }

  async function handleSaveStatus(status: PresensiStatus, keterangan: string) {
    if (!editPeserta || selectedKegiatanId === null) {
      return;
    }

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

      /*
       * Ambil ulang monitoring setelah status berhasil diubah
       * agar summary dan tabel selalu sinkron dengan database.
       */
      await loadMonitoring(selectedKegiatanId);
    } catch (err) {
      console.error(err);

      setEditError("Terjadi kesalahan saat memperbarui data presensi.");
    } finally {
      setEditLoading(false);
    }
  }

  const filteredPeserta = useMemo(() => {
    if (!data) {
      return [];
    }

    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return data.peserta;
    }

    return data.peserta.filter(
      (peserta) =>
        peserta.nama.toLowerCase().includes(keyword) ||
        peserta.desa.toLowerCase().includes(keyword) ||
        peserta.kelompok.toLowerCase().includes(keyword) ||
        peserta.kelas.toLowerCase().includes(keyword),
    );
  }, [data, search]);

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
          Presensi
        </p>

        <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-gray-900">
          Monitoring Presensi
        </h1>

        <p className="mt-0.5 text-xs text-gray-500">
          Pantau kehadiran peserta berdasarkan kegiatan.
        </p>
      </div>

      {/* Selector */}
      <MonitoringKegiatanSelector
        kegiatan={kegiatan}
        selectedKegiatanId={selectedKegiatanId}
        onSelect={handleSelectKegiatan}
      />

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-xs text-gray-500">Memuat data monitoring...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-xs font-medium text-red-700">{error}</p>

          {selectedKegiatanId && (
            <button
              type="button"
              onClick={() => loadMonitoring(selectedKegiatanId)}
              className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
            >
              Coba Lagi
            </button>
          )}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && !data && kegiatan.length > 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center">
          <p className="text-xs font-medium text-gray-700">
            Pilih kegiatan untuk melihat monitoring.
          </p>

          <p className="mt-1 text-[11px] text-gray-500">
            Data presensi akan ditampilkan setelah kegiatan dipilih.
          </p>
        </div>
      )}

      {/* Monitoring Data */}
      {!loading && data && (
        <>
          {/* Summary */}
          <MonitoringSummary
            totalPeserta={data.totalPeserta}
            totalHadir={data.totalHadir}
            totalTerlambat={data.totalTerlambat}
            totalIzin={data.totalIzin}
            totalSakit={data.totalSakit}
            totalAlpa={data.totalAlpa}
            totalBelumHadir={data.totalBelumHadir}
          />

          {/* Alpa Notice */}
          {data.totalAlpa > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-medium text-red-800">
                Terdapat {data.totalAlpa} peserta dengan status Alpa.
              </p>

              <p className="mt-0.5 text-[11px] text-red-700">
                Status Alpa diberikan secara manual oleh admin.
              </p>
            </div>
          )}

          {/* Table */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Data Presensi Peserta
                  </h2>

                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {filteredPeserta.length} dari {data.totalPeserta} peserta
                  </p>
                </div>

                <MonitoringFilters search={search} onSearchChange={setSearch} />
              </div>
            </div>

            <MonitoringTable
              peserta={filteredPeserta}
              onDetail={handleOpenDetail}
              onEdit={handleOpenEdit}
            />
          </div>
        </>
      )}

      {/* Detail Modal */}
      <MonitoringDetailModal
        peserta={detailPeserta}
        onClose={() => setDetailPeserta(null)}
      />

      {/* Edit Modal */}
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
