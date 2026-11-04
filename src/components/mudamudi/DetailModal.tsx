"use client";

import { Mudamudi } from "../../backend/mudamudi/types";
import {
  toTitleCase,
  getInitials,
  getAvatarColor,
} from "../../backend/mudamudi/format";
import { getKelasBadgeClass } from "../../backend/mudamudi/kelasBadge";
import ModalWrapper from "./ModalWrapper";

type Props = {
  data: Mudamudi;
  onClose: () => void;
};

export default function DetailModal({ data, onClose }: Props) {
  const avatarColor = getAvatarColor(data.nama);

  function DetailItem({
    label,
    value,
  }: {
    label: string;
    value: string | number | null;
  }) {
    return (
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.05em] text-[#78827C]">
          {label}
        </p>
        <p className="mt-1 wrap-break-word text-[10px] font-medium leading-4 text-[#202824]">
          {value ?? "-"}
        </p>
      </div>
    );
  }

  return (
    <ModalWrapper onClose={onClose} size="md">
      <div className="flex max-h-[90dvh] min-h-0 w-full flex-col overflow-hidden bg-white">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-medium text-white ring-2 ${avatarColor.ring}`}
              style={{ backgroundColor: avatarColor.bg }}
            >
              {getInitials(data.nama)}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-[11px] font-semibold leading-5 text-[#202824]">
                {toTitleCase(data.nama)}
              </h2>

              <p className="mt-0.5 text-[9px] leading-4 text-[#78827C]">
                Detail Data Generus
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[#78827C] transition hover:bg-[#F0F4F1] hover:text-[#202824]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </header>

        {/* Content */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
          <section className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold tracking-tight text-[#202824]">
                Wilayah & Status
              </h3>
              <span
                className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-medium ${getKelasBadgeClass(
                  data.kelas,
                )}`}
              >
                {data.kelas}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <DetailItem label="Desa" value={data.desa} />
              <DetailItem label="Kelompok" value={data.kelompok} />
              <DetailItem label="Jenis Kelamin" value={data.jenis_kelamin} />
            </div>
          </section>

          <section className="rounded-xl border border-[#E5EAE6] bg-white p-3.5 shadow-xs">
            <h3 className="mb-2.5 text-[10px] font-semibold tracking-tight text-[#202824]">
              Informasi Pribadi
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <DetailItem label="Nama Lengkap" value={toTitleCase(data.nama)} />
              <DetailItem label="Tempat Lahir" value={data.tempat_lahir} />
              <DetailItem
                label="Tahun Lahir"
                value={data.tahun_lahir !== null ? String(data.tahun_lahir) : null}
              />
              <DetailItem label="No. HP" value={data.no_hp} />
              <DetailItem label="Pekerjaan" value={data.pekerjaan} />
              <div className="col-span-2 sm:col-span-3">
                <DetailItem label="Alamat" value={data.alamat} />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-end border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 items-center justify-center rounded-xl border border-[#E5EAE6] bg-white px-3.5 py-2 text-[9px] font-semibold text-[#202824] transition hover:bg-[#F0F4F1] active:scale-[0.98]"
          >
            Tutup
          </button>
        </footer>
      </div>
    </ModalWrapper>
  );
}
