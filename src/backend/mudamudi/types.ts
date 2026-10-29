export type Mudamudi = {
  id: number;
  desa: string;
  kelompok: string;
  nama: string;
  jenis_kelamin: string | null;
  tempat_lahir: string | null;
  tahun_lahir: number | null;
  no_hp: string | null;
  pekerjaan: string | null;
  kelas: string;
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
  tahun_lahir?: string;
  no_hp?: string;
  pekerjaan?: string;
  kelas?: string;
  alamat?: string;
};

export type SortKey =
  | "desa"
  | "kelompok"
  | "nama"
  | "kelas"
  | "jenis_kelamin"
  | "tahun_lahir"
  | "created_at";

export type SortConfig = {
  key: SortKey;
  direction: "asc" | "desc";
} | null;

export type PerPageOption = 10 | 50 | 100;
