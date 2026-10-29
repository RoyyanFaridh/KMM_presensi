import { FieldErrors } from "./types";
import { DESA_OPTIONS, KELOMPOK_BY_DESA } from "./constants";

export function validateClient(
  nama: string,
  desa: string,
  kelas: string,
  kelompok: string,
  jenisKelamin: string,
  tahunLahirRaw: string,
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

  // Tahun lahir opsional.
  // Jika diisi, pastikan nilainya berupa tahun yang wajar.
  if (tahunLahirRaw.trim() !== "") {
    const tahunLahir = Number(tahunLahirRaw);
    const currentYear = new Date().getFullYear();

    if (
      !Number.isInteger(tahunLahir) ||
      tahunLahir < 1900 ||
      tahunLahir > currentYear
    ) {
      errors.tahun_lahir = `Tahun lahir harus berupa angka antara 1900 dan ${currentYear}`;
    }
  }

  return errors;
}
