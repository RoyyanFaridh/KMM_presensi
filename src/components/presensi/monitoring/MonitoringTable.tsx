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
      return "border-[#65B98A]/30 bg-[#E6F2EA] text-[#206440]";
    case "otomatis":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "manual":
      return "border-[#E5EAE6] bg-[#F5F7F5] text-[#78827C]";
    default:
      return "border-[#E5EAE6] bg-[#F5F7F5] text-[#9AA39D]";
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
      ? "border-[#65B98A]/30 bg-[#E6F2EA] text-[#206440] hover:bg-[#65B98A]/20"
      : "border-[#E5EAE6] bg-white text-[#78827C] hover:border-[#287A50]/40 hover:bg-[#F5F7F5] hover:text-[#202824]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-[#287A50] focus:ring-offset-1 ${styles}`}
    >
      {children}
    </button>
  );
}

function RowNumber({ index }: { index: number }) {
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-[#F5F7F5] px-1 font-mono text-[10px] font-medium text-[#78827C] transition-colors group-hover:bg-[#E6F2EA] group-hover:text-[#206440]">
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
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E6F2EA] text-[10px] font-bold text-[#206440] ring-1 ring-[#65B98A]/30"
      aria-hidden="true"
    >
      {initials || "?"}
    </div>
  );
}

function MethodBadge({ metode }: { metode: string | null }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${getMetodeClassName(
        metode,
      )}`}
    >
      {getMetodeLabel(metode)}
    </span>
  );
}

function TimeLabel({ waktu }: { waktu: string | null }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs tabular-nums text-[#78827C]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-3.5 w-3.5 shrink-0 text-[#9AA39D]"
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
      <div className="px-4 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F2EA] text-[#287A50] mb-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[#202824]">
          Peserta tidak ditemukan
        </p>
        <p className="mt-1 text-xs text-[#78827C]">
          Coba gunakan kata kunci pencarian atau filter yang berbeda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col">
      {/* CARD HEADER */}
      <div className="flex items-center justify-between border-b border-[#E5EAE6] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#65B98A]/30 bg-[#E6F2EA] text-[#287A50]">
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
            <h3 className="text-xs font-semibold tracking-tight text-[#202824]">
              Daftar Peserta Monitoring
            </h3>
            <p className="text-[10px] text-[#78827C]">
              Data kehadiran dan presensi peserta kegiatan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5EAE6] bg-[#F5F7F5] px-2.5 py-1 text-[10px] font-medium text-[#78827C]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#287A50]" />
            {peserta.length} Peserta
          </span>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden min-w-0 overflow-x-auto lg:block">
        <table className="w-full min-w-250 border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E5EAE6] bg-[#F5F7F5]">
              <th
                scope="col"
                className="w-12 px-3.5 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[#78827C]"
              >
                No.
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3.5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#78827C]"
              >
                Peserta
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#78827C]"
              >
                Desa
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#78827C]"
              >
                Kelompok
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#78827C]"
              >
                Kelas
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#78827C]"
              >
                Status
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#78827C]"
              >
                Metode
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#78827C]"
              >
                Waktu
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[#78827C]"
              >
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5EAE6]">
            {paginatedPeserta.map((item, index) => (
              <tr
                key={item.mudamudi_id}
                className="group transition-colors hover:bg-[#E6F2EA]/30"
              >
                <td className="px-3.5 py-3 text-center">
                  <RowNumber index={startIndex + index + 1} />
                </td>

                <td className="px-3.5 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <ParticipantAvatar nama={item.nama} />
                    <div className="min-w-0">
                      <p className="max-w-55 truncate text-xs font-semibold text-[#202824]">
                        {item.nama}
                      </p>
                      <p className="text-[10px] text-[#78827C]">
                        Peserta kegiatan
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3 text-xs text-[#202824]">
                  {item.desa || "-"}
                </td>

                <td className="px-3 py-3 text-xs text-[#202824]">
                  {item.kelompok || "-"}
                </td>

                <td className="px-3 py-3 text-xs text-[#202824]">
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
            className="overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xs transition hover:border-[#65B98A]/40"
          >
            <div className="p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ParticipantAvatar nama={item.nama} />
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-[#287A50]">
                      Peserta
                    </span>
                    <h4 className="text-xs font-bold tracking-tight text-[#202824]">
                      {item.nama}
                    </h4>
                  </div>
                </div>
                <div className="shrink-0">
                  <MonitoringStatusBadge status={item.status} />
                </div>
              </div>

              <div className="my-3 h-px w-full bg-[#E5EAE6]" />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                    Desa
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium text-[#202824]">
                    {item.desa || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                    Kelompok
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium text-[#202824]">
                    {item.kelompok || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                    Kelas
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium text-[#202824]">
                    {item.kelas || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#E5EAE6] pt-2.5">
                <div className="flex items-center gap-2">
                  <MethodBadge metode={item.metode} />
                  <TimeLabel waktu={item.waktu_checkin} />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onDetail(item)}
                    className="inline-flex h-7.5 items-center gap-1 rounded-xl border border-[#E5EAE6] bg-white px-2.5 text-xs font-medium text-[#78827C] transition hover:bg-[#F5F7F5] hover:text-[#202824]"
                  >
                    <DetailIcon />
                    <span>Detail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="inline-flex h-7.5 items-center gap-1 rounded-xl border border-[#65B98A]/30 bg-[#E6F2EA] px-2.5 text-xs font-semibold text-[#206440] transition hover:bg-[#E6F2EA]/80"
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

      <div className="border-t border-[#E5EAE6] bg-[#F5F7F5]/50 px-3 py-3">
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
