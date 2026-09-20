export function buildDateTime(tanggal: string, jam: string) {
  const normalizedJam = jam.length === 5 ? `${jam}:00` : jam;

  return new Date(`${tanggal}T${normalizedJam}+07:00`);
}

export function isKegiatanAktif(
  tanggalMulai: string,
  tanggalSelesai: string,
  jamMulai: string,
  jamSelesai: string,
) {
  const now = new Date();

  const mulai = buildDateTime(tanggalMulai, jamMulai);

  const selesai = buildDateTime(tanggalSelesai, jamSelesai);

  const bukaMulai = new Date(mulai.getTime() - 30 * 60 * 1000);

  return now >= bukaMulai && now <= selesai;
}

export function getToday() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function getTomorrow(today: string) {
  const date = new Date(`${today}T00:00:00+07:00`);

  date.setDate(date.getDate() + 1);

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(date);
}
