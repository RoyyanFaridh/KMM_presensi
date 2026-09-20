"use client";

import { Kegiatan } from "../../backend/kegiatan/types";
import ModalWrapper from "../mudamudi/ModalWrapper";

type Props = {
  data: Kegiatan;
  error: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export default function DeleteConfirmModal({
  data,
  error,
  onConfirm,
  onClose,
}: Props) {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="px-5 py-5 bg-white">
        <h2 className="text-sm font-semibold text-gray-900">Hapus Kegiatan?</h2>

        <p className="mt-2 text-[11px] leading-5 text-gray-500">
          Data kegiatan{" "}
          <span className="font-medium text-gray-700">{data.nama}</span> akan
          dihapus. Tindakan ini tidak dapat dibatalkan.
        </p>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[10px] text-red-600">
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-lg border border-gray-200 px-3 text-[11px] text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="h-8 rounded-lg bg-red-600 px-3 text-[11px] font-medium text-white hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
