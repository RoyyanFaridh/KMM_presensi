"use client";

import { useEffect, useState } from "react";
import type { Mudamudi, FieldErrors } from "../../backend/mudamudi/types";
import {
  DESA_OPTIONS,
  KELOMPOK_BY_DESA,
  JENIS_KELAMIN_OPTIONS,
  KELAS_OPTIONS,
} from "../../backend/mudamudi/constants";
import ModalWrapper from "./ModalWrapper";

type Props = {
  mode: "add" | "edit";
  initialData?: Mudamudi;
  adminDesa: string | null;
  fieldErrors: FieldErrors;
  error: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onClose: () => void;
};

function calculateKelas(tahunLahir: number | null): string {
  if (tahunLahir === null) return "";

  const currentYear = new Date().getFullYear();
  const umur = currentYear - tahunLahir;

  if (umur >= 5 && umur <= 6) return "PAUD";
  if (umur >= 7 && umur <= 12) return "Caberawit";
  if (umur >= 13 && umur <= 15) return "Pra Remaja";
  if (umur >= 16 && umur <= 18) return "Remaja";
  if (umur >= 19) return "Usia Nikah";

  return "";
}

export default function MudamudiFormModal({
  mode,
  initialData,
  adminDesa,
  fieldErrors,
  error,
  onSubmit,
  onClose,
}: Props) {
  const isAdminDesa = adminDesa !== null;

  const [desa, setDesa] = useState(adminDesa ?? initialData?.desa ?? "");
  const [tahunLahirRaw, setTahunLahirRaw] = useState(
    initialData?.tahun_lahir != null ? String(initialData.tahun_lahir) : "",
  );
  const [kelompok, setKelompok] = useState(initialData?.kelompok ?? "");
  const [kelasManual, setKelasManual] = useState(initialData?.kelas ?? "");

  useEffect(() => {
    if (adminDesa !== null) {
      setDesa(adminDesa);
    } else if (mode === "edit" && initialData?.desa) {
      setDesa(initialData.desa);
    }
  }, [adminDesa, mode, initialData?.desa]);

  const kelompokOptions = desa
    ? (KELOMPOK_BY_DESA[desa as keyof typeof KELOMPOK_BY_DESA] ?? [])
    : [];

  useEffect(() => {
    if (kelompok && !kelompokOptions.includes(kelompok as never)) {
      setKelompok("");
    }
  }, [desa]);

  const tahunLahir =
    tahunLahirRaw.trim() !== "" ? Number(tahunLahirRaw.trim()) : null;
  const kelasOtomatis = calculateKelas(tahunLahir);
  const kelasOtomatisTersedia =
    tahunLahir !== null &&
    !Number.isNaN(tahunLahir) &&
    kelasOtomatis !== "";

  const kelas = kelasOtomatisTersedia ? kelasOtomatis : kelasManual;

  const currentYear = new Date().getFullYear();

  const inputClass =
    "h-9.75 w-full rounded-lg border border-gray-200 bg-white px-3 text-[11px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-50";

  const selectClass =
    "h-9.75 w-full rounded-lg border border-gray-200 bg-white px-3 text-[11px] text-gray-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-50";

  const labelClass = "mb-1.5 block text-[11px] font-medium text-gray-500";
  const helperClass = "mt-1 text-[9px] leading-3 text-gray-400";

  return (
    <ModalWrapper onClose={onClose} size="lg">
      <form
        key={`${mode}-${initialData?.id ?? "new"}`}
        onSubmit={onSubmit}
        className="flex max-h-[72dvh] min-h-0 w-full flex-col overflow-hidden rounded-xl bg-white"
      >
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
                {mode === "add" ? "Tambah Data Mudamudi" : "Edit Data Mudamudi"}
              </h2>
              <p className="mt-0.5 text-[10px] leading-4 text-gray-400">
                {mode === "add"
                  ? "Tambahkan data mudamudi baru"
                  : "Perbarui informasi data mudamudi"}
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

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
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
              Nama <span className="text-red-500">*</span>
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
              <p className="mt-1 text-[10px] text-red-500">
                {fieldErrors.nama}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="desa" className={labelClass}>
                Desa <span className="text-red-500">*</span>
              </label>

              {isAdminDesa ? (
                <>
                  <div className="flex h-9.75 w-full items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-[11px] text-gray-600">
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
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.desa}
                </p>
              )}

              {isAdminDesa && (
                <p className={helperClass}>Mengikuti wilayah admin.</p>
              )}
            </div>

            <div>
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
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.kelompok}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.jenis_kelamin}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="tempat_lahir" className={labelClass}>
                Tempat Lahir
              </label>
              <input
                id="tempat_lahir"
                name="tempat_lahir"
                type="text"
                placeholder="Masukkan tempat lahir"
                defaultValue={initialData?.tempat_lahir ?? ""}
                className={`${inputClass} ${
                  fieldErrors.tempat_lahir ? "border-red-300" : ""
                }`}
              />
              {fieldErrors.tempat_lahir && (
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.tempat_lahir}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
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
                value={tahunLahirRaw}
                onChange={(e) => {
                  const val = e.target.value;
                  setTahunLahirRaw(val);

                  const parsed = val.trim() !== "" ? Number(val.trim()) : null;
                  const calculatedClass = calculateKelas(parsed);

                  if (parsed !== null && calculatedClass) {
                    setKelasManual(calculatedClass);
                  }
                }}
                placeholder={`Contoh: ${currentYear - 20}`}
                className={`${inputClass} ${
                  fieldErrors.tahun_lahir ? "border-red-300" : ""
                }`}
              />
              {fieldErrors.tahun_lahir && (
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.tahun_lahir}
                </p>
              )}
              <p className={helperClass}>
                {kelasOtomatisTersedia
                  ? "Kelas diisi otomatis dari tahun lahir."
                  : "Kosongkan jika tahun lahir tidak diketahui."}
              </p>
            </div>

            <div>
              <label htmlFor="kelas" className={labelClass}>
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                id="kelas"
                name={kelasOtomatisTersedia ? undefined : "kelas"}
                value={kelas}
                required
                onChange={(e) => setKelasManual(e.target.value)}
                disabled={kelasOtomatisTersedia}
                className={`${selectClass} ${
                  fieldErrors.kelas ? "border-red-300" : ""
                } ${
                  kelasOtomatisTersedia
                    ? "cursor-not-allowed bg-gray-50 text-gray-500"
                    : ""
                }`}
              >
                <option value="">Pilih kelas</option>
                {KELAS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              {kelasOtomatisTersedia && (
                <input type="hidden" name="kelas" value={kelas} />
              )}

              {fieldErrors.kelas && (
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.kelas}
                </p>
              )}
              <p className={helperClass}>
                {kelasOtomatisTersedia
                  ? "Kelas diisi otomatis dan tetap dikirim saat disimpan."
                  : "Wajib dipilih jika kelas tidak terisi otomatis."}
              </p>
            </div>
          </div>

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
              <p className="mt-1 text-[10px] text-red-500">
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
              <p className="mt-1 text-[10px] text-red-500">
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
              className={`w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-50 ${
                fieldErrors.alamat ? "border-red-300" : ""
              }`}
            />
            {fieldErrors.alamat && (
              <p className="mt-1 text-[10px] text-red-500">
                {fieldErrors.alamat}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
          >
            Batal
          </button>

          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#171717] px-5 text-[11px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
          >
            {mode === "add" ? "Simpan" : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
