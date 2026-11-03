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
  if (!waktu) return "-";

  const date = new Date(waktu);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getMetodeLabel(metode: string | null) {
  switch (metode) {
    case "qr":
      return "QR Code";
    case "manual":
      return "Manual";
    case "otomatis":
      return "Otomatis";
    default:
      return "-";
  }
}

function getMetodeClassName(metode: string | null) {
  switch (metode) {
    case "qr":
      return "border-teal-100 bg-teal-50 text-teal-700";
    case "otomatis":
      return "border-blue-100 bg-blue-50 text-blue-700";
    case "manual":
      return "border-gray-200 bg-gray-50 text-gray-600";
    default:
      return "border-gray-100 bg-gray-50 text-gray-400";
  }
}

function ActionButton({
  label,
  onClick,
  variant,
  children,
}: {
  label: string;
  onClick: () => void;
  variant: "detail" | "edit";
  children: React.ReactNode;
}) {
  const styles =
    variant === "edit"
      ? "border-teal-100 bg-teal-50 text-teal-700 hover:border-teal-200 hover:bg-teal-100/80"
      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${styles}`}
    >
      {children}
    </button>
  );
}

function RowNumber({ index }: { index: number }) {
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-gray-100 px-1 font-mono text-[9px] font-medium text-gray-500 transition-colors group-hover:bg-teal-50 group-hover:text-teal-700">
      {index}
    </span>
  );
}

function DetailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="m14.5 6.5 3 3" />
      <path d="M4 20h3.5L18.5 9a2.12 2.12 0 0 0-3-3L4.5 17v3Z" />
    </svg>
  );
}

function ParticipantAvatar({ nama }: { nama: string }) {
  const initials = nama
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase("id"))
    .join("");

  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[10px] font-bold text-teal-700 ring-1 ring-teal-100"
      aria-hidden="true"
    >
      {initials || "?"}
    </div>
  );
}

function MethodBadge({ metode }: { metode: string | null }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[9px] font-medium ${getMetodeClassName(
        metode,
      )}`}
    >
      {getMetodeLabel(metode)}
    </span>
  );
}

function TimeLabel({ waktu }: { waktu: string | null }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] tabular-nums text-gray-500">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-3 w-3 shrink-0 text-gray-400"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {formatWaktuCheckin(waktu)}
    </span>
  );
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
  const displayEnd = Math.min(endIndex, peserta.length);

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (peserta.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-xs font-medium text-gray-700">
          Peserta tidak ditemukan.
        </p>
        <p className="mt-1 text-[10px] text-gray-500">
          Coba gunakan kata kunci pencarian atau filter yang berbeda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col">
      {/* CARD HEADER */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M8 5h12M8 12h12M8 19h12" strokeLinecap="round" />
              <circle cx="4" cy="5" r="1" />
              <circle cx="4" cy="12" r="1" />
              <circle cx="4" cy="19" r="1" />
            </svg>
          </div>

          <div className="min-w-0">
            <h3 className="text-[10px] font-semibold tracking-tight text-gray-800">
              Daftar Peserta Monitoring
            </h3>
            <p className="text-[9px] leading-3.5 text-gray-400">
              Data kehadiran dan presensi peserta kegiatan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[9px] font-medium text-gray-600">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            {peserta.length} Peserta
          </span>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden min-w-0 overflow-x-auto lg:block">
        <table className="w-full min-w-250 border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/90">
              <th
                scope="col"
                className="w-12 px-3.5 py-3 text-center text-[9px] font-semibold uppercase tracking-[0.07em] text-gray-500"
              >
                No.
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3.5 py-3 text-[9px] font-semibold uppercase tracking-[0.07em] text-gray-500"
              >
                Peserta
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-[9px] font-semibold uppercase tracking-[0.07em] text-gray-500"
              >
                Desa
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-[9px] font-semibold uppercase tracking-[0.07em] text-gray-500"
              >
                Kelompok
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-[9px] font-semibold uppercase tracking-[0.07em] text-gray-500"
              >
                Kelas
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-[9px] font-semibold uppercase tracking-[0.07em] text-gray-500"
              >
                Status
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-[9px] font-semibold uppercase tracking-[0.07em] text-gray-500"
              >
                Metode
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-[9px] font-semibold uppercase tracking-[0.07em] text-gray-500"
              >
                Waktu
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-center text-[9px] font-semibold uppercase tracking-[0.07em] text-gray-500"
              >
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedPeserta.map((item, index) => (
              <tr
                key={item.mudamudi_id}
                className="group transition-colors hover:bg-teal-50/35"
              >
                <td className="px-3.5 py-3 text-center">
                  <RowNumber index={startIndex + index + 1} />
                </td>

                <td className="px-3.5 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <ParticipantAvatar nama={item.nama} />
                    <div className="min-w-0">
                      <p className="max-w-55 truncate text-[11px] font-semibold text-gray-800">
                        {item.nama}
                      </p>
                      <p className="text-[9px] text-gray-400">
                        Peserta kegiatan
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3 text-[11px] text-gray-600">
                  {item.desa || "-"}
                </td>

                <td className="px-3 py-3 text-[11px] text-gray-600">
                  {item.kelompok || "-"}
                </td>

                <td className="px-3 py-3 text-[11px] text-gray-600">
                  {item.kelas || "-"}
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  <MonitoringStatusBadge status={item.status} />
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  <MethodBadge metode={item.metode} />
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  <TimeLabel waktu={item.waktu_checkin} />
                </td>

                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <ActionButton
                      label={`Lihat detail ${item.nama}`}
                      variant="detail"
                      onClick={() => onDetail(item)}
                    >
                      <DetailIcon />
                    </ActionButton>

                    <ActionButton
                      label={`Edit presensi ${item.nama}`}
                      variant="edit"
                      onClick={() => onEdit(item)}
                    >
                      <EditIcon />
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST */}
      <div className="space-y-3 p-3.5 lg:hidden">
        {paginatedPeserta.map((item) => (
          <article
            key={item.mudamudi_id}
            className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xs transition hover:border-gray-300"
          >
            <div className="p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ParticipantAvatar nama={item.nama} />
                  <div>
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-teal-700">
                      Peserta
                    </span>
                    <h4 className="text-[13px] font-bold tracking-tight text-gray-900">
                      {item.nama}
                    </h4>
                  </div>
                </div>
                <div className="shrink-0">
                  <MonitoringStatusBadge status={item.status} />
                </div>
              </div>

              <div className="my-3 h-px w-full bg-gray-100" />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">
                    Desa
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-medium text-gray-700">
                    {item.desa || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">
                    Kelompok
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-medium text-gray-700">
                    {item.kelompok || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">
                    Kelas
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-medium text-gray-700">
                    {item.kelas || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
                <div className="flex items-center gap-2">
                  <MethodBadge metode={item.metode} />
                  <TimeLabel waktu={item.waktu_checkin} />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onDetail(item)}
                    className="inline-flex h-7.5 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-[10px] font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    <DetailIcon />
                    <span>Detail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="inline-flex h-7.5 items-center gap-1 rounded-lg border border-teal-100 bg-teal-50 px-2.5 text-[10px] font-semibold text-teal-700 transition hover:bg-teal-100"
                  >
                    <EditIcon />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="border-t border-gray-100 bg-gray-50/40 px-2 py-2.5 sm:px-4">
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
