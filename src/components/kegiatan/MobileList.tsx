"use client";

import {
  formatJam,
  formatTanggal,
  getKegiatanStatus,
  getKegiatanStatusLabel,
} from "../../backend/kegiatan/format";

import type { Kegiatan } from "../../backend/kegiatan/types";

import { DeleteIcon, EditIcon } from "../mudamudi/icons";

type Props = {
  data: Kegiatan[];
  onEdit: (kegiatan: Kegiatan) => void;
  onDelete: (kegiatan: Kegiatan) => void;
  onScanQR: (kegiatan: Kegiatan) => void;
};

function QrIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-3.5 w-3.5 shrink-0"
    >
      <rect
        x="2.5"
        y="2.5"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="11.5"
        y="2.5"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="2.5"
        y="11.5"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 12h2v2h-2zM16 12h1.5M12 16h2M16 15v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CreatorInfo({ kegiatan }: { kegiatan: Kegiatan }) {
  const label = kegiatan.creator_label || "Belum tercatat";
  const nama = kegiatan.creator_nama;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
      <span className="text-[10px] font-medium text-gray-400">
        Dibuat oleh:
      </span>

      <span
        className={[
          "inline-flex max-w-full items-center rounded-md px-2 py-0.5",
          "text-[9px] font-medium leading-4",
          kegiatan.created_by
            ? "bg-teal-50 text-teal-700"
            : "bg-gray-100 text-gray-500",
        ].join(" ")}
      >
        <span className="wrap-break-word">{label}</span>
      </span>

      {nama && nama !== label && (
        <span className="max-w-full wrap-break-word text-[10px] leading-4 text-gray-500">
          {nama}
        </span>
      )}
    </div>
  );
}

export default function MobileList({
  data,
  onEdit,
  onDelete,
  onScanQR,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center md:hidden">
        <p className="text-[11px] font-medium text-gray-500">
          Tidak ada data kegiatan.
        </p>

        <p className="mt-1 text-[9px] leading-4 text-gray-400">
          Coba ubah pencarian atau filter yang digunakan.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white md:hidden">
      {data.map((item, index) => {
        const itemStatus = getKegiatanStatus(
          item.tanggal_mulai,
          item.tanggal_selesai,
          item.jam_mulai,
          item.jam_selesai,
        );

        const statusClass =
          itemStatus === "sedang_berlangsung"
            ? "bg-emerald-50 text-emerald-700"
            : itemStatus === "akan_berlangsung"
              ? "bg-amber-50 text-amber-700"
              : "bg-gray-100 text-gray-600";

        const tanggalMulai = formatTanggal(item.tanggal_mulai);
        const tanggalSelesai =
          item.tanggal_selesai !== item.tanggal_mulai
            ? formatTanggal(item.tanggal_selesai)
            : null;

        return (
          <article
            key={item.id}
            className="px-3 py-3 transition-colors hover:bg-gray-50/70"
          >
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0 text-[9px] font-medium tabular-nums text-gray-400">
                    #{index + 1}
                  </span>

                  <h3
                    className="min-w-0 wrap-break-word text-[11px] font-semibold leading-4 text-gray-900"
                    title={item.nama}
                  >
                    {item.nama}
                  </h3>
                </div>
              </div>

              <span
                className={[
                  "mt-0.5 inline-flex shrink-0 items-center rounded-full px-2 py-0.5",
                  "text-[9px] font-medium leading-4",
                  statusClass,
                ].join(" ")}
              >
                {getKegiatanStatusLabel(itemStatus)}
              </span>
            </div>

            <div className="mt-2 space-y-1 pl-5">
              <p className="flex flex-wrap items-center gap-x-1.5 text-[10px] leading-4 text-gray-500">
                <span>
                  {tanggalMulai}
                  {tanggalSelesai && ` - ${tanggalSelesai}`}
                </span>

                <span aria-hidden="true" className="text-gray-300">
                  •
                </span>

                <span className="tabular-nums">
                  {formatJam(item.jam_mulai)} - {formatJam(item.jam_selesai)}
                </span>
              </p>

              <p
                className="wrap-break-word text-[10px] leading-4 text-gray-500"
                title={item.lokasi || undefined}
              >
                <span className="font-medium text-gray-400">Lokasi: </span>
                {item.lokasi || "Belum ditentukan"}
              </p>

              <div className="border-t border-gray-100 pt-2">
                <CreatorInfo kegiatan={item} />
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => onScanQR(item)}
                aria-label={`Scan QR untuk ${item.nama}`}
                title="Scan QR"
                className={[
                  "inline-flex h-7 w-7 items-center justify-center rounded-md",
                  "bg-teal-700 text-white transition-colors",
                  "hover:bg-teal-800 active:bg-teal-900",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-teal-600 focus-visible:ring-offset-1",
                ].join(" ")}
              >
                <QrIcon />
              </button>

              <button
                type="button"
                onClick={() => onEdit(item)}
                className={[
                  "inline-flex h-7 w-7 items-center justify-center rounded-md",
                  "text-gray-500 transition-colors hover:bg-gray-100",
                  "hover:text-gray-900 active:bg-gray-200",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-teal-600 focus-visible:ring-offset-1",
                ].join(" ")}
                aria-label={`Edit ${item.nama}`}
                title="Edit kegiatan"
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                  <EditIcon />
                </span>
              </button>

              <button
                type="button"
                onClick={() => onDelete(item)}
                className={[
                  "inline-flex h-7 w-7 items-center justify-center rounded-md",
                  "text-gray-500 transition-colors hover:bg-red-50",
                  "hover:text-red-600 active:bg-red-100",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-red-500 focus-visible:ring-offset-1",
                ].join(" ")}
                aria-label={`Hapus ${item.nama}`}
                title="Hapus kegiatan"
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                  <DeleteIcon />
                </span>
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
