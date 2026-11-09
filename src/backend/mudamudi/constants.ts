export const JENJANG_BY_KELAS = {
  PAUD: ["Belum Sekolah", "PAUD"],
  TK: ["TK"],
  "Caberawit A": ["SD-1", "SD-2", "SD-3"],
  "Caberawit B": ["SD-4", "SD-5", "SD-6"],
  "Pra Remaja": ["SMP-1", "SMP-2", "SMP-3"],
  Remaja: ["SMA-1", "SMA-2", "SMA-3"],
  "Usia Nikah": ["Kuliah", "Kerja"],
  "MT": ["MT"],
} as const;

export type KelasOption = keyof typeof JENJANG_BY_KELAS;

export const KELAS_OPTIONS = [
  "PAUD",
  "TK",
  "Caberawit A",
  "Caberawit B",
  "Pra Remaja",
  "Remaja",
  "Usia Nikah",
  "MT",
] as const;

export const JENJANG_OPTIONS = [
  "Belum Sekolah",
  "PAUD",
  "TK",
  "SD-1",
  "SD-2",
  "SD-3",
  "SD-4",
  "SD-5",
  "SD-6",
  "SMP-1",
  "SMP-2",
  "SMP-3",
  "SMA-1",
  "SMA-2",
  "SMA-3",
  "Kuliah",
  "Kerja",
  "MT",
] as const;

export function calculateKelasFromJenjang(jenjang: string): string {
  for (const [kelas, daftarJenjang] of Object.entries(JENJANG_BY_KELAS)) {
    if ((daftarJenjang as readonly string[]).includes(jenjang)) {
      return kelas;
    }
  }
  return "";
}

export const DESA_OPTIONS = [
  "Kranggan",
  "Kretek",
  "Pandak",
  "Piring",
  "Srandakan",
] as const;

export const KELOMPOK_BY_DESA = {
  Kranggan: ["Kleyodan", "Kranggan 1", "Kranggan 2", "Ngentak", "Tegesan"],
  Kretek: ["Geger", "Kretek", "Parangtritis", "Plumutan", "Pundong", "Tamberan"],
  Pandak: ["Carikan", "Pandak 1", "Pandak 2", "Pandak 3", "Pandak 4", "Payungan"],
  Piring: ["Baran", "Dagan", "Peciro", "Piring", "Selo"],
  Srandakan: ["Bibis", "Bunder", "Kalisat", "Kuthan", "Sawahan", "Tunjungan", "Siliran"],
} as const;

export const KELOMPOK_OPTIONS = Object.values(KELOMPOK_BY_DESA).flat();
export const JENIS_KELAMIN_OPTIONS = ["Laki-laki", "Perempuan"] as const;
