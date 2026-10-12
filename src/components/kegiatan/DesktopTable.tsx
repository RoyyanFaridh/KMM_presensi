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

type Props = {
  data: Kegiatan[];
  sort: SortConfig;
  onSort: (key: SortKey) => void;
  onEdit: (kegiatan: Kegiatan) => void;
  onDelete: (kegiatan: Kegiatan) => void;
  onScanQR: (kegiatan: Kegiatan) => void;
};

const columns: {
  key: SortKey;
  label: string;
  className: string;
}[] = [
  { key: "nama", label: "Nama Kegiatan", className: "w-[22%]" },
  { key: "tanggal_mulai", label: "Tanggal", className: "w-[17%]" },
  { key: "jam_mulai", label: "Waktu", className: "w-[14%]" },
  { key: "lokasi", label: "Lokasi", className: "w-[17%]" },
];

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
        "inline-flex h-4 w-4 shrink-0 items-center justify-center",
        active ? "text-teal-700" : "text-gray-400 group-hover:text-gray-600",
      ].join(" ")}
    >
      {active ? (
        direction === "asc" ? (
          <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
            <path
              d="m5 12 5-5 5 5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
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
        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
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

function StatusBadge({ status }: { status: string }) {
  const config = {
    sedang_berlangsung: {
      label: "Berlangsung",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
      dotClassName: "bg-emerald-500",
    },
    akan_berlangsung: {
      label: "Akan berlangsung",
      className: "bg-amber-50 text-amber-700 ring-amber-600/15",
      dotClassName: "bg-amber-500",
    },
    selesai: {
      label: "Selesai",
      className: "bg-gray-100 text-gray-600 ring-gray-500/15",
      dotClassName: "bg-gray-400",
    },
  } as const;

  const current = config[status as keyof typeof config] ?? config.selesai;

  return (
    <span
      className={[
        "inline-flex max-w-full items-center justify-center gap-1.5 rounded-md px-2 py-1",
        "text-[10px] font-medium ring-1 ring-inset",
        current.className,
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 shrink-0 rounded-full",
          current.dotClassName,
        ].join(" ")}
      />
      <span className="truncate">{current.label}</span>
    </span>
  );
}

function DateIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-3.5 w-3.5 shrink-0 text-gray-400"
    >
      <rect
        x="3"
        y="5"
        width="14"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6.5 3v4M13.5 3v4M3 9h14"
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
      className="h-3.5 w-3.5 shrink-0 text-gray-400"
    >
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 6v4l2.5 1.5"
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
      className="h-3.5 w-3.5 shrink-0 text-gray-400"
    >
      <path
        d="M16 8.3c0 4.1-6 8.7-6 8.7S4 12.4 4 8.3a6 6 0 1 1 12 0Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

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

function ActionIconButton({
  label,
  onClick,
  children,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "danger";
}) {
  const variantClass =
    variant === "danger"
      ? "text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      : "text-gray-500 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1",
        variantClass,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function CreatorInfo({ kegiatan }: { kegiatan: Kegiatan }) {
  const label = kegiatan.creator_label || "Belum tercatat";
  const nama = kegiatan.creator_nama;

  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      <span
        className={[
          "inline-flex max-w-full items-center justify-center rounded-md px-2 py-1",
          "text-[10px] font-medium leading-4",
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
      className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm md:block"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-262.5 table-fixed border-collapse text-center">
          <colgroup>
            <col className="w-16" />
            {columns.map((column) => (
              <col key={column.key} className={column.className} />
            ))}
            <col className="w-[15%]" />
            <col className="w-[11%]" />
            <col className="w-[14%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th
                scope="col"
                className="px-4 py-3 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-500"
              >
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
                    className="px-3 py-3 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-500"
                  >
                    <button
                      type="button"
                      onClick={() => onSort(column.key)}
                      aria-label={`Urutkan berdasarkan ${column.label}`}
                      className={[
                        "group mx-auto inline-flex items-center justify-center gap-1",
                        "rounded-sm transition-colors hover:text-gray-900",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600",
                        active ? "text-teal-800" : "",
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

              <th
                scope="col"
                className="px-3 py-3 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-500"
              >
                Dibuat oleh
              </th>

              <th
                scope="col"
                className="px-3 py-3 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-500"
              >
                Status
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-500"
              >
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5"
                      >
                        <rect
                          x="4"
                          y="5"
                          width="16"
                          height="15"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M8 3v4M16 3v4M4 10h16"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>

                    <p className="text-[11px] font-semibold text-gray-800">
                      Belum ada kegiatan
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-gray-500">
                      Kegiatan yang tersedia akan ditampilkan di tabel ini.
                    </p>
                  </div>
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

                const tanggalMulai = formatTanggal(item.tanggal_mulai);
                const tanggalSelesai =
                  item.tanggal_selesai !== item.tanggal_mulai
                    ? formatTanggal(item.tanggal_selesai)
                    : null;

                return (
                  <tr
                    key={item.id}
                    className="group transition-colors duration-150 hover:bg-gray-50/80"
                  >
                    <td className="px-4 py-4 text-center align-middle text-[11px] tabular-nums text-gray-400">
                      {index + 1}
                    </td>

                    <td className="px-3 py-4 text-left align-middle">
                      <p className="wrap-break-word text-[11px] font-medium leading-5 text-gray-800">
                        {item.nama}
                      </p>
                    </td>

                    <td className="px-3 py-4 text-center align-middle">
                      <div className="inline-flex items-start justify-center gap-2 text-left text-[11px] leading-5 text-gray-600">
                        <span className="mt-0.5">
                          <DateIcon />
                        </span>

                        <div className="min-w-0">
                          <p>{tanggalMulai}</p>

                          {tanggalSelesai && (
                            <p className="mt-0.5 text-[9px] leading-4 text-gray-400">
                              s.d. {tanggalSelesai}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4 text-center align-middle">
                      <div className="inline-flex items-center justify-center gap-2 text-[11px] leading-5 text-gray-600">
                        <ClockIcon />
                        <span className="whitespace-nowrap tabular-nums">
                          {formatJam(item.jam_mulai)} -{" "}
                          {formatJam(item.jam_selesai)}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-4 text-center align-middle">
                      <div className="inline-flex items-start justify-center gap-2 text-left text-[11px] leading-5 text-gray-600">
                        <span className="mt-0.5">
                          <LocationIcon />
                        </span>

                        <span className="min-w-0 wrap-break-word">
                          {item.lokasi || "Belum ditentukan"}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-4 text-center align-middle">
                      <CreatorInfo kegiatan={item} />
                    </td>

                    <td className="px-3 py-4 text-center align-middle">
                      <StatusBadge status={itemStatus} />
                    </td>

                    <td className="px-4 py-4 text-center align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onScanQR(item)}
                          aria-label={`Scan QR untuk ${item.nama}`}
                          title="Scan QR"
                          className={[
                            "inline-flex h-8 w-8 items-center justify-center rounded-md",
                            "bg-teal-700 text-white",
                            "transition-colors hover:bg-teal-800",
                            "focus-visible:outline-none focus-visible:ring-2",
                            "focus-visible:ring-teal-600 focus-visible:ring-offset-1",
                          ].join(" ")}
                        >
                          <QrIcon />
                        </button>

                        <ActionIconButton
                          label={`Edit ${item.nama}`}
                          onClick={() => onEdit(item)}
                        >
                          <span className="flex h-4 w-4 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                            <EditIcon />
                          </span>
                        </ActionIconButton>

                        <ActionIconButton
                          label={`Hapus ${item.nama}`}
                          onClick={() => onDelete(item)}
                          variant="danger"
                        >
                          <span className="flex h-4 w-4 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                            <DeleteIcon />
                          </span>
                        </ActionIconButton>
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
        <footer className="flex min-h-11 items-center justify-between gap-4 border-t border-gray-200 bg-white px-4 py-2.5">
          <p className="text-[10px] text-gray-500">
            Menampilkan{" "}
            <span className="font-semibold tabular-nums text-gray-700">
              {data.length}
            </span>{" "}
            kegiatan
          </p>

          <p className="text-[9px] text-gray-400">
            Klik judul kolom untuk mengurutkan
          </p>
        </footer>
      )}
    </section>
  );
}
