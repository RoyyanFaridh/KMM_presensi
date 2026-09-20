"use client";

import type {
  PresensiStatus,
  RekapitulasiKegiatan,
  RekapitulasiKehadiran,
  RekapitulasiMudaMudi,
} from "../../../backend/presensi/types";

import { formatRentangTanggal } from "../../../backend/kegiatan/format";

import Pagination from "./Pagination";

type Props = {
  loading: boolean;
  mudaMudi: RekapitulasiMudaMudi[];
  kegiatan: RekapitulasiKegiatan[];
  kehadiran: RekapitulasiKehadiran[];

  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;

  onItemsPerPageChange: (value: number) => void;
  onGoToPage: (page: number) => void;
};

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function getStatusStyle(status: PresensiStatus) {
  switch (status) {
    case "hadir":
      return {
        className: "bg-emerald-500",
        label: "Hadir",
      };

    case "terlambat":
      return {
        className: "bg-violet-500",
        label: "Terlambat",
      };

    case "izin":
      return {
        className: "bg-yellow-400",
        label: "Izin",
      };

    case "sakit":
      return {
        className: "bg-blue-500",
        label: "Sakit",
      };

    case "alpa":
      return {
        className: "bg-red-500",
        label: "Alpa",
      };
  }
}

export default function RekapitulasiTable({
  loading,
  mudaMudi,
  kegiatan,
  kehadiran,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
  onGoToPage,
}: Props) {
  const displayStart =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

  const displayEnd =
    totalItems === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalItems);

  /*
   * Map status berdasarkan kombinasi:
   * mudamudi_id + kegiatan_id
   */
  const attendanceMap = new Map<string, PresensiStatus>();

  kehadiran.forEach((item) => {
    attendanceMap.set(`${item.mudamudi_id}-${item.kegiatan_id}`, item.status);
  });

  function getStatus(mudamudiId: number, kegiatanId: number): PresensiStatus {
    return attendanceMap.get(`${mudamudiId}-${kegiatanId}`) ?? "alpa";
  }

  /*
   * Menghitung total Hadir, Terlambat, Izin,
   * Sakit, dan Alpa berdasarkan kegiatan
   * yang sedang ditampilkan.
   */
  function getStatusTotals(mudamudiId: number) {
    const totals: Record<PresensiStatus, number> = {
      hadir: 0,
      terlambat: 0,
      izin: 0,
      sakit: 0,
      alpa: 0,
    };

    kegiatan.forEach((kegiatanItem) => {
      const status = getStatus(mudamudiId, kegiatanItem.id);

      totals[status]++;
    });

    return totals;
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) {
      return;
    }

    onGoToPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (loading) {
    return (
      <div className="px-5 py-10 text-center">
        <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600" />

        <p className="mt-3 text-xs text-gray-500">
          Memuat rekapitulasi presensi...
        </p>
      </div>
    );
  }

  if (mudaMudi.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-5 w-5 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h4m-7 4h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
            />
          </svg>
        </div>

        <p className="mt-3 text-xs font-medium text-gray-700">
          Data Muda-Mudi tidak ditemukan
        </p>

        <p className="mt-1 text-[11px] text-gray-500">
          Coba ubah kata kunci atau filter yang digunakan.
        </p>
      </div>
    );
  }

  if (kegiatan.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-xs font-medium text-gray-700">
          Tidak ada kegiatan pada filter yang dipilih
        </p>

        <p className="mt-1 text-[11px] text-gray-500">
          Coba pilih bulan atau kegiatan lainnya.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col">
      {/* Informasi jumlah data */}
      <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-2">
        <p className="text-[10px] text-gray-500">
          Menampilkan{" "}
          <span className="font-medium text-gray-600">
            {displayStart}
            {displayEnd !== displayStart ? `–${displayEnd}` : ""}
          </span>{" "}
          dari <span className="font-medium text-gray-600">{totalItems}</span>{" "}
          Muda-Mudi
        </p>
      </div>

      {/* =========================================================
          DESKTOP
          Nama + detail setiap pengajian + total H/T/I/S/A
          ========================================================= */}
      <div className="hidden min-h-0 overflow-auto lg:block">
        <table className="min-w-max text-xs">
          <thead className="sticky top-0 z-20">
            <tr className="border-b border-gray-200 bg-gray-50">
              {/* Muda-Mudi - FIXED KIRI */}
              <th className="sticky left-0 z-40 min-w-64 border-r border-gray-200 bg-gray-50 px-4 py-2 text-left text-[10px] font-medium text-gray-600">
                Muda-Mudi
              </th>

              {/* Kegiatan - SCROLLABLE */}
              {kegiatan.map((item) => (
                <th
                  key={item.id}
                  className="min-w-36 bg-gray-50 px-3 py-2.5 text-center"
                >
                  <div
                    className="mx-auto max-w-36 truncate text-[10px] font-semibold text-gray-700"
                    title={item.nama}
                  >
                    {item.nama}
                  </div>

                  <div
                    className="mx-auto mt-1 max-w-36 truncate whitespace-nowrap text-[9px] font-medium text-gray-500"
                    title={formatRentangTanggal(
                      item.tanggal_mulai,
                      item.tanggal_selesai,
                    )}
                  >
                    {formatRentangTanggal(
                      item.tanggal_mulai,
                      item.tanggal_selesai,
                    )}
                  </div>

                  <div
                    className="mx-auto mt-0.5 max-w-36 truncate text-[9px] font-normal text-gray-400"
                    title={item.lokasi}
                  >
                    {item.lokasi}
                  </div>
                </th>
              ))}

              {/* H - FIXED KANAN */}
              <th
                title="Hadir"
                className="sticky right-40 z-40 w-10 min-w-10 border-l border-gray-200 bg-gray-50 px-2 py-2 text-center text-[10px] font-semibold text-gray-700"
              >
                H
              </th>

              {/* T - FIXED KANAN */}
              <th
                title="Terlambat"
                className="sticky right-30 z-40 w-10 min-w-10 bg-gray-50 px-2 py-2 text-center text-[10px] font-semibold text-gray-700"
              >
                T
              </th>

              {/* I - FIXED KANAN */}
              <th
                title="Izin"
                className="sticky right-20 z-40 w-10 min-w-10 bg-gray-50 px-2 py-2 text-center text-[10px] font-semibold text-gray-700"
              >
                I
              </th>

              {/* S - FIXED KANAN */}
              <th
                title="Sakit"
                className="sticky right-10 z-40 w-10 min-w-10 bg-gray-50 px-2 py-2 text-center text-[10px] font-semibold text-gray-700"
              >
                S
              </th>

              {/* A - FIXED KANAN */}
              <th
                title="Alpa"
                className="sticky right-0 z-40 w-10 min-w-10 border-r border-gray-200 bg-gray-50 px-2 py-2 text-center text-[10px] font-semibold text-gray-700"
              >
                A
              </th>
            </tr>
          </thead>

          <tbody>
            {mudaMudi.map((item) => {
              const totals = getStatusTotals(item.id);

              return (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  {/* Muda-Mudi - FIXED KIRI */}
                  <td className="sticky left-0 z-30 min-w-64 border-r border-gray-200 bg-white px-4 py-2">
                    <div className="whitespace-nowrap text-[11px] font-medium text-gray-900">
                      {item.nama}
                    </div>

                    <div className="mt-0.5 whitespace-nowrap text-[9px] text-gray-400">
                      {item.desa} • {item.kelompok}
                    </div>
                  </td>

                  {/* Status per kegiatan */}
                  {kegiatan.map((kegiatanItem) => {
                    const status = getStatus(item.id, kegiatanItem.id);

                    const statusStyle = getStatusStyle(status);

                    return (
                      <td
                        key={kegiatanItem.id}
                        className="bg-white px-3 py-2 text-center"
                      >
                        <span
                          className={`mx-auto block h-2.5 w-2.5 rounded-full ${statusStyle.className}`}
                          title={statusStyle.label}
                          aria-label={statusStyle.label}
                        />
                      </td>
                    );
                  })}

                  {/* Total Hadir */}
                  <td className="sticky right-40 z-30 w-10 min-w-10 border-l border-gray-200 bg-white px-2 py-2 text-center text-[10px] font-medium text-gray-700">
                    {totals.hadir}
                  </td>

                  {/* Total Terlambat */}
                  <td className="sticky right-30 z-30 w-10 min-w-10 bg-white px-2 py-2 text-center text-[10px] font-medium text-gray-700">
                    {totals.terlambat}
                  </td>

                  {/* Total Izin */}
                  <td className="sticky right-20 z-30 w-10 min-w-10 bg-white px-2 py-2 text-center text-[10px] font-medium text-gray-700">
                    {totals.izin}
                  </td>

                  {/* Total Sakit */}
                  <td className="sticky right-10 z-30 w-10 min-w-10 bg-white px-2 py-2 text-center text-[10px] font-medium text-gray-700">
                    {totals.sakit}
                  </td>

                  {/* Total Alpa */}
                  <td className="sticky right-0 z-30 w-10 min-w-10 border-r border-gray-200 bg-white px-2 py-2 text-center text-[10px] font-medium text-gray-700">
                    {totals.alpa}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* =========================================================
          MOBILE
          Nama + total H/T/I/S/A
          ========================================================= */}
      <div className="min-h-0 overflow-auto px-3 lg:hidden">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-20">
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="min-w-0 px-3 py-2.5 text-left text-[10px] font-semibold text-gray-600">
                Muda-Mudi
              </th>

              <th
                title="Hadir"
                className="w-9 px-1 py-2.5 text-center text-[10px] font-semibold text-gray-700"
              >
                H
              </th>

              <th
                title="Terlambat"
                className="w-9 px-1 py-2.5 text-center text-[10px] font-semibold text-gray-700"
              >
                T
              </th>

              <th
                title="Izin"
                className="w-9 px-1 py-2.5 text-center text-[10px] font-semibold text-gray-700"
              >
                I
              </th>

              <th
                title="Sakit"
                className="w-9 px-1 py-2.5 text-center text-[10px] font-semibold text-gray-700"
              >
                S
              </th>

              <th
                title="Alpa"
                className="w-9 border-r border-gray-200 px-1 py-2.5 text-center text-[10px] font-semibold text-gray-700"
              >
                A
              </th>
            </tr>
          </thead>

          <tbody>
            {mudaMudi.map((item) => {
              const totals = getStatusTotals(item.id);

              return (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  {/* Nama + Desa/Kelompok */}
                  <td className="max-w-0 px-3 py-2.5">
                    <div className="truncate text-[11px] font-medium text-gray-900">
                      {item.nama}
                    </div>

                    <div className="mt-0.5 truncate text-[9px] text-gray-400">
                      {item.desa} • {item.kelompok}
                    </div>
                  </td>

                  {/* Hadir */}
                  <td className="w-9 px-1 py-2.5 text-center text-[10px] font-medium text-emerald-600">
                    {totals.hadir}
                  </td>

                  {/* Terlambat */}
                  <td className="w-9 px-1 py-2.5 text-center text-[10px] font-medium text-violet-600">
                    {totals.terlambat}
                  </td>

                  {/* Izin */}
                  <td className="w-9 px-1 py-2.5 text-center text-[10px] font-medium text-yellow-600">
                    {totals.izin}
                  </td>

                  {/* Sakit */}
                  <td className="w-9 px-1 py-2.5 text-center text-[10px] font-medium text-blue-600">
                    {totals.sakit}
                  </td>

                  {/* Alpa */}
                  <td className="w-9 border-r border-gray-200 px-1 py-2.5 text-center text-[10px] font-medium text-red-600">
                    {totals.alpa}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="shrink-0">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          perPageOptions={PER_PAGE_OPTIONS}
          onItemsPerPageChange={onItemsPerPageChange}
          onGoToPage={goToPage}
        />
      </div>
    </div>
  );
}
