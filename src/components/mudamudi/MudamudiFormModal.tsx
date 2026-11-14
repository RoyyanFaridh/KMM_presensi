
"use client";

import { useEffect, useState } from "react";
import type { Mudamudi, FieldErrors } from "../../backend/mudamudi/types";
import {
  DESA_OPTIONS,
  KELOMPOK_BY_DESA,
  JENIS_KELAMIN_OPTIONS,
  JENJANG_OPTIONS,
} from "../../backend/mudamudi/constants";
import ModalWrapper from "./ModalWrapper";

type Props = {
  mode: "add" | "edit";
  initialData?: Mudamudi;
  adminDesa: string | null;
  fieldErrors: FieldErrors;
  error: string;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onClose: () => void;
};

function calculateKelasFromJenjang(jenjang: string): string {
  if (jenjang === "Belum Sekolah" || jenjang === "PAUD") return "PAUD";
  if (jenjang === "TK") return "TK";
  if (["SD-1", "SD-2", "SD-3"].includes(jenjang)) return "Caberawit A";
  if (["SD-4", "SD-5", "SD-6"].includes(jenjang)) return "Caberawit B";
  if (["SMP-1", "SMP-2", "SMP-3"].includes(jenjang)) return "Pra Remaja";
  if (["SMA-1", "SMA-2", "SMA-3"].includes(jenjang)) return "Remaja";
  if (jenjang === "Kuliah" || jenjang === "Kerja") return "Usia Nikah";
  if (jenjang === "MT") return "MT";
  return "";
}

