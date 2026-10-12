"use server";

import { requireAdmin } from "../auth/admin";
import { createAdminClient } from "../supabase/admin";

const WINDOW_BEFORE_MINUTES = 30;

function buildDateTime(tanggal: string, jam: string): Date {
  const normalizedJam = jam.length === 5 ? `${jam}:00` : jam;

  return new Date(`${tanggal}T${normalizedJam}+07:00`);
}

export async function getDashboardData() {
  const { desa, isSuperAdmin } = await requireAdmin();
  const supabase = createAdminClient();

  const now = new Date();

  let anggotaQuery = supabase
    .from("mudamudi")
    .select("id", { count: "exact", head: true });

  if (!isSuperAdmin) {
    anggotaQuery = anggotaQuery.eq("desa", desa!);
  }

  let kegiatanQuery = supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, desa",
    );

  if (!isSuperAdmin) {
    kegiatanQuery = kegiatanQuery.contains("desa", [desa!]);
  }

  const [anggotaResult, kegiatanDataResult] = await Promise.all([
    anggotaQuery,
    kegiatanQuery
      .order("tanggal_mulai", { ascending: true })
      .order("jam_mulai", { ascending: true }),
  ]);

  const kegiatanData = kegiatanDataResult.data ?? [];
  const kegiatanIds = kegiatanData.map((kegiatan) => kegiatan.id);

  let presensiCount = 0;
  let presensiTerbaru: {
    id: number;
    waktu_checkin: string | null;
    mudamudi: { nama: string }[] | null;
    kegiatan: { nama: string }[] | null;
  }[] = [];
  let presensiError: string | null = null;

  if (kegiatanIds.length > 0) {
    const [countResult, terbaruResult] = await Promise.all([
      supabase
        .from("presensi")
        .select("id", { count: "exact", head: true })
        .in("kegiatan_id", kegiatanIds),

      supabase
        .from("presensi")
        .select(
          `
          id,
          waktu_checkin,
          mudamudi (
            nama
          ),
          kegiatan (
            nama
          )
        `,
        )
        .in("kegiatan_id", kegiatanIds)
        .order("waktu_checkin", { ascending: false, nullsFirst: false })
        .limit(5),
    ]);

    presensiCount = countResult.count ?? 0;
    presensiTerbaru = terbaruResult.data ?? [];
    presensiError =
      countResult.error?.message ?? terbaruResult.error?.message ?? null;
  }

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

  const kegiatanTerdekat = kegiatanData
    .filter((kegiatan) => {
      const selesai = buildDateTime(
        kegiatan.tanggal_selesai,
        kegiatan.jam_selesai,
      );

      return selesai >= now;
    })
    .slice(0, 5);

  return {
    totalAnggota: anggotaResult.count ?? 0,
    totalKegiatan: kegiatanData.length,
    totalPresensi: presensiCount,
    kegiatanAktif: kegiatanAktif.length,
    kegiatanTerdekat,
    presensiTerbaru,
    error:
      anggotaResult.error?.message ??
      kegiatanDataResult.error?.message ??
      presensiError ??
      null,
  };
}
