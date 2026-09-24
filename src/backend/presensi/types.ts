export type PresensiStatus = "hadir" | "terlambat" | "izin" | "sakit" | "alpa";

export type PresensiMetode = "qr" | "manual";

export type PresensiSummary = {
  totalHariIni: number;
  kegiatanAktif: number;
  totalKegiatanHariIni: number;
};

export type KegiatanPresensi = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  totalPresensi: number;
};

export type PresensiTerbaru = {
  id: number;
  namaPeserta: string;
  namaKegiatan: string;
  waktuCheckin: string;
  lokasi: string;
};

export type SubmitPresensiResult = {
  presensiId: number;
  waktuCheckin: string;
  status: PresensiStatus;
  metode: PresensiMetode;
  keterangan: string | null;
  deviceToken: string | null;
  kegiatan: {
    id: number;
    nama: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    jamMulai: string;
    jamSelesai: string;
    lokasi: string;
  };
  mudamudi: {
    id: number;
    nama: string;
    kelas: string;
    desa: string;
    kelompok: string;
    jenisKelamin: string | null;
  };
};

export type MonitoringPeserta = {
  presensi_id: number | null;
  mudamudi_id: number;
  nama: string;
  desa: string;
  kelompok: string;
  kelas: string;
  jenis_kelamin: string | null;
  waktu_checkin: string | null;
  status: PresensiStatus | null;
  metode: PresensiMetode | null;
  keterangan: string | null;
};

export type MonitoringPresensi = {
  kegiatan: {
    id: number;
    nama: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    jam_mulai: string;
    jam_selesai: string;
    lokasi: string;
  };
  totalPeserta: number;
  totalHadir: number;
  totalTerlambat: number;
  totalIzin: number;
  totalSakit: number;
  totalAlpa: number;
  totalBelumHadir: number;
  peserta: MonitoringPeserta[];
};

export type UpdatePresensiStatusInput = {
  presensiId: number;
  status: PresensiStatus;
};

export type RekapitulasiMudaMudi = {
  id: number;
  nama: string;
  desa: string;
  kelompok: string;
  kelas: string;
  jenis_kelamin: string | null;
};

export type RekapitulasiKegiatan = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  lokasi: string;
  desa: string[] | null;
  kelas: string[] | null;
  jenis_kelamin: string | null;
};

export type RekapitulasiKehadiran = {
  kegiatan_id: number;
  mudamudi_id: number;
  status: PresensiStatus;
  metode: PresensiMetode;
  waktu_checkin: string | null;
  keterangan: string | null;
};

export type RekapitulasiPresensi = {
  mudamudi: RekapitulasiMudaMudi[];
  kegiatan: RekapitulasiKegiatan[];
  kehadiran: RekapitulasiKehadiran[];
};

/**
 * Hasil pemeriksaan device token.
 */
export type DeviceCheckResult =
  | {
      status: "known";
      mudamudi: {
        id: number;
        nama: string;
      };
    }
  | {
      status: "unknown";
    };

export type IdentityVerificationResult =
  | {
      success: true;
      mudamudi: {
        id: number;
        nama: string;
      };
      deviceToken: string;
    }
  | {
      success: false;
      error: string;
    };
