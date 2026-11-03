"use client";

import { Mudamudi, SortKey } from "../../backend/mudamudi/types";
import {
  toTitleCase,
  getInitials,
  getAvatarColor,
} from "../../backend/mudamudi/format";
import { getKelasBadgeClass } from "../../backend/mudamudi/kelasBadge";
import { DetailIcon, EditIcon, DeleteIcon } from "./icons";
import { IconButton } from "../kegiatan/shared";

type Props = {
  data: Mudamudi[];
  startIndex: number;
  sortIndicator: (key: SortKey) => string;
  toggleSort: (key: SortKey) => void;
  onDetail: (s: Mudamudi) => void;
  onEdit: (s: Mudamudi) => void;
  onDelete: (s: Mudamudi) => void;
  onShowQR: (s: Mudamudi) => void;
};

const HEADER_CELL =
  "px-3.5 py-3 text-center text-[9px] font-semibold uppercase tracking-[0.07em] text-gray-500";

function SortIndicator({ indicator }: { indicator: string }) {
  const active = Boolean(indicator);

  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded",
        "transition-colors",
        active
          ? "bg-teal-100 text-teal-700"
          : "text-gray-400 group-hover:bg-gray-200/70 group-hover:text-gray-600",
      ].join(" ")}
    >
      {active ? (
        indicator === " ▲" ? (
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
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-gray-100 px-1 text-[9px] font-normal tabular-nums text-gray-500 transition-colors group-hover:bg-teal-50 group-hover:text-teal-700">
      {value}
    </span>
  );
}

export default function DesktopTable({
  data,
  startIndex,
  sortIndicator,
  toggleSort,
  onDetail,
  onEdit,
  onDelete,
  onShowQR,
}: Props) {
  const columns: { key: SortKey; label: string }[] = [
    { key: "desa", label: "Desa" },
    { key: "kelompok", label: "Kelompok" },
    { key: "nama", label: "Nama" },
  ];

  return (
    <section
      aria-label="Daftar Generus"
      className="hidden overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_3px_12px_rgba(15,23,42,0.035)] md:block"
    >
      {/* Table Header Section */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle
                cx="10"
                cy="7.5"
                r="3.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M16 4.5a3.5 3.5 0 0 1 0 6.8M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <h2 className="text-[10px] font-semibold tracking-tight text-gray-800">
              Daftar Generus
            </h2>
            <p className="mt-0.5 text-[9px] leading-3.5 text-gray-400">
              Data anggota Generus dan informasi presensi
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[9px] font-medium text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
          {data.length} Generus
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-245 table-fixed border-collapse text-center">
          <colgroup>
            <col className="w-12" />
            <col className="w-[16%]" />
            <col className="w-[18%]" />
            <col className="w-[28%]" />
            <col className="w-[10%]" />
            <col className="w-[13%]" />
            <col className="w-[15%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/90">
              <th scope="col" className={`${HEADER_CELL} text-center`}>
                No.
              </th>

              {columns.map((column) => {
                const indicator = sortIndicator(column.key);
                const active = Boolean(indicator);

                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={HEADER_CELL}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      aria-label={`Urutkan berdasarkan ${column.label}`}
                      className={[
                        "group inline-flex min-h-7 items-center justify-center gap-1.5 rounded-md",
                        "transition-colors hover:text-teal-800",
                        "focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-teal-600 focus-visible:ring-offset-2",
                        active ? "text-teal-800" : "",
                      ].join(" ")}
                    >
                      <span>{column.label}</span>
                      <SortIndicator indicator={indicator} />
                    </button>
                  </th>
                );
              })}

              <th scope="col" className={`${HEADER_CELL} text-center`}>
                JK
              </th>

              <th scope="col" className={`${HEADER_CELL} text-center`}>
                <button
                  type="button"
                  onClick={() => toggleSort("kelas")}
                  aria-label="Urutkan berdasarkan kelas"
                  className={[
                    "group inline-flex min-h-7 items-center justify-center gap-1.5 rounded-md",
                    "transition-colors hover:text-teal-800",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-teal-600 focus-visible:ring-offset-2",
                    sortIndicator("kelas") ? "text-teal-800" : "",
                  ].join(" ")}
                >
                  <span>Kelas</span>
                  <SortIndicator indicator={sortIndicator("kelas")} />
                </button>
              </th>

              <th scope="col" className={`${HEADER_CELL} text-center`}>
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <span className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <circle
                          cx="12"
                          cy="8"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M6 20v-1a6 6 0 0 1 12 0v1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>

                    <p className="text-[11px] font-semibold text-gray-800">
                      Tidak ada data
                    </p>
                    <p className="mt-1 text-[11px] leading-4.5 text-gray-500">
                      Belum ada data anggota yang cocok dengan filter atau
                      pencarian saat ini.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((s, i) => {
                const avatarColor = getAvatarColor(s.nama);

                return (
                  <tr
                    key={s.id}
                    className="group transition-colors duration-150 hover:bg-teal-50/35"
                  >
                    <td className="px-3 py-3 text-center align-middle">
                      <RowNumber value={startIndex + i + 1} />
                    </td>

                    <td className="px-3.5 py-3 text-center align-middle text-[10px] font-normal text-gray-700">
                      {s.desa || "-"}
                    </td>

                    <td className="px-3.5 py-3 text-center align-middle text-[10px] font-normal text-gray-700">
                      {s.kelompok || "-"}
                    </td>

                    <td className="px-3.5 py-3 text-left align-middle">
                      <div className="flex items-center justify-start gap-2.5">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-medium text-white ring-2 ${avatarColor.ring}`}
                          style={{
                            backgroundColor: avatarColor.bg,
                          }}
                        >
                          {getInitials(s.nama)}
                        </div>

                        <span className="wrap-break-word text-left text-[10px] font-normal leading-relaxed text-gray-800 transition-colors group-hover:text-teal-800">
                          {toTitleCase(s.nama)}
                        </span>
                      </div>
                    </td>

                    <td className="px-3.5 py-3 text-center align-middle text-[10px] font-normal text-gray-600">
                      {s.jenis_kelamin === "Laki-laki"
                        ? "L"
                        : s.jenis_kelamin === "Perempuan"
                          ? "P"
                          : "-"}
                    </td>

                    <td className="px-3.5 py-3 text-center align-middle">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-normal ${getKelasBadgeClass(
                          s.kelas,
                        )}`}
                      >
                        {s.kelas}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-center align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onShowQR(s)}
                          aria-label={`Tampilkan QR ${s.nama}`}
                          title="Tampilkan QR"
                          className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-teal-50 px-2.5 text-[10px] font-semibold text-teal-700 transition hover:bg-teal-100 active:bg-teal-200"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
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
                          <span>QR</span>
                        </button>

                        <span
                          aria-hidden="true"
                          className="mx-0.5 h-5 w-px shrink-0 bg-gray-200"
                        />

                        <IconButton
                          label={`Detail ${s.nama}`}
                          onClick={() => onDetail(s)}
                        >
                          <DetailIcon className="h-3.5 w-3.5" />
                        </IconButton>

                        <IconButton
                          label={`Edit ${s.nama}`}
                          onClick={() => onEdit(s)}
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                        </IconButton>

                        <IconButton
                          label={`Hapus ${s.nama}`}
                          onClick={() => onDelete(s)}
                          variant="danger"
                        >
                          <DeleteIcon className="h-3.5 w-3.5" />
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
        <footer className="flex min-h-10 items-center justify-center gap-3 border-t border-gray-200 bg-gray-50/60 px-4 py-2.5">
          <p className="text-center text-[9px] text-gray-500">
            Menampilkan{" "}
            <span className="font-normal tabular-nums text-gray-700">
              {data.length}
            </span>{" "}
            anggota
          </p>

          <p className="inline-flex items-center justify-center gap-1.5 text-center text-[9px] text-gray-400">
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