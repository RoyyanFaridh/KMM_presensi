"use client";

import {
  formatJam,
  formatTanggal,
  getKegiatanStatus,
  getKegiatanStatusLabel,
} from "../../backend/kegiatan/format";
import { Kegiatan, SortConfig, SortKey } from "../../backend/kegiatan/types";
import { DeleteIcon, EditIcon } from "../mudamudi/icons";

type Props = {
  data: Kegiatan[];
  sort: SortConfig;
  onSort: (key: SortKey) => void;
  onEdit: (kegiatan: Kegiatan) => void;
  onDelete: (kegiatan: Kegiatan) => void;
  onShowQR: (kegiatan: Kegiatan) => void;
};

const columns: {
  key: SortKey;
  label: string;
}[] = [
  { key: "nama", label: "Kegiatan" },
  { key: "tanggal_mulai", label: "Tanggal" },
  { key: "jam_mulai", label: "Waktu" },
  { key: "lokasi", label: "Lokasi" },
];

export default function DesktopTable({
  data,
  sort,
  onSort,
  onEdit,
  onDelete,
  onShowQR,
}: Props) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-220 table-fixed text-center">
          <colgroup>
            <col className="w-12" />
            <col className="w-56" />
            <col className="w-36" />
            <col className="w-28" />
            <col className="w-36" />
            <col className="w-24" />
            <col className="w-40" />
          </colgroup>

          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                No
              </th>

              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 transition-colors hover:text-gray-900"
                  >
                    <span>{column.label}</span>

                    {sort?.key === column.key && (
                      <span className="text-teal-600">
                        {sort.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </th>
              ))}

              <th className="px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-xs text-gray-400"
                >
                  Tidak ada data kegiatan.
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

                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-center text-xs tabular-nums text-gray-400">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 text-left">
                      <p
                        className="truncate text-xs font-medium text-gray-900"
                        title={item.nama}
                      >
                        {item.nama}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-gray-600">
                      {formatTanggal(item.tanggal_mulai)}

                      {item.tanggal_selesai !== item.tanggal_mulai && (
                        <>
                          <span className="mx-1 text-gray-300">-</span>
                          {formatTanggal(item.tanggal_selesai)}
                        </>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-gray-600">
                      {formatJam(item.jam_mulai)} -{" "}
                      {formatJam(item.jam_selesai)}
                    </td>

                    <td className="px-4 py-3 text-left">
                      <p
                        className="truncate text-xs text-gray-600"
                        title={item.lokasi}
                      >
                        {item.lokasi}
                      </p>
                    </td>

                    <td className="px-2 py-3 align-middle">
                      {itemStatus === "sedang_berlangsung" ? (
                        <span className="inline-block max-w-full rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-medium leading-3 text-emerald-700">
                          Sedang berlangsung
                        </span>
                      ) : itemStatus === "akan_berlangsung" ? (
                        <span className="inline-block max-w-full rounded-full bg-amber-50 px-2 py-1 text-[9px] font-medium leading-3 text-amber-700">
                          Akan berlangsung
                        </span>
                      ) : (
                        <span className="inline-block max-w-full rounded-full bg-gray-100 px-2 py-1 text-[9px] font-medium leading-3 text-gray-600">
                          Selesai
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onShowQR(item)}
                          className="inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-[10px] font-medium text-teal-700 transition-colors hover:bg-teal-50"
                        >
                          QR
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                          aria-label={`Edit ${item.nama}`}
                          title="Edit"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label={`Hapus ${item.nama}`}
                          title="Hapus"
                        >
                          <DeleteIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
