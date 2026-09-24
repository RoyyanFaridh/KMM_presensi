"use client";

import {
  formatJam,
  formatTanggal,
  getKegiatanStatus,
  getKegiatanStatusLabel,
} from "../../backend/kegiatan/format";

import { Kegiatan } from "../../backend/kegiatan/types";

import { DeleteIcon, EditIcon } from "../mudamudi/icons";

type Props = {
  data: Kegiatan[];
  onEdit: (kegiatan: Kegiatan) => void;
  onDelete: (kegiatan: Kegiatan) => void;
  onScanQR: (kegiatan: Kegiatan) => void;
};

export default function MobileList({
  data,
  onEdit,
  onDelete,
  onScanQR,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center md:hidden">
        <p className="text-xs font-medium text-gray-500">
          Tidak ada data kegiatan.
        </p>

        <p className="mt-1 text-[10px] text-gray-400">
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

        return (
          <article key={item.id} className="px-3 py-2.5">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="shrink-0 text-[8px] font-medium text-gray-400">
                    #{index + 1}
                  </span>

                  <h3
                    className="truncate text-xs font-semibold text-gray-900"
                    title={item.nama}
                  >
                    {item.nama}
                  </h3>
                </div>

                <p className="mt-1 truncate text-[10px] text-gray-400">
                  {formatTanggal(item.tanggal_mulai)}

                  {item.tanggal_selesai !== item.tanggal_mulai && (
                    <>
                      <span className="mx-1 text-gray-300">-</span>

                      {formatTanggal(item.tanggal_selesai)}
                    </>
                  )}

                  <span className="mx-1 text-gray-300">•</span>

                  <span className="tabular-nums">
                    {formatJam(item.jam_mulai)} - {formatJam(item.jam_selesai)}
                  </span>

                  <span className="mx-1 text-gray-300">•</span>

                  <span title={item.lokasi}>{item.lokasi}</span>
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-medium leading-4 ${statusClass}`}
              >
                {getKegiatanStatusLabel(itemStatus)}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => onScanQR(item)}
                className="inline-flex h-6.5 items-center justify-center rounded-md bg-teal-50 px-2.5 text-[10px] font-semibold text-teal-700 transition-colors hover:bg-teal-100 active:bg-teal-100"
              >
                Scan QR
              </button>

              <span className="mx-0.5 h-4 w-px bg-gray-200" />

              <button
                type="button"
                onClick={() => onEdit(item)}
                className="inline-flex h-6.5 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
                aria-label={`Edit ${item.nama}`}
                title="Edit kegiatan"
              >
                <EditIcon className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(item)}
                className="inline-flex h-6.5 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 active:bg-red-100"
                aria-label={`Hapus ${item.nama}`}
                title="Hapus kegiatan"
              >
                <DeleteIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
