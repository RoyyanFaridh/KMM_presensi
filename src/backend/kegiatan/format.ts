export function formatTanggal(tanggal: string) {
  if (!tanggal) return "-";

  const [year, month, day] = tanggal.split("-");

  if (!year || !month || !day) {
    return tanggal;
  }

  return `${day}-${month}-${year}`;
}

export function formatJam(jam: string) {
  if (!jam) return "-";

  return jam.slice(0, 5);
}

export function formatRentangTanggal(
  tanggalMulai: string,
  tanggalSelesai: string,
) {
  if (!tanggalMulai && !tanggalSelesai) {
    return "-";
  }

  if (!tanggalSelesai || tanggalMulai === tanggalSelesai) {
    return formatTanggal(tanggalMulai);
  }

  return `${formatTanggal(tanggalMulai)} - ${formatTanggal(
    tanggalSelesai,
  )}`;
}

export type KegiatanStatus =
  | "akan_berlangsung"
  | "sedang_berlangsung"
  | "selesai";

function buildDateTime(tanggal: string, jam: string): Date {
  return new Date(`${tanggal}T${jam}+07:00`);
}

export function getKegiatanStatus(
  tanggalMulai: string,
  tanggalSelesai: string,
  jamMulai: string,
  jamSelesai: string,
): KegiatanStatus {
  const now = new Date();

  const mulai = buildDateTime(tanggalMulai, jamMulai);

  const selesai = buildDateTime(tanggalSelesai, jamSelesai);

  const bukaMulai = new Date(
    mulai.getTime() - 30 * 60 * 1000,
  );

  if (now < bukaMulai) {
    return "akan_berlangsung";
  }

  if (now <= selesai) {
    return "sedang_berlangsung";
  }

  return "selesai";
}

export function getKegiatanStatusLabel(
  status: KegiatanStatus,
): string {
  const labels: Record<KegiatanStatus, string> = {
    akan_berlangsung: "Akan berlangsung",
    sedang_berlangsung: "Sedang berlangsung",
    selesai: "Selesai",
  };

  return labels[status];
}