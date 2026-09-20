import type { SubmitPresensiResult } from "../../backend/presensi/types";

export type Step =
  | {
      name: "scan";
    }
  | {
      name: "akun-dikenal";
    }
  | {
      name: "identitas";
      mode: "baru" | "akun-lain";
    }
  | {
      name: "berhasil";
    };

export type ScannedKegiatan = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
};

export type NamaRekomendasi = {
  id: number;
  nama: string;
  desa: string;
  kelompok: string;
};

export type CheckinStepsProps = {
  step: Step;
  nama: string;
  tanggalLahir: string;
  kegiatan: ScannedKegiatan | null;
  hasil: SubmitPresensiResult | null;
  namaDevice: string;
  error: string;
  loading: boolean;
  onNamaChange: (value: string) => void;
  onTanggalLahirChange: (value: string) => void;
  onSubmitIdentity: () => void;
  onPresensi: () => void;
  onGunakanAkunLain: () => void;
  onScan: (kegiatanId: number) => void;
  onBack: () => void;
  onReset: () => void;
};