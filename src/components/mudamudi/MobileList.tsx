"use client";

import { Mudamudi } from "../../backend/mudamudi/types";
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
  onDetail: (s: Mudamudi) => void;
  onEdit: (s: Mudamudi) => void;
  onDelete: (s: Mudamudi) => void;
  onShowQR: (s: Mudamudi) => void;
  startIndex: number;
};

function DetailColumn({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex min-w-0 items-center text-gray-400">
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
  onDetail,
  onEdit,
  onDelete,
  onShowQR,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white p-6 text-center shadow-xs md:hidden">
        <div className="mx-auto flex max-w-sm flex-col items-center">
          <span className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
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
          <p className="text-[11px] font-semibold text-[#202824]">
            Tidak ada data
          </p>
          <p className="mt-1 text-[11px] leading-4.5 text-[#78827C]">
            Belum ada data anggota yang cocok dengan filter atau pencarian saat ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:hidden">
      <ul aria-label="Daftar Generus" className="space-y-3">
        {data.map((s) => {
          const avatarColor = getAvatarColor(s.nama);

          return (
            <li
              key={s.id}
              className="group overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xs transition-colors duration-150 hover:border-[#65B98A]/40"
            >
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ${avatarColor.ring}`}
                      style={{
                        backgroundColor: avatarColor.bg,
                      }}
                    >
                      {getInitials(s.nama)}
                    </div>

                    <div className="min-w-0">
                      <p className="mb-0.5 text-[8px] font-bold uppercase tracking-widest text-[#287A50]">
                        Generus
                      </p>

                      <h3 className="wrap-break-word text-[13px] font-bold leading-normal tracking-[-0.01em] text-[#202824] transition-colors group-hover:text-[#287A50]">
                        {toTitleCase(s.nama)}
                      </h3>
                    </div>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-medium ${getKelasBadgeClass(
                        s.kelas,
                      )}`}
                    >
                      {s.kelas}
                    </span>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="mt-2.5 mb-3 h-px w-full bg-[#E5EAE6]"
                />

                <div className="grid grid-cols-3 gap-2">
                  <DetailColumn label="Desa">
                    <p className="wrap-break-word font-semibold text-[#202824]">
                      {s.desa || "-"}
                    </p>
                  </DetailColumn>

                  <div className="min-w-0 border-l border-[#E5EAE6] pl-2">
                    <DetailColumn label="Kelompok">
                      <p className="wrap-break-word font-semibold text-[#202824]">
                        {s.kelompok || "-"}
                      </p>
                    </DetailColumn>
                  </div>

                  <div className="min-w-0 border-l border-[#E5EAE6] pl-2">
                    <DetailColumn label="JK / Tahun">
                      <p className="wrap-break-word text-[#78827C]">
                        {s.jenis_kelamin ?? "-"}
                        {s.tahun_lahir ? ` (${s.tahun_lahir})` : ""}
                      </p>
                    </DetailColumn>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-[#E5EAE6] bg-[#F5F7F5] p-3">
                <button
                  type="button"
                  onClick={() => onShowQR(s)}
                  aria-label={`Tampilkan QR ${s.nama}`}
                  title="Tampilkan QR"
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#287A50] text-[11px] font-semibold text-white shadow-xs transition hover:bg-[#206440] active:bg-[#181C1B]"
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
                  <span>Tampilkan QR</span>
                </button>

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
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-center text-[9px] leading-4 text-[#78827C]">
        Menampilkan {data.length} Generus
      </p>
    </div>
  );
}
