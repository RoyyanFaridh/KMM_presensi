"use client";

import { useState } from "react";

import { Kegiatan, FieldErrors } from "../../backend/kegiatan/types";

import {
  DESA_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
  KELAS_OPTIONS,
} from "../../backend/mudamudi/constants";

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
  const [selectedDesa, setSelectedDesa] = useState<string[]>(
    initialData?.desa ?? [],
  );

  const [selectedKelas, setSelectedKelas] = useState<string[]>(
    initialData?.kelas ?? [],
  );

  const [jenisKelamin, setJenisKelamin] = useState(
    initialData?.jenis_kelamin ?? "",
  );

  function toggleDesa(desa: string) {
    setSelectedDesa((current) =>
      current.includes(desa)
        ? current.filter((item) => item !== desa)
        : [...current, desa],
    );
  }

  function toggleKelas(kelas: string) {
    setSelectedKelas((current) =>
      current.includes(kelas)
        ? current.filter((item) => item !== kelas)
        : [...current, kelas],
    );
  }

  return (
    <ModalWrapper onClose={onClose} size="lg">
      <form
        onSubmit={onSubmit}
        className="flex max-h-[82dvh] w-full min-h-0 flex-col overflow-hidden bg-white"
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${
                mode === "add"
                  ? "bg-teal-50 text-teal-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {mode === "add" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14M5 12h14"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20h9"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4-1-1-4L16.5 3.5Z"
                  />
                </svg>
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-[14px] font-semibold leading-5 text-gray-800">
                {mode === "add" ? "Tambah Kegiatan" : "Edit Kegiatan"}
              </h2>

              <p className="mt-0.5 text-[10px] leading-4 text-gray-400">
                {mode === "add"
                  ? "Tambahkan kegiatan baru"
                  : "Perbarui informasi kegiatan"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
        </div>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            {/* INFORMASI KEGIATAN */}
            <section>
              <div className="mb-3">
                <h3 className="text-[11px] font-semibold text-gray-700">
                  Informasi Kegiatan
                </h3>
              </div>

              <div className="space-y-4">
                {/* NAMA */}
                <div>
                  <label
                    htmlFor="nama"
                    className="mb-1.5 block text-[11px] font-medium text-gray-400"
                  >
                    Nama Kegiatan
                  </label>

                  <input
                    id="nama"
                    name="nama"
                    type="text"
                    placeholder="Masukkan nama kegiatan"
                    defaultValue={initialData?.nama ?? ""}
                    className={`h-9.75 w-full rounded-lg border bg-white px-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-500 focus:ring-2 ${
                      fieldErrors.nama
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-gray-200 focus:border-teal-400 focus:ring-teal-50"
                    }`}
                  />

                  {fieldErrors.nama && (
                    <p className="mt-1 text-[10px] text-red-500">
                      {fieldErrors.nama}
                    </p>
                  )}
                </div>

                {/* TANGGAL MULAI + TANGGAL SELESAI */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="tanggal_mulai"
                      className="mb-1.5 block text-[11px] font-medium text-gray-400"
                    >
                      Tanggal Mulai
                    </label>

                    <input
                      id="tanggal_mulai"
                      name="tanggal_mulai"
                      type="date"
                      defaultValue={initialData?.tanggal_mulai ?? ""}
                      className={`h-9.75 w-full rounded-lg border bg-white px-2.5 text-[11px] text-gray-700 outline-none transition focus:ring-2 sm:px-3 sm:text-[12px] ${
                        fieldErrors.tanggal_mulai
                          ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                          : "border-gray-200 focus:border-teal-400 focus:ring-teal-50"
                      }`}
                    />

                    {fieldErrors.tanggal_mulai && (
                      <p className="mt-1 text-[10px] leading-3 text-red-500">
                        {fieldErrors.tanggal_mulai}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="tanggal_selesai"
                      className="mb-1.5 block text-[11px] font-medium text-gray-400"
                    >
                      Tanggal Selesai
                    </label>

                    <input
                      id="tanggal_selesai"
                      name="tanggal_selesai"
                      type="date"
                      defaultValue={initialData?.tanggal_selesai ?? ""}
                      className={`h-9.75 w-full rounded-lg border bg-white px-2.5 text-[11px] text-gray-700 outline-none transition focus:ring-2 sm:px-3 sm:text-[12px] ${
                        fieldErrors.tanggal_selesai
                          ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                          : "border-gray-200 focus:border-teal-400 focus:ring-teal-50"
                      }`}
                    />

                    {fieldErrors.tanggal_selesai && (
                      <p className="mt-1 text-[10px] leading-3 text-red-500">
                        {fieldErrors.tanggal_selesai}
                      </p>
                    )}
                  </div>
                </div>

                {/* JAM MULAI + JAM SELESAI */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="jam_mulai"
                      className="mb-1.5 block text-[11px] font-medium text-gray-400"
                    >
                      Jam Mulai
                    </label>

                    <input
                      id="jam_mulai"
                      name="jam_mulai"
                      type="time"
                      defaultValue={initialData?.jam_mulai?.slice(0, 5) ?? ""}
                      className={`h-9.75 w-full rounded-lg border bg-white px-2.5 text-[11px] text-gray-700 outline-none transition focus:ring-2 sm:px-3 sm:text-[12px] ${
                        fieldErrors.jam_mulai
                          ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                          : "border-gray-200 focus:border-teal-400 focus:ring-teal-50"
                      }`}
                    />

                    {fieldErrors.jam_mulai && (
                      <p className="mt-1 text-[10px] leading-3 text-red-500">
                        {fieldErrors.jam_mulai}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="jam_selesai"
                      className="mb-1.5 block text-[11px] font-medium text-gray-400"
                    >
                      Jam Selesai
                    </label>

                    <input
                      id="jam_selesai"
                      name="jam_selesai"
                      type="time"
                      defaultValue={initialData?.jam_selesai?.slice(0, 5) ?? ""}
                      className={`h-9.75 w-full rounded-lg border bg-white px-2.5 text-[11px] text-gray-700 outline-none transition focus:ring-2 sm:px-3 sm:text-[12px] ${
                        fieldErrors.jam_selesai
                          ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                          : "border-gray-200 focus:border-teal-400 focus:ring-teal-50"
                      }`}
                    />

                    {fieldErrors.jam_selesai && (
                      <p className="mt-1 text-[10px] leading-3 text-red-500">
                        {fieldErrors.jam_selesai}
                      </p>
                    )}
                  </div>
                </div>

                {/* LOKASI */}
                <div>
                  <label
                    htmlFor="lokasi"
                    className="mb-1.5 block text-[11px] font-medium text-gray-400"
                  >
                    Lokasi
                  </label>

                  <input
                    id="lokasi"
                    name="lokasi"
                    type="text"
                    placeholder="Masukkan lokasi kegiatan"
                    defaultValue={initialData?.lokasi ?? ""}
                    className={`h-9.75 w-full rounded-lg border bg-white px-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-500 focus:ring-2 ${
                      fieldErrors.lokasi
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-gray-200 focus:border-teal-400 focus:ring-teal-50"
                    }`}
                  />

                  {fieldErrors.lokasi && (
                    <p className="mt-1 text-[10px] text-red-500">
                      {fieldErrors.lokasi}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* SASARAN */}
            <section className="border-t border-gray-100 pt-5">
              <div className="mb-4">
                <h3 className="text-[11px] font-semibold text-gray-700">
                  Sasaran Kegiatan
                </h3>

                <p className="mt-0.5 text-[10px] leading-4 text-gray-400">
                  Kosongkan pilihan jika sasaran berlaku untuk semua.
                </p>
              </div>

              <div className="space-y-5">
                {/* DESA */}
                <div>
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <p className="text-[10px] font-medium text-gray-600">
                      Desa
                    </p>

                    <span className="text-[9px] text-gray-400">
                      {selectedDesa.length === 0
                        ? "Semua desa"
                        : `${selectedDesa.length} dipilih`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {DESA_OPTIONS.map((desa) => {
                      const checked = selectedDesa.includes(desa);

                      return (
                        <label
                          key={desa}
                          className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition ${
                            checked
                              ? "border-teal-200 bg-teal-50 text-teal-800"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            name="desa"
                            value={desa}
                            checked={checked}
                            onChange={() => toggleDesa(desa)}
                            className="h-3.5 w-3.5 shrink-0 rounded border-gray-300 accent-teal-600 focus:ring-teal-500"
                          />

                          <span className="text-[10px] leading-4">{desa}</span>
                        </label>
                      );
                    })}
                  </div>

                  {fieldErrors.desa && (
                    <p className="mt-1 text-[10px] text-red-500">
                      {fieldErrors.desa}
                    </p>
                  )}
                </div>

                {/* KELAS */}
                <div>
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <p className="text-[10px] font-medium text-gray-600">
                      Kelas
                    </p>

                    <span className="text-[9px] text-gray-400">
                      {selectedKelas.length === 0
                        ? "Semua kelas"
                        : `${selectedKelas.length} dipilih`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {KELAS_OPTIONS.map((kelas) => {
                      const checked = selectedKelas.includes(kelas);

                      return (
                        <label
                          key={kelas}
                          className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition ${
                            checked
                              ? "border-teal-200 bg-teal-50 text-teal-800"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            name="kelas"
                            value={kelas}
                            checked={checked}
                            onChange={() => toggleKelas(kelas)}
                            className="h-3.5 w-3.5 shrink-0 rounded border-gray-300 accent-teal-600 focus:ring-teal-500"
                          />

                          <span className="text-[10px] leading-4">{kelas}</span>
                        </label>
                      );
                    })}
                  </div>

                  {fieldErrors.kelas && (
                    <p className="mt-1 text-[10px] text-red-500">
                      {fieldErrors.kelas}
                    </p>
                  )}
                </div>

                {/* JENIS KELAMIN */}
                <div>
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <p className="text-[10px] font-medium text-gray-600">
                      Jenis Kelamin
                    </p>

                    <span className="text-[9px] text-gray-400">
                      {jenisKelamin || "Semua"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <label
                      className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition ${
                        jenisKelamin === ""
                          ? "border-teal-200 bg-teal-50 text-teal-800"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="jenis_kelamin"
                        value=""
                        checked={jenisKelamin === ""}
                        onChange={() => setJenisKelamin("")}
                        className="h-3.5 w-3.5 shrink-0 accent-teal-600 focus:ring-teal-500"
                      />

                      <span className="text-[10px] leading-4">Semua</span>
                    </label>

                    {JENIS_KELAMIN_OPTIONS.map((option) => {
                      const checked = jenisKelamin === option;

                      return (
                        <label
                          key={option}
                          className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition ${
                            checked
                              ? "border-teal-200 bg-teal-50 text-teal-800"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="jenis_kelamin"
                            value={option}
                            checked={checked}
                            onChange={() => setJenisKelamin(option)}
                            className="h-3.5 w-3.5 shrink-0 accent-teal-600 focus:ring-teal-500"
                          />

                          <span className="text-[10px] leading-4">
                            {option}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {fieldErrors.jenis_kelamin && (
                    <p className="mt-1 text-[10px] text-red-500">
                      {fieldErrors.jenis_kelamin}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* GENERAL ERROR */}
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-[10px] leading-4 text-red-600">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t border-gray-100 bg-gray-50/50 px-5 py-3.5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white px-4 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98] sm:w-auto"
            >
              Batal
            </button>

            <button
              type="submit"
              className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#171717] px-5 text-[11px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.98] sm:w-auto"
            >
              {mode === "add" ? "Simpan" : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
}