export default function MudamudiFormModal({
  mode,
  initialData,
  adminDesa,
  fieldErrors,
  error,
  isSubmitting,
  onSubmit,
  onClose,
}: Props) {
  const isAdminDesa = adminDesa !== null;

  const [desa, setDesa] = useState(adminDesa ?? initialData?.desa ?? "");
  const [kelompok, setKelompok] = useState(initialData?.kelompok ?? "");
  const [jenjang, setJenjang] = useState(initialData?.jenjang ?? "");

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (adminDesa !== null) {
      setDesa(adminDesa);
    } else if (mode === "edit" && initialData?.desa) {
      setDesa(initialData.desa);
    }
  }, [adminDesa, mode, initialData?.desa]);

  useEffect(() => {
    setJenjang(initialData?.jenjang ?? "");
  }, [initialData?.id, initialData?.jenjang]);

  const kelompokOptions = desa
    ? (KELOMPOK_BY_DESA[desa as keyof typeof KELOMPOK_BY_DESA] ?? [])
    : [];

  useEffect(() => {
    if (kelompok && !kelompokOptions.includes(kelompok as never)) {
      setKelompok("");
    }
  }, [desa]);

  const kelasOtomatis = calculateKelasFromJenjang(jenjang);

  const inputClass =
    "h-9 w-full min-w-0 rounded-xl border border-[#E5EAE6] bg-white px-3 text-[10px] text-[#202824] outline-none transition placeholder:text-[#78827C] focus:border-[#287A50] focus:ring-2 focus:ring-[#65B98A]/20 disabled:cursor-not-allowed disabled:bg-[#F5F7F5]";

  const selectClass =
    "h-9 w-full min-w-0 rounded-xl border border-[#E5EAE6] bg-white px-3 text-[10px] text-[#202824] outline-none transition focus:border-[#287A50] focus:ring-2 focus:ring-[#65B98A]/20 disabled:cursor-not-allowed disabled:bg-[#F5F7F5]";

  const labelClass =
    "mb-1.5 block text-[9px] font-semibold leading-4 text-[#202824]";

  const helperClass =
    "mt-1 text-[9px] leading-4 text-[#78827C]";

  return (
    <ModalWrapper onClose={onClose} size="lg">
      <form
        key={`${mode}-${initialData?.id ?? "new"}`}
        onSubmit={onSubmit}
        aria-busy={isSubmitting}
        className="w-full"
      >
        <fieldset
          disabled={isSubmitting}
          className="m-0 flex max-h-[90dvh] min-h-0 w-full min-w-0 flex-col overflow-hidden border-0 bg-white p-0"
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  mode === "add"
                    ? "bg-[#E6F2EA] text-[#287A50]"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {mode === "add" ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 5v14M5 12h14"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.5 3.5 4 4L8 20l-5 1 1-5Z"
                    />
                  </svg>
                )}
              </div>

              <div className="min-w-0">
                <h2 className="text-[11px] font-semibold leading-5 text-[#202824]">
                  {mode === "add" ? "Tambah Data Generus" : "Edit Data Generus"}
                </h2>
                <p className="mt-0.5 text-[9px] leading-4 text-[#78827C]">
                  {mode === "add"
                    ? "Tambahkan Generus baru ke database GENARA"
                    : "Perbarui informasi data Generus"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Tutup"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[#78827C] transition hover:bg-[#F0F4F1] hover:text-[#202824] disabled:cursor-not-allowed disabled:opacity-40"
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

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3.5 sm:space-y-4 sm:px-5 sm:py-4">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4M12 16h.01"
                  />
                </svg>
                <p className="text-[10px] leading-4 text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="nama" className={labelClass}>
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="nama"
                name="nama"
                type="text"
                required
                placeholder="Masukkan nama lengkap"
                defaultValue={initialData?.nama ?? ""}
                className={`${inputClass} ${
                  fieldErrors.nama
                    ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                    : ""
                }`}
              />
              {fieldErrors.nama && (
                <p className="mt-1 text-[9px] text-red-500">
                  {fieldErrors.nama}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <label htmlFor="desa" className={labelClass}>
                  Desa <span className="text-red-500">*</span>
                </label>

                {isAdminDesa ? (
                  <>
                    <div className="flex h-9 w-full min-w-0 items-center truncate rounded-lg border border-gray-200 bg-gray-50 px-3 text-[10px] text-gray-600">
                      {adminDesa}
                    </div>
                    <input type="hidden" name="desa" value={desa} />
                  </>
                ) : (
                  <select
                    id="desa"
                    name="desa"
                    value={desa}
                    required
                    onChange={(e) => {
                      setDesa(e.target.value);
                      setKelompok("");
                    }}
                    className={`${selectClass} ${
                      fieldErrors.desa ? "border-red-300" : ""
                    }`}
                  >
                    <option value="">Pilih desa</option>
                    {DESA_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {fieldErrors.desa && (
                  <p className="mt-1 text-[9px] text-red-500">
                    {fieldErrors.desa}
                  </p>
                )}

                {isAdminDesa && (
                  <p className={helperClass}>
                    Mengikuti wilayah admin desa.
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <label htmlFor="kelompok" className={labelClass}>
                  Kelompok <span className="text-red-500">*</span>
                </label>
                <select
                  id="kelompok"
                  name="kelompok"
                  value={kelompok}
                  required
                  onChange={(e) => setKelompok(e.target.value)}
                  disabled={!desa}
                  className={`${selectClass} ${
                    fieldErrors.kelompok ? "border-red-300" : ""
                  } ${
                    !desa ? "cursor-not-allowed bg-gray-50 text-gray-400" : ""
                  }`}
                >
                  <option value="">
                    {desa ? "Pilih kelompok" : "Pilih desa dahulu"}
                  </option>
                  {kelompokOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {fieldErrors.kelompok && (
                  <p className="mt-1 text-[9px] text-red-500">
                    {fieldErrors.kelompok}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="jenis_kelamin" className={labelClass}>
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                id="jenis_kelamin"
                name="jenis_kelamin"
                required
                defaultValue={initialData?.jenis_kelamin ?? ""}
                className={`${selectClass} ${
                  fieldErrors.jenis_kelamin ? "border-red-300" : ""
                }`}
              >
                <option value="">Pilih jenis kelamin</option>
                {JENIS_KELAMIN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {fieldErrors.jenis_kelamin && (
                <p className="mt-1 text-[9px] text-red-500">
                  {fieldErrors.jenis_kelamin}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <label htmlFor="tempat_lahir" className={labelClass}>
                  Tempat Lahir
                </label>
                <input
                  id="tempat_lahir"
                  name="tempat_lahir"
                  type="text"
                  placeholder="Tempat lahir"
                  defaultValue={initialData?.tempat_lahir ?? ""}
                  className={`${inputClass} ${
                    fieldErrors.tempat_lahir ? "border-red-300" : ""
                  }`}
                />
                {fieldErrors.tempat_lahir && (
                  <p className="mt-1 text-[9px] text-red-500">
                    {fieldErrors.tempat_lahir}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <label htmlFor="tahun_lahir" className={labelClass}>
                  Tahun Lahir{" "}
                  <span className="font-normal text-gray-400">(Opsional)</span>
                </label>
                <input
                  id="tahun_lahir"
                  name="tahun_lahir"
                  type="number"
                  min="1900"
                  max={currentYear}
                  step="1"
                  placeholder={String(currentYear - 20)}
                  defaultValue={
                    initialData?.tahun_lahir != null
                      ? String(initialData.tahun_lahir)
                      : ""
                  }
                  className={`${inputClass} ${
                    fieldErrors.tahun_lahir ? "border-red-300" : ""
                  }`}
                />
                {fieldErrors.tahun_lahir && (
                  <p className="mt-1 text-[9px] text-red-500">
                    {fieldErrors.tahun_lahir}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <label htmlFor="jenjang" className={labelClass}>
                  Jenjang <span className="text-red-500">*</span>
                </label>
                <select
                  id="jenjang"
                  name="jenjang"
                  value={jenjang}
                  required
                  onChange={(e) => setJenjang(e.target.value)}
                  className={`${selectClass} ${
                    fieldErrors.jenjang ? "border-red-300" : ""
                  }`}
                >
                  <option value="">Pilih jenjang</option>
                  {JENJANG_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {fieldErrors.jenjang && (
                  <p className="mt-1 text-[9px] text-red-500">
                    {fieldErrors.jenjang}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <label htmlFor="kelas_preview" className={labelClass}>
                  Kelas
                </label>
                <input
                  id="kelas_preview"
                  type="text"
                  value={kelasOtomatis}
                  readOnly
                  placeholder="Otomatis"
                  className={`${inputClass} cursor-not-allowed bg-[#F5F7F5] text-gray-600`}
                />
              </div>
            </div>

            <p className={helperClass}>
              Kelas ditentukan otomatis berdasarkan jenjang yang dipilih.
            </p>

            <div>
              <label htmlFor="pekerjaan" className={labelClass}>
                Pekerjaan
              </label>
              <input
                id="pekerjaan"
                name="pekerjaan"
                type="text"
                placeholder="Masukkan pekerjaan"
                defaultValue={initialData?.pekerjaan ?? ""}
                className={`${inputClass} ${
                  fieldErrors.pekerjaan ? "border-red-300" : ""
                }`}
              />
              {fieldErrors.pekerjaan && (
                <p className="mt-1 text-[9px] text-red-500">
                  {fieldErrors.pekerjaan}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="no_hp" className={labelClass}>
                No. HP
              </label>
              <input
                id="no_hp"
                name="no_hp"
                type="tel"
                inputMode="numeric"
                placeholder="Masukkan nomor HP"
                defaultValue={initialData?.no_hp ?? ""}
                className={`${inputClass} ${
                  fieldErrors.no_hp ? "border-red-300" : ""
                }`}
              />
              {fieldErrors.no_hp && (
                <p className="mt-1 text-[9px] text-red-500">
                  {fieldErrors.no_hp}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="alamat" className={labelClass}>
                Alamat
              </label>
              <textarea
                id="alamat"
                name="alamat"
                rows={2}
                placeholder="Masukkan alamat"
                defaultValue={initialData?.alamat ?? ""}
                className={`w-full min-w-0 resize-none rounded-xl border border-[#E5EAE6] bg-white px-3 py-2 text-[10px] text-[#202824] outline-none transition placeholder:text-[#9AA39D] focus:border-[#287A50] focus:ring-2 focus:ring-[#65B98A]/20 disabled:cursor-not-allowed disabled:bg-[#F5F7F5] ${
                  fieldErrors.alamat ? "border-red-300" : ""
                }`}
              />
              {fieldErrors.alamat && (
                <p className="mt-1 text-[9px] text-red-500">
                  {fieldErrors.alamat}
                </p>
              )}
            </div>
          </div>

          <footer className="flex shrink-0 items-center justify-between border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-[#E5EAE6] bg-white px-3.5 py-2 text-[9px] font-semibold text-[#202824] transition hover:bg-[#F0F4F1] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-[#287A50] px-4 py-2 text-[9px] font-semibold text-white transition hover:bg-[#206440] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#8BAF99] disabled:opacity-80"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
                    />
                  </svg>
                  Menyimpan...
                </>
              ) : mode === "add" ? (
                "Simpan Data"
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </footer>
        </fieldset>
      </form>
    </ModalWrapper>
  );
}
