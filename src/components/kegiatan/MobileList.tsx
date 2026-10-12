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

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-3 w-3 shrink-0"
    >
      <rect
        x="3"
        y="4.5"
        width="14"
        height="12.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6.5 2.8v3.4M13.5 2.8v3.4M3.5 8h13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-3 w-3 shrink-0"
    >
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M10 6v4.3l2.8 1.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-3 w-3 shrink-0"
    >
      <path
        d="M16 8.2c0 4.2-6 9-6 9s-6-4.8-6-9a6 6 0 1 1 12 0Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle
        cx="10"
        cy="8"
        r="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function CreatorInfo({ kegiatan }: { kegiatan: Kegiatan }) {
  const label = kegiatan.creator_label?.trim() || "Belum tercatat";
  const creatorRecorded = Boolean(kegiatan.created_by);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="shrink-0 text-[9px] text-gray-400">
        Dibuat oleh
      </span>

      <span
        title={label}
        className={[
          "inline-flex max-w-full items-center rounded px-1.5 py-0.5",
          "text-[9px] font-medium leading-3.5 wrap-break-word",
          creatorRecorded
            ? "bg-teal-50 text-teal-700"
            : "bg-gray-100 text-gray-500",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  children,
  variant = "neutral",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "neutral" | "danger";
}) {
  const variantClass = {
    primary:
      "border-teal-700 bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900",
    neutral:
      "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 active:bg-gray-100",
    danger:
      "border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:bg-red-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-teal-600 focus-visible:ring-offset-1",
        variantClass[variant],
      ].join(" ")}
    >
      {children}
    </button>
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
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center md:hidden">
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400">
          <CalendarIcon />
        </div>

        <p className="mt-2.5 text-[11px] font-semibold text-gray-700">
          Tidak ada data kegiatan
        </p>

        <p className="mt-1 text-[10px] leading-4 text-gray-400">
          Coba ubah pencarian atau filter yang digunakan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 md:hidden">
      {data.map((item, index) => {
        const itemStatus = getKegiatanStatus(
          item.tanggal_mulai,
          item.tanggal_selesai,
          item.jam_mulai,
          item.jam_selesai,
        );

        const statusClass =
          itemStatus === "sedang_berlangsung"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : itemStatus === "akan_berlangsung"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-gray-200 bg-gray-100 text-gray-600";

        const tanggalMulai = formatTanggal(item.tanggal_mulai);
        const tanggalSelesai =
          item.tanggal_selesai !== item.tanggal_mulai
            ? formatTanggal(item.tanggal_selesai)
            : null;

        return (
          <article
            key={item.id}
            className={[
              "rounded-lg border border-gray-200 bg-white",
              "px-3 py-3",
              "transition-colors hover:border-gray-300 hover:bg-gray-50/30",
            ].join(" ")}
          >
            {/* Nama kegiatan dan status */}
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded bg-gray-50 px-1 text-[9px] font-medium tabular-nums text-gray-400">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <h3
                  className="wrap-break-word text-xs font-semibold leading-4.5 text-gray-900"
                  title={item.nama}
                >
                  {item.nama}
                </h3>
              </div>

              <span
                className={[
                  "inline-flex max-w-27 shrink-0 items-center justify-center",
                  "rounded border px-1.5 py-1 text-center",
                  "text-[9px] font-medium leading-3",
                  statusClass,
                ].join(" ")}
              >
                {getKegiatanStatusLabel(itemStatus)}
              </span>
            </div>

            {/* Detail kegiatan */}
            <div className="ml-7 mt-2.5 space-y-1.5">
              <div className="flex items-start gap-1.5 text-[10px] leading-4 text-gray-600">
                <span className="mt-0.5 text-gray-400">
                  <CalendarIcon />
                </span>

                <span className="min-w-0 wrap-break-word">
                  {tanggalMulai}
                  {tanggalSelesai && ` - ${tanggalSelesai}`}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] leading-4 text-gray-600">
                <span className="text-gray-400">
                  <ClockIcon />
                </span>

                <span className="tabular-nums">
                  {formatJam(item.jam_mulai)} -{" "}
                  {formatJam(item.jam_selesai)}
                </span>
              </div>

              <div className="flex items-start gap-1.5 text-[10px] leading-4 text-gray-600">
                <span className="mt-0.5 text-gray-400">
                  <LocationIcon />
                </span>

                <span
                  className="min-w-0 wrap-break-word"
                  title={item.lokasi || undefined}
                >
                  {item.lokasi || "Belum ditentukan"}
                </span>
              </div>
            </div>

            {/* Pembuat dan aksi */}
            <div className="ml-7 mt-2.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 border-t border-gray-100 pt-2.5">
              <CreatorInfo kegiatan={item} />

              <div className="ml-auto flex shrink-0 items-center gap-1">
                <ActionButton
                  label={`Scan QR untuk ${item.nama}`}
                  onClick={() => onScanQR(item)}
                  variant="primary"
                >
                  <QrIcon />
                </ActionButton>

                <ActionButton
                  label={`Edit ${item.nama}`}
                  onClick={() => onEdit(item)}
                >
                  <span className="flex h-3.5 w-3.5 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                    <EditIcon />
                  </span>
                </ActionButton>

                <ActionButton
                  label={`Hapus ${item.nama}`}
                  onClick={() => onDelete(item)}
                  variant="danger"
                >
                  <span className="flex h-3.5 w-3.5 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                    <DeleteIcon />
                  </span>
                </ActionButton>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
