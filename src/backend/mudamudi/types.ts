export type Mudamudi = {
  id: number;
  desa: string;
  kelompok: string;
  nama: string;
  jenis_kelamin: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  umur: number | null;
  no_hp: string | null;
  pekerjaan: string | null;
  kelas: string;
  nama_ayah: string | null;
  nama_ibu: string | null;
  no_hp_ortu: string | null;
  alamat: string | null;
  qr_id: string;
  created_at: string;
};

export type ModalState =
  | null
  | { type: "add" }
  | { type: "edit"; data: Mudamudi }
  | { type: "delete"; data: Mudamudi };

export type FieldErrors = {
  desa?: string;
  kelompok?: string;
  nama?: string;
  jenis_kelamin?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  umur?: string;
  no_hp?: string;
  pekerjaan?: string;
  kelas?: string;
  nama_ayah?: string;
  nama_ibu?: string;
  no_hp_ortu?: string;
  alamat?: string;
};

export type SortKey =
  | "desa"
  | "kelompok"
  | "nama"
  | "kelas"
  | "jenis_kelamin"
  | "umur"
  | "created_at";

export type SortConfig = {
  key: SortKey;
  direction: "asc" | "desc";
} | null;

export type PerPageOption = 10 | 50 | 100;
