import { FieldErrors } from "./types";

export function validateClient(
  nama: string,
  tanggalMulai: string,
  tanggalSelesai: string,
  jamMulai: string,
  jamSelesai: string,
  lokasi: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!nama.trim()) {
    errors.nama = "Nama kegiatan wajib diisi";
  }

  if (!tanggalMulai) {
    errors.tanggal_mulai = "Tanggal mulai wajib diisi";
  }

  if (!tanggalSelesai) {
    errors.tanggal_selesai = "Tanggal selesai wajib diisi";
  }

  if (tanggalMulai && tanggalSelesai && tanggalSelesai < tanggalMulai) {
    errors.tanggal_selesai =
      "Tanggal selesai harus setelah atau sama dengan tanggal mulai";
  }

  if (!jamMulai) {
    errors.jam_mulai = "Jam mulai wajib diisi";
  }

  if (!jamSelesai) {
    errors.jam_selesai = "Jam selesai wajib diisi";
  }

  if (
    tanggalMulai &&
    tanggalSelesai &&
    tanggalMulai === tanggalSelesai &&
    jamMulai &&
    jamSelesai &&
    jamSelesai <= jamMulai
  ) {
    errors.jam_selesai = "Jam selesai harus setelah jam mulai";
  }

  if (!lokasi.trim()) {
    errors.lokasi = "Lokasi wajib diisi";
  }

  return errors;
}
