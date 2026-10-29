import { MonitoringPeserta } from "./types";

export type RekapKelompok = {
  kelompok: string;
  hadirPutra: number;
  hadirPutri: number;
  totalHadir: number;
  izinPutra: number;
  izinPutri: number;
  totalIzin: number;
  wajibPutra: number;
  wajibPutri: number;
  totalWajib: number;
  persentase: number;
  persentaseText: string;
};

export type RekapTotal = {
  hadirPutra: number;
  hadirPutri: number;
  totalHadir: number;
  izinPutra: number;
  izinPutri: number;
  totalIzin: number;
  wajibPutra: number;
  wajibPutri: number;
  totalWajib: number;
  persentase: number;
  persentaseText: string;
};

export type RekapitulasiBeritaAcara = {
  perKelompok: RekapKelompok[];
  total: RekapTotal;
};

export function isPutra(jk: string | null | undefined): boolean {
  if (!jk) return false;
  const lower = jk.trim().toLowerCase();
  return lower === "laki-laki" || lower === "l" || lower === "putra";
}

export function isPutri(jk: string | null | undefined): boolean {
  if (!jk) return false;
  const lower = jk.trim().toLowerCase();
  return lower === "perempuan" || lower === "p" || lower === "putri";
}

export function formatPersentaseIndonesia(nilai: number): string {
  if (!Number.isFinite(nilai) || nilai <= 0) {
    return "0%";
  }

  // Jika bilangan bulat, tampilkan tanpa desimal (contoh: 100%)
  if (Math.abs(nilai - Math.round(nilai)) < 0.001) {
    return `${Math.round(nilai)}%`;
  }

  // Jika ada desimal, gunakan maksimal 2 angka desimal dengan koma khas Indonesia (contoh: 93,55%)
  return `${nilai.toFixed(2).replace(".", ",")}%`;
}

export function hitungRekapitulasiBeritaAcara(
  pesertaList: MonitoringPeserta[],
): RekapitulasiBeritaAcara {
  // Saring peserta: keluarkan jika statusnya 'tidak_berlaku'
  const validPeserta = pesertaList.filter((p) => {
    const st = String(p.status ?? "").trim().toLowerCase();
    return st !== "tidak_berlaku";
  });

  // Kelompokkan peserta berdasarkan nama kelompok
  const groups = new Map<string, MonitoringPeserta[]>();

  for (const peserta of validPeserta) {
    const kelompokNama = peserta.kelompok?.trim() || "-";
    const existing = groups.get(kelompokNama) ?? [];
    existing.push(peserta);
    groups.set(kelompokNama, existing);
  }

  // Urutkan kelompok berdasarkan abjad
  const sortedKelompokNames = Array.from(groups.keys()).sort((a, b) =>
    a.localeCompare(b, "id", { numeric: true, sensitivity: "base" }),
  );

  let grandHadirPutra = 0;
  let grandHadirPutri = 0;
  let grandTotalHadir = 0;
  let grandIzinPutra = 0;
  let grandIzinPutri = 0;
  let grandTotalIzin = 0;
  let grandWajibPutra = 0;
  let grandWajibPutri = 0;
  let grandTotalWajib = 0;

  const perKelompok: RekapKelompok[] = [];

  for (const namaKelompok of sortedKelompokNames) {
    const anggota = groups.get(namaKelompok) ?? [];

    let hadirPutra = 0;
    let hadirPutri = 0;
    let izinPutra = 0;
    let izinPutri = 0;
    let wajibPutra = 0;
    let wajibPutri = 0;

    for (const p of anggota) {
      const putra = isPutra(p.jenis_kelamin);
      const putri = isPutri(p.jenis_kelamin);

      if (putra) wajibPutra++;
      if (putri) wajibPutri++;

      const st = String(p.status ?? "").trim().toLowerCase();

      if (st === "hadir" || st === "terlambat") {
        if (putra) hadirPutra++;
        if (putri) hadirPutri++;
      } else if (st === "izin") {
        if (putra) izinPutra++;
        if (putri) izinPutri++;
      }
    }

    const totalHadir = hadirPutra + hadirPutri;
    const totalIzin = izinPutra + izinPutri;
    const totalWajib = wajibPutra + wajibPutri;

    let persentase = 0;
    if (totalWajib > 0) {
      persentase = ((totalHadir + totalIzin) / totalWajib) * 100;
    }

    perKelompok.push({
      kelompok: namaKelompok,
      hadirPutra,
      hadirPutri,
      totalHadir,
      izinPutra,
      izinPutri,
      totalIzin,
      wajibPutra,
      wajibPutri,
      totalWajib,
      persentase,
      persentaseText: formatPersentaseIndonesia(persentase),
    });

    grandHadirPutra += hadirPutra;
    grandHadirPutri += hadirPutri;
    grandTotalHadir += totalHadir;
    grandIzinPutra += izinPutra;
    grandIzinPutri += izinPutri;
    grandTotalIzin += totalIzin;
    grandWajibPutra += wajibPutra;
    grandWajibPutri += wajibPutri;
    grandTotalWajib += totalWajib;
  }

  let grandPersentase = 0;
  if (grandTotalWajib > 0) {
    grandPersentase =
      ((grandTotalHadir + grandTotalIzin) / grandTotalWajib) * 100;
  }

  const total: RekapTotal = {
    hadirPutra: grandHadirPutra,
    hadirPutri: grandHadirPutri,
    totalHadir: grandTotalHadir,
    izinPutra: grandIzinPutra,
    izinPutri: grandIzinPutri,
    totalIzin: grandTotalIzin,
    wajibPutra: grandWajibPutra,
    wajibPutri: grandWajibPutri,
    totalWajib: grandTotalWajib,
    persentase: grandPersentase,
    persentaseText: formatPersentaseIndonesia(grandPersentase),
  };

  return {
    perKelompok,
    total,
  };
}

