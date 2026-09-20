"use client";

import { useEffect, useState } from "react";

import { MonitoringPeserta } from "../../../backend/presensi/types";

import MonitoringStatusBadge from "./MonitoringStatusBadge";
import Pagination from "../rekapitulasi/Pagination";

type Props = {
  peserta: MonitoringPeserta[];
  onDetail: (peserta: MonitoringPeserta) => void;
  onEdit: (peserta: MonitoringPeserta) => void;
};

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function formatWaktuCheckin(waktu: string | null) {
  if (!waktu) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(waktu));
}

export default function MonitoringTable({ peserta, onDetail, onEdit }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const totalPages = Math.ceil(peserta.length / itemsPerPage);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [peserta]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedPeserta = peserta.slice(startIndex, endIndex);

  const displayStart = peserta.length === 0 ? 0 : startIndex + 1;

  const displayEnd = Math.min(startIndex + itemsPerPage, peserta.length);

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (peserta.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-xs font-medium text-gray-700">
          Peserta tidak ditemukan.
        </p>

        <p className="mt-1 text-[11px] text-gray-500">
          Coba gunakan kata kunci pencarian yang berbeda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col">
      {/* Result count */}
      <div className="flex shrink-0 items-center justify-between px-3 pb-2 pt-1">
        <p className="text-[10px] text-gray-500">
          Menampilkan{" "}
          <span className="font-medium text-gray-600">
            {displayStart}
            {displayEnd !== displayStart ? `–${displayEnd}` : ""}
          </span>{" "}
          dari{" "}
          <span className="font-medium text-gray-600">{peserta.length}</span>{" "}
          peserta
        </p>
      </div>

      {/* DESKTOP */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-212.5 text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Peserta
              </th>

              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Desa
              </th>

              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Kelompok
              </th>

              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Kelas
              </th>

              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Metode
              </th>

              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Waktu
              </th>

              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedPeserta.map((item) => (
              <tr
                key={item.mudamudi_id}
                className="transition hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-gray-900">
                    {item.nama}
                  </p>
                </td>

                <td className="px-4 py-3 text-xs text-gray-600">{item.desa}</td>

                <td className="px-4 py-3 text-xs text-gray-600">
                  {item.kelompok}
                </td>

                <td className="px-4 py-3 text-xs text-gray-600">
                  {item.kelas}
                </td>

                <td className="px-4 py-3">
                  <MonitoringStatusBadge status={item.status} />
                </td>

                <td className="px-4 py-3">
                  {item.metode ? (
                    <span
                      className={`text-xs font-medium ${
                        item.metode === "qr" ? "text-teal-700" : "text-gray-600"
                      }`}
                    >
                      {item.metode === "qr" ? "QR" : "Manual"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>

                <td className="px-4 py-3 text-xs text-gray-600">
                  {formatWaktuCheckin(item.waktu_checkin)}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onDetail(item)}
                      className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Detail
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-md bg-teal-600 px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-teal-700"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}
      <div className="divide-y divide-gray-100 lg:hidden">
        {paginatedPeserta.map((item) => (
          <div key={item.mudamudi_id} className="px-3 py-2.5">
            {/* Nama + Status */}
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-xs font-semibold text-gray-900">
                {item.nama}
              </p>

              <div className="shrink-0">
                <MonitoringStatusBadge status={item.status} />
              </div>
            </div>

            {/* Metadata + Aksi */}
            <div className="mt-1 flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-[10px] text-gray-400">
                {item.desa} • {item.kelompok} • {item.kelas}
              </p>

              <span className="shrink-0 text-[10px] text-gray-300">|</span>

              <span
                className={`shrink-0 text-[10px] font-medium ${
                  item.metode === "qr"
                    ? "text-teal-700"
                    : item.metode === "manual"
                      ? "text-gray-500"
                      : "text-gray-300"
                }`}
              >
                {item.metode === "qr"
                  ? "QR"
                  : item.metode === "manual"
                    ? "Manual"
                    : "-"}
              </span>

              <span className="shrink-0 text-[10px] text-gray-400">
                {formatWaktuCheckin(item.waktu_checkin)}
              </span>

              <div className="ml-0.5 flex shrink-0 items-center gap-0.5">
                {/* Detail */}
                <button
                  type="button"
                  onClick={() => onDetail(item)}
                  aria-label={`Lihat detail ${item.nama}`}
                  title="Detail"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                    />

                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  aria-label={`Edit presensi ${item.nama}`}
                  title="Edit"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-teal-50 hover:text-teal-700 active:bg-teal-100"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.5 6.5 3 3"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 20h3.5L18.5 9a2.12 2.12 0 0 0-3-3L4.5 17v3Z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="shrink-0">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          perPageOptions={PER_PAGE_OPTIONS}
          onItemsPerPageChange={setItemsPerPage}
          onGoToPage={goToPage}
        />
      </div>
    </div>
  );
}
