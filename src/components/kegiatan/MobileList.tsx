"use client";

import { useEffect, useState } from "react";

import {
  formatJam,
  formatTanggal,
  getKegiatanStatus,
} from "../../backend/kegiatan/format";

import type { Kegiatan } from "../../backend/kegiatan/types";

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
  onEdit: (kegiatan: Kegiatan) => void;
  onDelete: (kegiatan: Kegiatan) => void;
  onScanQR: (kegiatan: Kegiatan) => void;
};

function getScanWindow(
  kegiatan: Kegiatan,
  now: number,
): { enabled: boolean; reason: string } {
  const { tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai } = kegiatan;

  if (!tanggal_mulai || !tanggal_selesai || !jam_mulai || !jam_selesai) {
    return {
      enabled: false,
      reason: "Waktu kegiatan belum lengkap",
    };
  }

  const start = new Date(
    `${tanggal_mulai}T${jam_mulai.slice(0, 5)}:00+07:00`,
  ).getTime();

  const end = new Date(
    `${tanggal_selesai}T${jam_selesai.slice(0, 5)}:00+07:00`,
  ).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return {
      enabled: false,
      reason: "Waktu kegiatan tidak valid",
    };
  }

  if (now < start - 30 * 60 * 1000) {
    return {
      enabled: false,
      reason: "Scan QR dibuka 30 menit sebelum kegiatan dimulai",
    };
  }

  if (now >= end) {
    return {
      enabled: false,
      reason: "Kegiatan sudah selesai",
    };
  }

  return {
    enabled: true,
    reason: "Scan QR tersedia",
  };
}

function DetailColumn({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex min-w-0 items-center gap-1 text-gray-400">
        <span className="flex shrink-0 items-center justify-center [&>svg]:h-3 [&>svg]:w-3">
          {icon}
        </span>

        <span className="truncate text-[8px] font-semibold uppercase tracking-[0.04em]">
          {label}
        </span>
      </div>

      <div className="min-w-0 text-[9px] leading-4 text-gray-700">
        {children}
      </div>
    </div>
  );
}

export default function MobileList({
  data,
  onEdit,
  onDelete,
  onScanQR,
}: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 15000);

    return () => window.clearInterval(interval);
  }, []);

  if (data.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_3px_12px_rgba(15,23,42,0.035)] md:hidden">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="md:hidden">
      <ul aria-label="Daftar kegiatan" className="space-y-3">
        {data.map((item) => {
          const itemStatus = getKegiatanStatus(
            item.tanggal_mulai,
            item.tanggal_selesai,
            item.jam_mulai,
            item.jam_selesai,
          );

          const scanWindow = getScanWindow(item, now);

          const tanggalMulai = formatTanggal(item.tanggal_mulai);

          const tanggalSelesai =
            item.tanggal_selesai !== item.tanggal_mulai
              ? formatTanggal(item.tanggal_selesai)
              : null;

          return (
            <li
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_3px_12px_rgba(15,23,42,0.035)] transition-colors duration-150 hover:border-teal-200"
            >
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[8px] font-semibold uppercase tracking-widest text-teal-700">
                      Kegiatan
                    </p>

                    <h3 className="wrap-break-word text-[13px] font-bold leading-normal tracking-[-0.01em] text-gray-900 transition-colors group-hover:text-teal-800">
                      {item.nama}
                    </h3>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    <StatusBadge status={itemStatus} />
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="mt-2 mb-3 h-px w-full bg-gray-200"
                />

                <div className="grid grid-cols-3 gap-2">
                  <DetailColumn icon={<CalendarIcon />} label="Tanggal">
                    <p className="wrap-break-word font-semibold text-gray-700">
                      {tanggalMulai}
                    </p>

                    {tanggalSelesai && (
                      <p className="mt-0.5 wrap-break-word text-[8px] text-gray-400">
                        s.d. {tanggalSelesai}
                      </p>
                    )}
                  </DetailColumn>

                  <div className="min-w-0 border-l border-gray-100 pl-2">
                    <DetailColumn icon={<ClockIcon />} label="Waktu">
                      <p className="wrap-break-word font-semibold tabular-nums text-gray-700">
                        {formatJam(item.jam_mulai)}
                      </p>

                      <p className="wrap-break-word text-[8px] text-gray-400">
                        s.d. {formatJam(item.jam_selesai)}
                      </p>
                    </DetailColumn>
                  </div>

                  <div className="min-w-0 border-l border-gray-100 pl-2">
                    <DetailColumn icon={<LocationIcon />} label="Lokasi">
                      <p className="wrap-break-word text-gray-700">
                        {item.lokasi || (
                          <span className="italic text-gray-400">
                            Belum ditentukan
                          </span>
                        )}
                      </p>
                    </DetailColumn>
                  </div>
                </div>

                <div className="mt-3 border-t border-gray-100 pt-2.5">
                  <CreatorText
                    kegiatan={item}
                    className="text-[9px] leading-4 text-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50/60 p-3">
                <div className="min-w-0 flex-1">
                  <ScanButton
                    label={scanWindow.enabled ? "Scan QR" : scanWindow.reason}
                    onClick={() => {
                      if (!getScanWindow(item, Date.now()).enabled) return;
                      onScanQR(item);
                    }}
                    large
                    disabled={!scanWindow.enabled}
                  />
                </div>

                <IconButton label="Edit kegiatan" onClick={() => onEdit(item)}>
                  <EditIcon />
                </IconButton>

                <IconButton
                  label="Hapus kegiatan"
                  onClick={() => onDelete(item)}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-center text-[9px] leading-4 text-gray-400">
        Menampilkan {data.length} kegiatan
      </p>
    </div>
  );
}
