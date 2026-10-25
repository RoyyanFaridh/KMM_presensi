export type KegiatanTarget = {
  desa: string[] | null;
  kelompok: string[] | null;
  kelas: string[] | null;
  jenis_kelamin: string | null;
};

export type MudamudiTarget = {
  desa: string;
  kelompok: string;
  kelas: string;
  jenis_kelamin: string | null;
};

export function isMudamudiTargeted(
  kegiatan: KegiatanTarget,
  mudamudi: MudamudiTarget,
): boolean {
  const matchesDesa =
    !kegiatan.desa ||
    kegiatan.desa.length === 0 ||
    kegiatan.desa.includes(mudamudi.desa);

  const matchesKelompok =
    !kegiatan.kelompok ||
    kegiatan.kelompok.length === 0 ||
    kegiatan.kelompok.includes(mudamudi.kelompok);

  const matchesKelas =
    !kegiatan.kelas ||
    kegiatan.kelas.length === 0 ||
    kegiatan.kelas.includes(mudamudi.kelas);

  const matchesJenisKelamin =
    !kegiatan.jenis_kelamin ||
    kegiatan.jenis_kelamin === mudamudi.jenis_kelamin;

  return matchesDesa && matchesKelompok && matchesKelas && matchesJenisKelamin;
}
