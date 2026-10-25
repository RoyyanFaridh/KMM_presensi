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
      ? "border-teal-100 bg-teal-50 text-teal-700 hover:border-teal-200 hover:bg-teal-100"
      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${styles}`}
    >
      {children}
    </button>
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
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[10px] font-semibold text-teal-700 ring-1 ring-teal-100"
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
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-2.5">
        <p className="text-[10px] text-gray-500">
          Menampilkan{" "}
          <span className="font-semibold text-gray-800">
            {displayStart.toLocaleString("id-ID")}
            {displayEnd !== displayStart
              ? `–${displayEnd.toLocaleString("id-ID")}`
              : ""}
          </span>{" "}
          dari{" "}
          <span className="font-semibold text-gray-800">
            {peserta.length.toLocaleString("id-ID")}
          </span>{" "}
          peserta
        </p>

        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-3 w-3"
            aria-hidden="true"
          >
            <path d="M8 5h12M8 12h12M8 19h12" strokeLinecap="round" />
            <circle cx="4" cy="5" r="1" />
            <circle cx="4" cy="12" r="1" />
            <circle cx="4" cy="19" r="1" />
          </svg>
          Data peserta
        </span>
      </div>

      <div className="hidden min-w-0 overflow-x-auto lg:block">
        <table className="w-full min-w-250 border-collapse text-left">
          <thead>
            <tr className="bg-gray-50/70">
              <th
                scope="col"
                className="whitespace-nowrap border-b border-gray-200 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-gray-500"
              >
                Peserta
              </th>
              <th
                scope="col"
                className="whitespace-nowrap border-b border-gray-200 px-3 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-gray-500"
              >
                Desa
              </th>
              <th
                scope="col"
                className="whitespace-nowrap border-b border-gray-200 px-3 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-gray-500"
              >
                Kelompok
              </th>
              <th
                scope="col"
                className="whitespace-nowrap border-b border-gray-200 px-3 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-gray-500"
              >
                Kelas
              </th>
              <th
                scope="col"
                className="whitespace-nowrap border-b border-gray-200 px-3 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-gray-500"
              >
                Status
              </th>
              <th
                scope="col"
                className="whitespace-nowrap border-b border-gray-200 px-3 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-gray-500"
              >
                Metode
              </th>
              <th
                scope="col"
                className="whitespace-nowrap border-b border-gray-200 px-3 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-gray-500"
              >
                Waktu
              </th>
              <th
                scope="col"
                className="whitespace-nowrap border-b border-gray-200 px-3 py-2.5 text-center text-[9px] font-semibold uppercase tracking-wider text-gray-500"
              >
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedPeserta.map((item, index) => (
              <tr
                key={item.mudamudi_id}
                className={`transition-colors hover:bg-teal-50/40 ${
                  index % 2 === 1 ? "bg-gray-50/30" : "bg-white"
                }`}
              >
                <td className="px-4 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <ParticipantAvatar nama={item.nama} />
                    <div className="min-w-0">
                      <p className="max-w-55 truncate text-[11px] font-semibold text-gray-800">
                        {item.nama}
                      </p>
                      <p className="mt-0.5 text-[9px] text-gray-400">
                        Peserta kegiatan
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-2.5 text-[11px] text-gray-600">
                  {item.desa || "-"}
                </td>

                <td className="px-3 py-2.5 text-[11px] text-gray-600">
                  {item.kelompok || "-"}
                </td>

                <td className="px-3 py-2.5 text-[11px] text-gray-600">
                  {item.kelas || "-"}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5">
                  <MonitoringStatusBadge status={item.status} />
                </td>

                <td className="whitespace-nowrap px-3 py-2.5">
                  <MethodBadge metode={item.metode} />
                </td>

                <td className="whitespace-nowrap px-3 py-2.5">
                  <TimeLabel waktu={item.waktu_checkin} />
                </td>

                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-center gap-1">
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

      <div className="divide-y divide-gray-100 lg:hidden">
        {paginatedPeserta.map((item) => (
          <article
            key={item.mudamudi_id}
            className="px-3 py-3 transition-colors hover:bg-gray-50/70 sm:px-4"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <ParticipantAvatar nama={item.nama} />

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <h3 className="min-w-0 flex-1 wrap-break-word text-[11px] font-semibold leading-4 text-gray-900">
                    {item.nama}
                  </h3>

                  <div className="shrink-0">
                    <MonitoringStatusBadge status={item.status} />
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[9px] text-gray-600">
                    {item.desa || "Desa -"}
                  </span>
                  <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[9px] text-gray-600">
                    {item.kelompok || "Kelompok -"}
                  </span>
                  <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[9px] text-gray-600">
                    {item.kelas || "Kelas -"}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-2">
                  <MethodBadge metode={item.metode} />
                  <TimeLabel waktu={item.waktu_checkin} />

                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onDetail(item)}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
                      aria-label={`Lihat detail ${item.nama}`}
                    >
                      <DetailIcon />
                      Detail
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-teal-100 bg-teal-50 px-2 text-[10px] font-medium text-teal-700 transition-colors hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
                      aria-label={`Edit presensi ${item.nama}`}
                    >
                      <EditIcon />
                      Edit
                    </button>
                  </div>
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
