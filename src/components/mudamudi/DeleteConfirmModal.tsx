"use client";

import { Mudamudi } from "../../backend/mudamudi/types";
import ModalWrapper from "./ModalWrapper";

type Props = {
  data: Mudamudi;
  error: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function DeleteConfirmModal({
  data,
  error,
  onConfirm,
  onClose,
}: Props) {
  return (
    <ModalWrapper onClose={onClose} size="sm">
      <div className="flex max-h-[90dvh] min-h-0 w-full flex-col overflow-hidden bg-white">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4h8v2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v5M14 11v5" />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="text-[11px] font-semibold leading-5 text-gray-900">
                Hapus Data Generus
              </h2>
              <p className="mt-0.5 text-[9px] leading-4 text-gray-500">
                Konfirmasi penghapusan anggota
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
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
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5">
          <p className="text-[10px] leading-relaxed text-gray-600">
            Apakah Anda yakin ingin menghapus data Generus atas nama{" "}
            <span className="font-semibold text-gray-900">{data.nama}</span>?
          </p>

          <p className="rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-[9px] leading-relaxed text-amber-800">
            Tindakan ini permanen dan akan menghapus data anggota beserta riwayat presensi terkait. Tindakan ini tidak dapat dibatalkan.
          </p>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] leading-4 text-red-600"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500"
              >
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[9px] font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-[9px] font-semibold text-white transition hover:bg-red-700 active:scale-[0.98]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-3.5 w-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4h8v2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v5M14 11v5" />
            </svg>
            <span>Hapus Data</span>
          </button>
        </footer>
      </div>
    </ModalWrapper>
  );
}
