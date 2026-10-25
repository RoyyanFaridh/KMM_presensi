export function formatJam(jam: string) {
  return jam.slice(0, 5)
}

export function formatTanggal(tanggal: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
  }).format(
    new Date(`${tanggal}T00:00:00+07:00`),
  )
}

export function formatTanggalSingkat(tanggal: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(
    new Date(tanggal),
  )
}

export function formatWaktuCheckin(waktu: string) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(
    new Date(waktu),
  )
}
