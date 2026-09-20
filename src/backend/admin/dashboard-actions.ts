"use server";

import { createAdminClient } from "../supabase/admin";

const WINDOW_BEFORE_MINUTES = 30;

function buildDateTime(tanggal: string, jam: string): Date {
  const normalizedJam = jam.length === 5 ? `${jam}:00` : jam;

  return new Date(`${tanggal}T${normalizedJam}+07:00`);
}

export async function getDashboardData() {
  const supabase = createAdminClient();

  const now = new Date();

  const [
    anggotaResult,
    kegiatanResult,
    presensiResult,
    kegiatanDataResult,
    presensiTerbaruResult,
  ] = await Promise.all([
    supabase.from("mudamudi").select("id", { count: "exact", head: true }),

    supabase.from("kegiatan").select("id", { count: "exact", head: true }),

    supabase.from("presensi").select("id", { count: "exact", head: true }),

    supabase
      .from("kegiatan")
      .select(
        "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi",
      )
      .order("tanggal_mulai", { ascending: true })
      .order("jam_mulai", { ascending: true }),

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
      .order("waktu_checkin", { ascending: false })
      .limit(5),
  ]);

  const kegiatanData = kegiatanDataResult.data ?? [];

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
    totalKegiatan: kegiatanResult.count ?? 0,
    totalPresensi: presensiResult.count ?? 0,
    kegiatanAktif: kegiatanAktif.length,
    kegiatanTerdekat,
    presensiTerbaru: presensiTerbaruResult.data ?? [],
    error:
      anggotaResult.error?.message ??
      kegiatanResult.error?.message ??
      presensiResult.error?.message ??
      kegiatanDataResult.error?.message ??
      presensiTerbaruResult.error?.message ??
      null,
  };
}
