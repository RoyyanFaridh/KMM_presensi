"use client";

import {
  formatJam,
  formatTanggal,
  getKegiatanStatus,
} from "../../backend/kegiatan/format";

import type {
  Kegiatan,
  SortConfig,
  SortKey,
} from "../../backend/kegiatan/types";

import { DeleteIcon, EditIcon } from "../mudamudi/icons";

import {
  CalendarIcon,
  ClockIcon,
  CreatorText,
  EmptyState,
  IconButton,
  LocationIcon,
  ScanButton,
  StatusBadge,
} from "./shared";

type Props = {
  data: Kegiatan[];
  sort: SortConfig;
  onSort: (key: SortKey) => void;
  onEdit: (kegiatan: Kegiatan) => void;
  onDelete: (kegiatan: Kegiatan) => void;
  onScanQR: (kegiatan: Kegiatan) => void;
};

const columns: { key: SortKey; label: string }[] = [
  { key: "nama", label: "Nama Kegiatan" },
  { key: "tanggal_mulai", label: "Tanggal" },
  { key: "jam_mulai", label: "Waktu" },
  { key: "lokasi", label: "Lokasi" },
];

const HEADER_CELL =
  "px-3.5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.07em] text-[#78827C]";

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction?: "asc" | "desc";
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded",
        "transition-colors",
        active
          ? "bg-[#E6F2EA] text-[#287A50]"
          : "text-[#9AA39D] group-hover:bg-[#F0F4F1] group-hover:text-[#78827C]",
      ].join(" ")}
    >
      {active ? (
        direction === "asc" ? (
          <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
            <path
              d="m5 12 5-5 5 5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
            <path
              d="m5 8 5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      ) : (
        <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
          <path
            d="m6 8 4-4 4 4M6 12l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

function RowNumber({ value }: { value: number }) {
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-[#F0F4F1] px-1 text-[9px] font-medium tabular-nums text-[#78827C] transition-colors group-hover:bg-[#E6F2EA] group-hover:text-[#287A50]">
      {value}
    </span>
  );
}

export default function DesktopTable({
  data,
  sort,
  onSort,
  onEdit,
  onDelete,
  onScanQR,
}: Props) {
  return (
    <section
      aria-label="Daftar kegiatan"
      className="hidden overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xs md:block"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#E5EAE6] bg-[#E6F2EA] text-[#287A50]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <rect
                x="3.5"
                y="5"
                width="17"
                height="15.5"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M8 13h3M8 16h6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-[10px] font-semibold tracking-tight text-[#202824]">
              Daftar Kegiatan
            </h2>
            <p className="mt-0.5 text-[9px] leading-3.5 text-[#78827C]">
              Informasi jadwal dan pengelolaan presensi
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E5EAE6] bg-[#F5F7F5] px-2.5 py-1 text-[9px] font-medium text-[#78827C]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#287A50]" />
          {data.length} kegiatan
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-245 table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-12" />
            <col className="w-[24%]" />
            <col className="w-[15%]" />
            <col className="w-[12%]" />
            <col className="w-[15%]" />
            <col className="w-[14%]" />
            <col className="w-[15%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-[#E5EAE6] bg-[#F5F7F5]">
              <th scope="col" className={`${HEADER_CELL} text-center`}>
                No.
              </th>
              {columns.map((column) => {
                const active = sort?.key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      active
                        ? sort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className={HEADER_CELL}
                  >
                    <button
                      type="button"
                      onClick={() => onSort(column.key)}
                      aria-label={`Urutkan berdasarkan ${column.label}`}
                      className={[
                        "group inline-flex min-h-7 items-center gap-1.5 rounded-md",
                        "transition-colors hover:text-[#287A50]",
                        "focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-[#287A50] focus-visible:ring-offset-2",
                        active ? "text-[#287A50]" : "",
                      ].join(" ")}
                    >
                      <span>{column.label}</span>
                      <SortIndicator
                        active={active}
                        direction={active ? sort.direction : undefined}
                      />
                    </button>
                  </th>
                );
              })}
              <th scope="col" className={HEADER_CELL}>
                Status
              </th>
              <th scope="col" className={`${HEADER_CELL} text-right`}>
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5EAE6]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-0">
                  <EmptyState />
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const itemStatus = getKegiatanStatus(
                  item.tanggal_mulai,
                  item.tanggal_selesai,
                  item.jam_mulai,
                  item.jam_selesai,
                );
                const scanQRAvailable = itemStatus === "sedang_berlangsung";
                const tanggalMulai = formatTanggal(item.tanggal_mulai);
                const tanggalSelesai =
                  item.tanggal_selesai !== item.tanggal_mulai
                    ? formatTanggal(item.tanggal_selesai)
                    : null;

                return (
                  <tr
                    key={item.id}
                    className="group transition-colors duration-150 hover:bg-[#F5F7F5]"
                  >
                    <td className="px-3 py-4 text-center align-middle">
                      <RowNumber value={index + 1} />
                    </td>

                    <td className="px-3.5 py-4 align-middle">
                      <p className="wrap-break-word text-[10px] font-semibold leading-[1.6] text-[#202824] transition-colors group-hover:text-[#287A50]">
                        {item.nama}
                      </p>
                      <div className="mt-1">
                        <CreatorText
                          kegiatan={item}
                          className="text-[9px] leading-4 text-[#9AA39D]"
                        />
                      </div>
                    </td>

                    <td className="px-3.5 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#F5F7F5] text-[#9AA39D] transition-colors group-hover:bg-[#E6F2EA] group-hover:text-[#287A50]">
                          <CalendarIcon />
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-[10px] font-medium leading-4 text-[#202824]">
                            {tanggalMulai}
                          </p>
                          {tanggalSelesai && (
                            <p className="mt-1 text-[9px] leading-3.5 text-[#9AA39D]">
                              s.d. {tanggalSelesai}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-3.5 py-4 align-middle">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#F5F7F5] text-[#9AA39D] transition-colors group-hover:bg-[#E6F2EA] group-hover:text-[#287A50]">
                          <ClockIcon />
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className="whitespace-nowrap text-[10px] font-medium leading-4 tabular-nums text-[#202824]">
                            {formatJam(item.jam_mulai)}
                          </p>
                          <p className="mt-1 whitespace-nowrap text-[9px] leading-3.5 tabular-nums text-[#9AA39D]">
                            s.d. {formatJam(item.jam_selesai)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3.5 py-4 align-middle">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#F5F7F5] text-[#9AA39D] transition-colors group-hover:bg-[#E6F2EA] group-hover:text-[#287A50]">
                          <LocationIcon />
                        </span>
                        <span className="min-w-0 wrap-break-word pt-1 text-[10px] leading-4.5 text-[#78827C]">
                          {item.lokasi || (
                            <span className="italic text-[#9AA39D]">
                              Belum ditentukan
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="px-3.5 py-4 align-middle">
                      <StatusBadge status={itemStatus} />
                    </td>

                    <td className="px-3 py-4 align-middle">
                      <div className="flex items-center justify-end gap-1">
                        <ScanButton
                          label={`Scan QR untuk ${item.nama}`}
                          disabled={!scanQRAvailable}
                          onClick={() => {
                            if (scanQRAvailable) onScanQR(item);
                          }}
                        />
                        <span
                          aria-hidden="true"
                          className="mx-0.5 h-5 w-px shrink-0 bg-[#E5EAE6]"
                        />
                        <IconButton
                          label={`Edit ${item.nama}`}
                          onClick={() => onEdit(item)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          label={`Hapus ${item.nama}`}
                          onClick={() => onDelete(item)}
                          variant="danger"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <footer className="flex min-h-10 items-center justify-between gap-3 border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-2.5">
          <p className="text-[9px] text-[#78827C]">
            Menampilkan{" "}
            <span className="font-semibold tabular-nums text-[#202824]">
              {data.length}
            </span>{" "}
            kegiatan
          </p>
          <p className="inline-flex items-center gap-1.5 text-[9px] text-[#9AA39D]">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path
                d="M10 4v12M4 10h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Klik judul kolom untuk mengurutkan
          </p>
        </footer>
      )}
    </section>
  );
}
