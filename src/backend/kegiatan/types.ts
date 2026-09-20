export type Kegiatan = {
  id: number
  nama: string
  tanggal_mulai: string
  tanggal_selesai: string
  jam_mulai: string
  jam_selesai: string
  lokasi: string
  created_at: string
}

export type ModalState =
  | null
  | { type: 'add' }
  | { type: 'edit'; data: Kegiatan }
  | { type: 'delete'; data: Kegiatan }

export type FieldErrors = {
  nama?: string
  tanggal_mulai?: string
  tanggal_selesai?: string
  jam_mulai?: string
  jam_selesai?: string
  lokasi?: string
}

export type SortKey =
  | 'nama'
  | 'tanggal_mulai'
  | 'tanggal_selesai'
  | 'jam_mulai'
  | 'lokasi'
  | 'created_at'

export type SortConfig = {
  key: SortKey
  direction: 'asc' | 'desc'
} | null

export type PerPageOption = 10 | 50 | 100