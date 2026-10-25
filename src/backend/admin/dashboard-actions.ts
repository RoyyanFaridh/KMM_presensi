"use server";

import { requireAdmin } from "../auth/admin";
import { createAdminClient } from "../supabase/admin";

const WINDOW_BEFORE_MINUTES = 30;

const STATUS_PRESENSI_TERCATAT = [
  "hadir",
  "terlambat",
  "izin",
  "sakit",
  "alpa",
] as const;

type StatusPresensi = (typeof STATUS_PRESENSI_TERCATAT)[number];

const STATUS_LABEL: Record<StatusPresensi, string> = {
  hadir: "Hadir",
  terlambat: "Terlambat",
  izin: "Izin",
  sakit: "Sakit",
  alpa: "Alpa",
};

function buildDateTime(tanggal: string, jam: string): Date {
  const normalizedJam = jam.length === 5 ? `${jam}:00` : jam;

  return new Date(`${tanggal}T${normalizedJam}+07:00`);
}

export async function getDashboardData() {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const desa = admin.desa;
  const isSuperAdmin = admin.isSuperAdmin;

  if (!isSuperAdmin && !desa) {
    throw new Error("Profil Admin Desa belum memiliki data desa yang valid.");
  }

  const now = new Date();

  // Ambil anggota sesuai cakupan desa Admin.
  let anggotaQuery = supabase.from("mudamudi").select("id, desa, kelompok");

  if (!isSuperAdmin) {
    anggotaQuery = anggotaQuery.eq("desa", desa!);
  }

  // Admin Daerah melihat seluruh kegiatan.
  // Admin Desa hanya melihat kegiatan yang dibuat oleh akunnya sendiri.
  let kegiatanQuery = supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, desa, created_by",
    );

  if (!isSuperAdmin) {
    kegiatanQuery = kegiatanQuery.eq("created_by", admin.user.id);
  }

  const [anggotaResult, kegiatanDataResult] = await Promise.all([
    anggotaQuery,
    kegiatanQuery
      .order("tanggal_mulai", { ascending: true })
      .order("jam_mulai", { ascending: true }),
  ]);

  const anggotaData = anggotaResult.data ?? [];
  const kegiatanData = kegiatanDataResult.data ?? [];
  const kegiatanIds = kegiatanData.map((kegiatan) => kegiatan.id);

  // Desa -> kelompok -> jumlah anggota.
  const anggotaPerDesaMap = new Map<string, Map<string, number>>();

  anggotaData.forEach((anggota) => {
    const desaLabel = anggota.desa?.trim() || "Desa belum diisi";
    const kelompokLabel = anggota.kelompok?.trim() || "Kelompok belum diisi";

    const kelompokMap =
      anggotaPerDesaMap.get(desaLabel) ?? new Map<string, number>();

    kelompokMap.set(kelompokLabel, (kelompokMap.get(kelompokLabel) ?? 0) + 1);
    anggotaPerDesaMap.set(desaLabel, kelompokMap);
  });

  const anggotaDistribusi = Array.from(
    anggotaPerDesaMap,
    ([label, kelompokMap]) => {
      const kelompok = Array.from(kelompokMap, ([kelompokLabel, jumlah]) => ({
        label: kelompokLabel,
        jumlah,
      })).sort((a, b) =>
        a.label.localeCompare(b.label, "id", { numeric: true }),
      );

      return {
        label,
        jumlah: kelompok.reduce((total, item) => total + item.jumlah, 0),
        kelompok,
      };
    },
  ).sort((a, b) => b.jumlah - a.jumlah);

  // Distribusi status presensi.
  const statusDistribusi: {
    label: string;
    jumlah: number;
  }[] = STATUS_PRESENSI_TERCATAT.map((status) => ({
    label: STATUS_LABEL[status],
    jumlah: 0,
  }));

  let presensiCount = 0;
  let presensiError: string | null = null;

  // Hitung presensi hanya dari kegiatan yang masuk cakupan dashboard.
  if (kegiatanIds.length > 0) {
    const [totalResult, ...countResults] = await Promise.all([
      supabase
        .from("presensi")
        .select("id", {
          count: "exact",
          head: true,
        })
        .in("kegiatan_id", kegiatanIds),

      ...STATUS_PRESENSI_TERCATAT.map((status) =>
        supabase
          .from("presensi")
          .select("id", {
            count: "exact",
            head: true,
          })
          .in("kegiatan_id", kegiatanIds)
          .eq("status", status),
      ),
    ]);

    presensiError =
      totalResult.error?.message ??
      countResults.find((result) => result.error)?.error?.message ??
      null;

    // Hindari menampilkan hasil parsial jika query gagal.
    if (!presensiError) {
      presensiCount = totalResult.count ?? 0;

      countResults.forEach((result, index) => {
        statusDistribusi[index].jumlah = result.count ?? 0;
      });
    }
  }

  // Kegiatan aktif dalam jendela presensi:
  // mulai 30 menit sebelum jam mulai hingga jam selesai.
  const kegiatanAktif = kegiatanData.filter((kegiatan) => {
    const mulai = buildDateTime(kegiatan.tanggal_mulai, kegiatan.jam_mulai);
    const selesai = buildDateTime(
      kegiatan.tanggal_selesai,
      kegiatan.jam_selesai,
    );

    const bukaMulai = new Date(
      mulai.getTime() - WINDOW_BEFORE_MINUTES * 60 * 1000,
    );

    return now >= bukaMulai && now <= selesai;
  });

  // Kegiatan terdekat hanya berasal dari kegiatan dalam cakupan admin.
  const kegiatanTerdekat = kegiatanData
    .filter((kegiatan) => {
      const selesai = buildDateTime(
        kegiatan.tanggal_selesai,
        kegiatan.jam_selesai,
      );

      return selesai >= now;
    })
    .slice(0, 4);

  return {
    totalAnggota: anggotaData.length,
    totalKegiatan: kegiatanData.length,
    totalPresensi: presensiCount,
    kegiatanAktif: kegiatanAktif.length,
    kegiatanTerdekat,
    anggotaDistribusi,
    statusDistribusi,
    isSuperAdmin,
    error:
      anggotaResult.error?.message ??
      kegiatanDataResult.error?.message ??
      presensiError,
  };
}
