"use server";

import { createClient } from "../supabase/server";
import { isKegiatanAktif, getToday, getTomorrow } from "./helpers";
import { KegiatanPresensi, PresensiSummary, PresensiTerbaru } from "./types";

export async function getPresensiSummary() {
  const supabase = await createClient();

  const today = getToday();
  const tomorrow = getTomorrow(today);

  const [presensiResult, kegiatanResult] = await Promise.all([
    supabase
      .from("presensi")
      .select("id", {
        count: "exact",
        head: true,
      })
      .gte("waktu_checkin", `${today}T00:00:00+07:00`)
      .lt("waktu_checkin", `${tomorrow}T00:00:00+07:00`),

    supabase
      .from("kegiatan")
      .select("id, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai")
      .lte("tanggal_mulai", today)
      .gte("tanggal_selesai", today),
  ]);

  if (presensiResult.error) {
    return {
      data: {
        totalHariIni: 0,
        kegiatanAktif: 0,
        totalKegiatanHariIni: 0,
      } satisfies PresensiSummary,
      error: presensiResult.error.message,
    };
  }

  if (kegiatanResult.error) {
    return {
      data: {
        totalHariIni: presensiResult.count ?? 0,
        kegiatanAktif: 0,
        totalKegiatanHariIni: 0,
      } satisfies PresensiSummary,
      error: kegiatanResult.error.message,
    };
  }

  const kegiatanAktif = (kegiatanResult.data ?? []).filter((kegiatan) =>
    isKegiatanAktif(
      kegiatan.tanggal_mulai,
      kegiatan.tanggal_selesai,
      kegiatan.jam_mulai,
      kegiatan.jam_selesai,
    ),
  ).length;

  return {
    data: {
      totalHariIni: presensiResult.count ?? 0,
      kegiatanAktif,
      totalKegiatanHariIni: kegiatanResult.data?.length ?? 0,
    } satisfies PresensiSummary,
  };
}

export async function getKegiatanPresensi() {
  const supabase = await createClient();

  const today = getToday();

  const { data: kegiatan, error } = await supabase
    .from("kegiatan")
    .select(
      `
      id,
      nama,
      tanggal_mulai,
      tanggal_selesai,
      jam_mulai,
      jam_selesai,
      lokasi
    `,
    )
    .lte("tanggal_mulai", today)
    .gte("tanggal_selesai", today)
    .order("jam_mulai", {
      ascending: true,
    });

  if (error) {
    return {
      data: [] as KegiatanPresensi[],
      error: error.message,
    };
  }

  if (!kegiatan?.length) {
    return {
      data: [] as KegiatanPresensi[],
    };
  }

  const kegiatanIds = kegiatan.map((item) => item.id);

  const { data: presensi, error: presensiError } = await supabase
    .from("presensi")
    .select("kegiatan_id")
    .in("kegiatan_id", kegiatanIds);

  if (presensiError) {
    return {
      data: [] as KegiatanPresensi[],
      error: presensiError.message,
    };
  }

  const countMap = new Map<number, number>();

  for (const item of presensi ?? []) {
    countMap.set(item.kegiatan_id, (countMap.get(item.kegiatan_id) ?? 0) + 1);
  }

  return {
    data: kegiatan.map((item) => ({
      ...item,
      totalPresensi: countMap.get(item.id) ?? 0,
    })),
  };
}

export async function getPresensiTerbaru() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("presensi")
    .select(
      `
      id,
      waktu_checkin,
      kegiatan:kegiatan_id (
        nama,
        lokasi
      ),
      mudamudi:mudamudi_id (
        nama
      )
    `,
    )
    .order("waktu_checkin", {
      ascending: false,
    })
    .limit(10);

  if (error) {
    return {
      data: [] as PresensiTerbaru[],
      error: error.message,
    };
  }

  return {
    data: (data ?? []).map((item) => {
      const kegiatan = Array.isArray(item.kegiatan)
        ? item.kegiatan[0]
        : item.kegiatan;

      const mudamudi = Array.isArray(item.mudamudi)
        ? item.mudamudi[0]
        : item.mudamudi;

      return {
        id: item.id,
        namaPeserta: mudamudi?.nama ?? "-",
        namaKegiatan: kegiatan?.nama ?? "-",
        waktuCheckin: item.waktu_checkin,
        lokasi: kegiatan?.lokasi ?? "",
      };
    }),
  };
}
