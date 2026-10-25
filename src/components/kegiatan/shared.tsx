import type { ReactNode } from "react";

import {
  getKegiatanStatus,
  getKegiatanStatusLabel,
} from "../../backend/kegiatan/format";

import type { Kegiatan } from "../../backend/kegiatan/types";

type IconProps = { className?: string };
type KegiatanStatus = ReturnType<typeof getKegiatanStatus>;

export function QrIcon({ className = "h-3.5 w-3.5 shrink-0" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
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

export function CalendarIcon({ className = "h-3 w-3 shrink-0" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
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

export function ClockIcon({ className = "h-3 w-3 shrink-0" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
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

export function LocationIcon({ className = "h-3 w-3 shrink-0" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M16 8.2c0 4.2-6 9-6 9s-6-4.8-6-9a6 6 0 1 1 12 0Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

const STATUS_STYLES = {
  sedang_berlangsung: {
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dotClassName: "bg-emerald-500",
  },
  akan_berlangsung: {
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dotClassName: "bg-amber-500",
  },
  selesai: {
    className: "bg-gray-100 text-gray-600 ring-gray-500/20",
    dotClassName: "bg-gray-400",
  },
} as const;

export function StatusBadge({ status }: { status: KegiatanStatus }) {
  const style =
    STATUS_STYLES[status as keyof typeof STATUS_STYLES] ??
    STATUS_STYLES.selesai;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5",
        "text-[10px] font-medium leading-4 ring-1 ring-inset",
        style.className,
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 shrink-0 rounded-full",
          style.dotClassName,
        ].join(" ")}
      />
      <span>{getKegiatanStatusLabel(status)}</span>
    </span>
  );
}

export function CreatorText({
  kegiatan,
  className = "",
}: {
  kegiatan: Kegiatan;
  className?: string;
}) {
  const label = kegiatan.creator_label?.trim() || "Belum tercatat";
  const recorded = Boolean(kegiatan.created_by);

  return (
    <p
      title={label}
      className={`text-[10px] leading-4 text-gray-500 ${className}`}
    >
      Dibuat oleh{" "}
      <span className={recorded ? "font-medium text-gray-700" : "italic"}>
        {label}
      </span>
    </p>
  );
}

export function EmptyState() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-8 text-center">
      <span className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
        <CalendarIcon className="h-4 w-4" />
      </span>

      <p className="text-[11px] font-semibold text-gray-800">
        Tidak ada kegiatan
      </p>

      <p className="mt-1 text-[11px] leading-4.5 text-gray-500">
        Belum ada kegiatan yang tersedia, atau tidak ada yang cocok dengan
        pencarian dan filter saat ini.
      </p>
    </div>
  );
}

export function IconButton({
  label,
  onClick,
  children,
  variant = "neutral",
  size = "md",
  bordered = false,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  variant?: "neutral" | "danger";
  size?: "md" | "lg";
  bordered?: boolean;
}) {
  const sizeClass = size === "lg" ? "h-9 w-9" : "h-8 w-8";
  const borderClass = bordered
    ? "border-gray-200 bg-white"
    : "border-transparent";
  const variantClass =
    variant === "danger"
      ? "hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:bg-red-100"
      : "hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 active:bg-gray-100";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-md border text-gray-500",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1",
        sizeClass,
        borderClass,
        variantClass,
      ].join(" ")}
    >
      <span className="flex h-3.5 w-3.5 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
        {children}
      </span>
    </button>
  );
}

export function ScanButton({
  label,
  onClick,
  large = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  large?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={
        disabled
          ? "Scan QR hanya tersedia 30 menit sebelum kegiatan dimulai hingga kegiatan selesai"
          : label
      }
      className={[
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1",
        large ? "h-9 w-full flex-1 text-[11px]" : "h-8 px-2.5 text-[10px]",
        disabled
          ? "cursor-not-allowed bg-gray-100 text-gray-400"
          : "bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900",
      ].join(" ")}
    >
      <QrIcon />
      <span>{large ? "Scan QR" : "Scan"}</span>
    </button>
  );
}
