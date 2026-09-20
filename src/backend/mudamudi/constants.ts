export const KELAS_OPTIONS = [
  "PAUD",
  "Caberawit",
  "Pra Remaja",
  "Remaja",
  "Usia Nikah",
];

export const DESA_OPTIONS = [
  "Kranggan",
  "Kretek",
  "Pandak",
  "Piring",
  "Srandakan",
];

export const KELOMPOK_BY_DESA = {
  Kranggan: ["Kleyodan", "Kranggan 1", "Kranggan 2", "Ngentak", "Tegesan"],

  Kretek: [
    "Geger",
    "Kretek",
    "Parangtritis",
    "Plumutan",
    "Pundong",
    "Tamberan",
  ],

  Pandak: [
    "Carikan",
    "Pandak 1",
    "Pandak 2",
    "Pandak 3",
    "Pandak 4",
    "Payungan",
  ],

  Piring: ["Baran", "Dagan", "Peciro", "Piring", "Selo"],

  Srandakan: [
    "Bibis",
    "Bunder",
    "Kalisat",
    "Kuthan",
    "Sawahan",
    "Tunjungan",
    "Siliran",
  ],
} as const;

export const KELOMPOK_OPTIONS = Object.values(KELOMPOK_BY_DESA).flat();

export const JENIS_KELAMIN_OPTIONS = ["Laki-laki", "Perempuan"];
