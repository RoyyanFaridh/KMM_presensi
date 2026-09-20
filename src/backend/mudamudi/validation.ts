import { FieldErrors } from './types'
import { DESA_OPTIONS, KELOMPOK_BY_DESA } from './constants'

export function validateClient(
  nama: string,
  desa: string,
  kelas: string,
  kelompok: string,
  jenisKelamin: string,
  tanggalLahir: string,
): FieldErrors {
  const errors: FieldErrors = {}

  if (!desa) {
    errors.desa = 'Desa wajib dipilih'
  }

  if (!nama.trim()) {
    errors.nama = 'Nama wajib diisi'
  } else if (/\d/.test(nama)) {
    errors.nama = 'Nama tidak boleh mengandung angka'
  }

  if (!kelas) {
    errors.kelas = 'Kelas wajib dipilih'
  }

  if (!kelompok) {
    errors.kelompok = 'Kelompok wajib dipilih'
  } else if (
    desa &&
    DESA_OPTIONS.includes(
      desa as (typeof DESA_OPTIONS)[number],
    )
  ) {
    const kelompokOptions =
      KELOMPOK_BY_DESA[
        desa as keyof typeof KELOMPOK_BY_DESA
      ]

    if (!kelompokOptions.includes(
      kelompok as never,
    )) {
      errors.kelompok =
        'Kelompok tidak sesuai dengan desa'
    }
  }

  if (!jenisKelamin) {
    errors.jenis_kelamin =
      'Jenis kelamin wajib dipilih'
  }

  if (!tanggalLahir) {
    errors.tanggal_lahir =
      'Tanggal lahir wajib diisi'
  }

  return errors
}
