export type Kegiatan = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  desa: string[] | null;
  kelompok: string[] | null;
  kelas: string[] | null;
  jenis_kelamin: string | null;
  created_at: string | null;

  // Identitas pembuat kegiatan
  created_by?: string | null;
  creator_nama?: string | null;
  creator_desa?: string | null;
  creator_label?: string;
};

export type ModalState =
  | null
  | { type: "add" }
  | { type: "edit"; data: Kegiatan }
  | { type: "delete"; data: Kegiatan };

export type FieldErrors = {
  nama?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  jam_mulai?: string;
  jam_selesai?: string;
  lokasi?: string;
  desa?: string;
  kelompok?: string;
  kelas?: string;
  jenis_kelamin?: string;
};

export type SortKey =
  | "nama"
  | "tanggal_mulai"
  | "tanggal_selesai"
  | "jam_mulai"
  | "lokasi"
  | "created_at";

export type SortConfig = {
  key: SortKey;
  direction: "asc" | "desc";
} | null;

export type PerPageOption = 10 | 50 | 100;
