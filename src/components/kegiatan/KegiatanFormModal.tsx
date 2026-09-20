"use client";

import { Kegiatan } from "../../backend/kegiatan/types";
import { FieldErrors } from "../../backend/kegiatan/types";
import ModalWrapper from "../mudamudi/ModalWrapper";

type Props = {
  mode: "add" | "edit";
  initialData?: Kegiatan;
  fieldErrors: FieldErrors;
  error: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onClose: () => void;
};

export default function KegiatanFormModal({
  mode,
  initialData,
  fieldErrors,
  error,
  onSubmit,
  onClose,
}: Props) {
  return (
    <ModalWrapper onClose={onClose}>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-240 overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            {mode === "add" ? "Tambah Kegiatan" : "Edit Kegiatan"}
          </h2>

          <p className="mt-0.5 text-[11px] text-gray-500">
            {mode === "add"
              ? "Tambahkan kegiatan baru."
              : "Perbarui data kegiatan."}
          </p>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label
              htmlFor="nama"
              className="mb-1.5 block text-[11px] font-medium text-gray-700"
            >
              Nama Kegiatan
            </label>

            <input
              id="nama"
              name="nama"
              type="text"
              defaultValue={initialData?.nama ?? ""}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[11px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
            />

            {fieldErrors.nama && (
              <p className="mt-1 text-[10px] text-red-500">
                {fieldErrors.nama}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="tanggal_mulai"
                className="mb-1.5 block text-[11px] font-medium text-gray-700"
              >
                Tanggal Mulai
              </label>

              <input
                id="tanggal_mulai"
                name="tanggal_mulai"
                type="date"
                defaultValue={initialData?.tanggal_mulai ?? ""}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[11px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
              />

              {fieldErrors.tanggal_mulai && (
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.tanggal_mulai}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="tanggal_selesai"
                className="mb-1.5 block text-[11px] font-medium text-gray-700"
              >
                Tanggal Selesai
              </label>

              <input
                id="tanggal_selesai"
                name="tanggal_selesai"
                type="date"
                defaultValue={initialData?.tanggal_selesai ?? ""}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[11px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
              />

              {fieldErrors.tanggal_selesai && (
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.tanggal_selesai}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="jam_mulai"
                className="mb-1.5 block text-[11px] font-medium text-gray-700"
              >
                Jam Mulai
              </label>

              <input
                id="jam_mulai"
                name="jam_mulai"
                type="time"
                defaultValue={initialData?.jam_mulai?.slice(0, 5) ?? ""}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[11px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
              />

              {fieldErrors.jam_mulai && (
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.jam_mulai}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="jam_selesai"
                className="mb-1.5 block text-[11px] font-medium text-gray-700"
              >
                Jam Selesai
              </label>

              <input
                id="jam_selesai"
                name="jam_selesai"
                type="time"
                defaultValue={initialData?.jam_selesai?.slice(0, 5) ?? ""}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[11px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
              />

              {fieldErrors.jam_selesai && (
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.jam_selesai}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="lokasi"
              className="mb-1.5 block text-[11px] font-medium text-gray-700"
            >
              Lokasi
            </label>

            <input
              id="lokasi"
              name="lokasi"
              type="text"
              defaultValue={initialData?.lokasi ?? ""}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[11px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
            />

            {fieldErrors.lokasi && (
              <p className="mt-1 text-[10px] text-red-500">
                {fieldErrors.lokasi}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-[10px] text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-lg border border-gray-200 px-3 text-[11px] text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            type="submit"
            className="h-8 rounded-lg bg-gray-900 px-3.5 text-[11px] font-medium text-white hover:bg-gray-800"
          >
            {mode === "add" ? "Simpan" : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
