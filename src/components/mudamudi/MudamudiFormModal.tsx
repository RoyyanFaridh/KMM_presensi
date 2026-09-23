"use client";

import { useEffect, useState } from "react";
import { Mudamudi, FieldErrors } from "../../backend/mudamudi/types";
import {
  DESA_OPTIONS,
  KELOMPOK_BY_DESA,
  JENIS_KELAMIN_OPTIONS,
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

function calculateAge(tanggalLahir: string): number | null {
  if (!tanggalLahir) {
    return null;
  }

  const birthDate = new Date(`${tanggalLahir}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : null;
}

function calculatekelas(umur: number | null): string {
  if (umur === null) {
    return "";
  }

  if (umur >= 5 && umur <= 6) {
    return "PAUD";
  }

  if (umur >= 7 && umur <= 12) {
    return "Caberawit";
  }

  if (umur >= 13 && umur <= 15) {
    return "Pra Remaja";
  }

  if (umur >= 16 && umur <= 18) {
    return "Remaja";
  }

  if (umur >= 19) {
    return "Usia Nikah";
  }

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

  const [tanggalLahir, setTanggalLahir] = useState(
    initialData?.tanggal_lahir ?? "",
  );

  const [kelompok, setKelompok] = useState(initialData?.kelompok ?? "");

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

  const umur = calculateAge(tanggalLahir);
  const kelas = calculatekelas(umur);

  return (
    <ModalWrapper onClose={onClose}>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-125 overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
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

        {/* FORM CONTENT */}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-5">
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

          {/* NAMA */}
          <div>
            <label
              htmlFor="nama"
              className="mb-1.5 block text-[11px] font-medium text-gray-400"
            >
              Nama
            </label>

            <input
              id="nama"
              name="nama"
              type="text"
              placeholder="Masukkan nama lengkap"
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

          {/* DESA + KELOMPOK */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="desa"
                className="mb-1.5 block text-[11px] font-medium text-gray-400"
              >
                Desa
              </label>

              <div className="relative">
                {isAdminDesa ? (
                  <>
                    <div className="flex h-9.75 w-full items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-[12px] text-gray-600">
                      {adminDesa}
                    </div>

                    <input type="hidden" name="desa" value={desa} />
                  </>
                ) : (
                  <>
                    <select
                      id="desa"
                      name="desa"
                      value={desa}
                      onChange={(e) => {
                        setDesa(e.target.value);
                        setKelompok("");
                      }}
                      className={`h-9.75 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-[12px] outline-none transition focus:ring-2 ${
                        desa ? "text-gray-700" : "text-gray-500"
                      } ${
                        fieldErrors.desa
                          ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                          : "border-gray-200 focus:border-teal-300 focus:ring-teal-50"
                      }`}
                    >
                      <option value="" disabled>
                        Pilih Desa
                      </option>

                      {DESA_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m6 9 6 6 6-6"
                        />
                      </svg>
                    </div>
                  </>
                )}
              </div>

              {fieldErrors.desa && (
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.desa}
                </p>
              )}

              {isAdminDesa && (
                <p className="mt-1 text-[9px] text-gray-400">
                  Desa mengikuti wilayah akun admin.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="kelompok"
                className="mb-1.5 block text-[11px] font-medium text-gray-400"
              >
                Kelompok
              </label>

              <div className="relative">
                <select
                  id="kelompok"
                  name="kelompok"
                  value={kelompok}
                  onChange={(e) => setKelompok(e.target.value)}
                  disabled={!desa}
                  className={`h-9.75 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-[12px] outline-none transition focus:ring-2 ${
                    kelompok ? "text-gray-700" : "text-gray-500"
                  } ${
                    fieldErrors.kelompok
                      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                      : "border-gray-200 focus:border-sky-300 focus:ring-sky-50"
                  } ${!desa ? "cursor-not-allowed bg-gray-50" : ""}`}
                >
                  <option value="" disabled>
                    {desa ? "Pilih Kelompok" : "Pilih Desa Dahulu"}
                  </option>

                  {kelompokOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
                </div>
              </div>

              {fieldErrors.kelompok && (
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.kelompok}
                </p>
              )}
            </div>
          </div>

          {/* JENIS KELAMIN + TANGGAL LAHIR */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="jenis_kelamin"
                className="mb-1.5 block text-[11px] font-medium text-gray-400"
              >
                Jenis Kelamin
              </label>

              <div className="relative">
                <select
                  id="jenis_kelamin"
                  name="jenis_kelamin"
                  defaultValue={initialData?.jenis_kelamin ?? ""}
                  className={`h-9.75 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-[12px] outline-none transition focus:ring-2 ${
                    initialData?.jenis_kelamin
                      ? "text-gray-700"
                      : "text-gray-500"
                  } ${
                    fieldErrors.jenis_kelamin
                      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                      : "border-gray-200 focus:border-violet-300 focus:ring-violet-50"
                  }`}
                >
                  <option value="" disabled>
                    Pilih Jenis Kelamin
                  </option>

                  {JENIS_KELAMIN_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
                </div>
              </div>

              {fieldErrors.jenis_kelamin && (
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.jenis_kelamin}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="tanggal_lahir"
                className="mb-1.5 block text-[11px] font-medium text-gray-400"
              >
                Tanggal Lahir
              </label>

              <input
                id="tanggal_lahir"
                name="tanggal_lahir"
                type="date"
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                className={`h-9.75 w-full rounded-lg border bg-white px-3 text-[12px] text-gray-700 outline-none transition focus:ring-2 ${
                  fieldErrors.tanggal_lahir
                    ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                    : "border-gray-200 focus:border-rose-300 focus:ring-rose-50"
                }`}
              />

              {fieldErrors.tanggal_lahir && (
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.tanggal_lahir}
                </p>
              )}
            </div>
          </div>

          {/* UMUR + kelas */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="umur"
                className="mb-1.5 block text-[11px] font-medium text-gray-400"
              >
                Umur
              </label>

              <input
                id="umur"
                name="umur"
                type="number"
                value={umur ?? ""}
                readOnly
                tabIndex={-1}
                className="h-9.75 w-full cursor-default rounded-lg border border-gray-200 bg-gray-50 px-3 text-[12px] text-gray-600 outline-none"
              />

              <p className="mt-1 text-[9px] text-gray-400">
                Umur dihitung otomatis dari tanggal lahir.
              </p>
            </div>

            <div>
              <label
                htmlFor="kelas"
                className="mb-1.5 block text-[11px] font-medium text-gray-400"
              >
                kelas
              </label>

              <input
                id="kelas"
                name="kelas"
                type="text"
                value={kelas}
                readOnly
                tabIndex={-1}
                placeholder="Akan ditentukan otomatis"
                className="h-9.75 w-full cursor-default rounded-lg border border-gray-200 bg-gray-50 px-3 text-[12px] text-gray-600 outline-none"
              />

              <p className="mt-1 text-[9px] text-gray-400">
                kelas ditentukan otomatis berdasarkan umur.
              </p>
            </div>
          </div>

          {/* PEKERJAAN */}
          <div>
            <label
              htmlFor="pekerjaan"
              className="mb-1.5 block text-[11px] font-medium text-gray-400"
            >
              Pekerjaan
            </label>

            <input
              id="pekerjaan"
              name="pekerjaan"
              type="text"
              placeholder="Masukkan pekerjaan"
              defaultValue={initialData?.pekerjaan ?? ""}
              className={`h-9.75 w-full rounded-lg border bg-white px-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-50 ${
                fieldErrors.pekerjaan
                  ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                  : "border-gray-200"
              }`}
            />

            {fieldErrors.pekerjaan && (
              <p className="mt-1 text-[10px] text-red-500">
                {fieldErrors.pekerjaan}
              </p>
            )}
          </div>

          {/* NO HP */}
          <div>
            <label
              htmlFor="no_hp"
              className="mb-1.5 block text-[11px] font-medium text-gray-400"
            >
              No. HP
            </label>

            <input
              id="no_hp"
              name="no_hp"
              type="tel"
              inputMode="numeric"
              placeholder="Masukkan nomor HP"
              defaultValue={initialData?.no_hp ?? ""}
              className={`h-9.75 w-full rounded-lg border bg-white px-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-50 ${
                fieldErrors.no_hp
                  ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                  : "border-gray-200"
              }`}
            />

            {fieldErrors.no_hp && (
              <p className="mt-1 text-[10px] text-red-500">
                {fieldErrors.no_hp}
              </p>
            )}
          </div>

          {/* ALAMAT */}
          <div>
            <label
              htmlFor="alamat"
              className="mb-1.5 block text-[11px] font-medium text-gray-400"
            >
              Alamat
            </label>

            <textarea
              id="alamat"
              name="alamat"
              rows={2}
              placeholder="Masukkan alamat"
              defaultValue={initialData?.alamat ?? ""}
              className={`w-full resize-none rounded-lg border bg-white px-3 py-2 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-50 ${
                fieldErrors.alamat
                  ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                  : "border-gray-200"
              }`}
            />

            {fieldErrors.alamat && (
              <p className="mt-1 text-[10px] text-red-500">
                {fieldErrors.alamat}
              </p>
            )}
          </div>

          {/* DATA ORANG TUA */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="mb-3 text-[11px] font-semibold text-gray-700">
              Data Orang Tua
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="nama_ayah"
                  className="mb-1.5 block text-[11px] font-medium text-gray-400"
                >
                  Nama Ayah
                </label>

                <input
                  id="nama_ayah"
                  name="nama_ayah"
                  type="text"
                  placeholder="Masukkan nama ayah"
                  defaultValue={initialData?.nama_ayah ?? ""}
                  className={`h-9.75 w-full rounded-lg border bg-white px-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-50 ${
                    fieldErrors.nama_ayah
                      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                      : "border-gray-200"
                  }`}
                />

                {fieldErrors.nama_ayah && (
                  <p className="mt-1 text-[10px] text-red-500">
                    {fieldErrors.nama_ayah}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="nama_ibu"
                  className="mb-1.5 block text-[11px] font-medium text-gray-400"
                >
                  Nama Ibu
                </label>

                <input
                  id="nama_ibu"
                  name="nama_ibu"
                  type="text"
                  placeholder="Masukkan nama ibu"
                  defaultValue={initialData?.nama_ibu ?? ""}
                  className={`h-9.75 w-full rounded-lg border bg-white px-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-50 ${
                    fieldErrors.nama_ibu
                      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                      : "border-gray-200"
                  }`}
                />

                {fieldErrors.nama_ibu && (
                  <p className="mt-1 text-[10px] text-red-500">
                    {fieldErrors.nama_ibu}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="no_hp_ortu"
                  className="mb-1.5 block text-[11px] font-medium text-gray-400"
                >
                  No. HP Orang Tua
                </label>

                <input
                  id="no_hp_ortu"
                  name="no_hp_ortu"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Masukkan nomor HP orang tua"
                  defaultValue={initialData?.no_hp_ortu ?? ""}
                  className={`h-9.75 w-full rounded-lg border bg-white px-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-50 ${
                    fieldErrors.no_hp_ortu
                      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                      : "border-gray-200"
                  }`}
                />

                {fieldErrors.no_hp_ortu && (
                  <p className="mt-1 text-[10px] text-red-500">
                    {fieldErrors.no_hp_ortu}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end">
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
