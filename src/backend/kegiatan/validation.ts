import { JENJANG_BY_KELAS } from "../mudamudi/constants";
import { FieldErrors } from "./types";

export function validateClient(
  nama: string,
  tanggalMulai: string,
  tanggalSelesai: string,
  jamMulai: string,
  jamSelesai: string,
  lokasi: string,
  desa: string[],
  kelas: string[],
  jenjang: string[],
  jenisKelamin: string,
): FieldErrors {
  const errors: FieldErrors = {};

  // Validasi nama kegiatan
  if (!nama.trim()) {
    errors.nama = "Nama kegiatan wajib diisi.";
  }

  // Validasi tanggal
  if (!tanggalMulai) {
    errors.tanggal_mulai = "Tanggal mulai wajib diisi.";
  }

  if (!tanggalSelesai) {
    errors.tanggal_selesai = "Tanggal selesai wajib diisi.";
  }

  if (
    tanggalMulai &&
    tanggalSelesai &&
    tanggalSelesai < tanggalMulai
  ) {
    errors.tanggal_selesai =
      "Tanggal selesai harus setelah atau sama dengan tanggal mulai.";
  }

  // Validasi jam
  if (!jamMulai) {
    errors.jam_mulai = "Jam mulai wajib diisi.";
  }

  if (!jamSelesai) {
    errors.jam_selesai = "Jam selesai wajib diisi.";
  }

  if (
    tanggalMulai &&
    tanggalSelesai &&
    tanggalMulai === tanggalSelesai &&
    jamMulai &&
    jamSelesai &&
    jamSelesai <= jamMulai
  ) {
    errors.jam_selesai =
      "Jam selesai harus setelah jam mulai.";
  }

  // Validasi lokasi
  if (!lokasi.trim()) {
    errors.lokasi = "Lokasi kegiatan wajib diisi.";
  }

  // Validasi desa sasaran
  if (!Array.isArray(desa)) {
    errors.desa = "Data desa tidak valid.";
  } else if (desa.length === 0) {
    errors.desa = "Pilih minimal satu desa.";
  }

  // Validasi kelas sasaran
  if (!Array.isArray(kelas)) {
    errors.kelas = "Data kelas tidak valid.";
  } else if (kelas.length === 0) {
    errors.kelas = "Pilih minimal satu kelas peserta.";
  }

  // Validasi jenjang sasaran
  if (!Array.isArray(jenjang)) {
    errors.jenjang = "Data jenjang tidak valid.";
  } else if (kelas.length > 0) {
    for (const k of kelas) {
      const list = JENJANG_BY_KELAS[k as keyof typeof JENJANG_BY_KELAS] ?? [];
      if (!list.some((j) => jenjang.includes(j))) {
        errors.jenjang = `Pilih minimal satu jenjang untuk kelas ${k}.`;
        break;
      }
    }
  }

  // Validasi jenis kelamin
  if (
    typeof jenisKelamin !== "string" ||
    !["", "Laki-laki", "Perempuan"].includes(jenisKelamin)
  ) {
    errors.jenis_kelamin = "Pilihan jenis kelamin tidak valid.";
  }

  return errors;
}
