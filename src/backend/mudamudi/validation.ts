import { FieldErrors } from "./types";
import { DESA_OPTIONS, KELOMPOK_BY_DESA } from "./constants";

export function validateClient(
  nama: string,
  desa: string,
  kelas: string,
  kelompok: string,
  jenisKelamin: string,
  tanggalLahir: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!desa) {
    errors.desa = "Desa wajib dipilih";
  }

  if (!nama.trim()) {
    errors.nama = "Nama wajib diisi";
  } else if (/\d/.test(nama)) {
    errors.nama = "Nama tidak boleh mengandung angka";
  }

  // Kelas otomatis berdasarkan umur.
  // Kosong diperbolehkan jika umur belum dapat ditentukan.
  if (!kelompok) {
    errors.kelompok = "Kelompok wajib dipilih";
  } else if (
    desa &&
    DESA_OPTIONS.includes(desa as (typeof DESA_OPTIONS)[number])
  ) {
    const kelompokOptions =
      KELOMPOK_BY_DESA[desa as keyof typeof KELOMPOK_BY_DESA];

    if (!kelompokOptions.includes(kelompok as never)) {
      errors.kelompok = "Kelompok tidak sesuai dengan desa";
    }
  }

  if (!jenisKelamin) {
    errors.jenis_kelamin = "Jenis kelamin wajib dipilih";
  }

  // Tanggal lahir opsional.
  // Jika diisi, pastikan format dan tanggalnya valid.
  if (tanggalLahir) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tanggalLahir);

    if (!match) {
      errors.tanggal_lahir = "Format tanggal lahir tidak valid";
    } else {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const birthDate = new Date(year, month - 1, day);

      if (
        birthDate.getFullYear() !== year ||
        birthDate.getMonth() !== month - 1 ||
        birthDate.getDate() !== day
      ) {
        errors.tanggal_lahir = "Tanggal lahir tidak valid";
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (birthDate > today) {
          errors.tanggal_lahir = "Tanggal lahir tidak boleh di masa depan";
        }
      }
    }
  }

  return errors;
}
