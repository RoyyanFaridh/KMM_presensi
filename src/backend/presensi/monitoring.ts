"use server";

import { createClient } from "../supabase/server";

import {
  MonitoringPeserta,
  MonitoringPresensi,
  PresensiMetode,
  PresensiStatus,
} from "./types";

export async function getMonitoringPresensi(kegiatanId: number) {
  const supabase = await createClient();

  if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
    return {
      data: null as MonitoringPresensi | null,
      error: "Kegiatan tidak valid",
    };
  }

  const { data: kegiatan, error: kegiatanError } = await supabase
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
    .eq("id", kegiatanId)
    .maybeSingle();

  if (kegiatanError) {
    console.error("Gagal mengambil kegiatan:", kegiatanError);

    return {
      data: null as MonitoringPresensi | null,
      error: "Gagal mengambil data kegiatan",
    };
  }

  if (!kegiatan) {
    return {
      data: null as MonitoringPresensi | null,
      error: "Kegiatan tidak ditemukan",
    };
  }

  const [mudamudiResult, presensiResult] = await Promise.all([
    supabase
      .from("mudamudi")
      .select(
        `
          id,
          nama,
          desa,
          kelompok,
          kelas,
          jenis_kelamin
        `,
      )
      .order("nama", {
        ascending: true,
      }),

    supabase
      .from("presensi")
      .select(
        `
          id,
          mudamudi_id,
          waktu_checkin,
          status,
          metode,
          keterangan
        `,
      )
      .eq("kegiatan_id", kegiatanId)
      .order("waktu_checkin", {
        ascending: true,
        nullsFirst: false,
      }),
  ]);

  if (mudamudiResult.error) {
    console.error("Gagal mengambil Muda-Mudi:", mudamudiResult.error);

    return {
      data: null as MonitoringPresensi | null,
      error: "Gagal mengambil data Muda-Mudi",
    };
  }

  if (presensiResult.error) {
    console.error("Gagal mengambil presensi:", presensiResult.error);

    return {
      data: null as MonitoringPresensi | null,
      error: "Gagal mengambil data presensi",
    };
  }

  const presensiMap = new Map<
    number,
    {
      presensi_id: number;
      waktu_checkin: string | null;
      status: PresensiStatus;
      metode: PresensiMetode;
      keterangan: string | null;
    }
  >();

  for (const item of presensiResult.data ?? []) {
    presensiMap.set(item.mudamudi_id, {
      presensi_id: item.id,
      waktu_checkin: item.waktu_checkin,
      status: item.status as PresensiStatus,
      metode: item.metode as PresensiMetode,
      keterangan: item.keterangan,
    });
  }

  const peserta: MonitoringPeserta[] = (
    mudamudiResult.data ?? []
  ).map((item) => {
    const presensi = presensiMap.get(item.id);

    if (!presensi) {
      return {
        presensi_id: null,
        mudamudi_id: item.id,
        nama: item.nama,
        desa: item.desa,
        kelompok: item.kelompok,
        kelas: item.kelas,
        jenis_kelamin: item.jenis_kelamin,
        waktu_checkin: null,
        status: null,
        metode: null,
        keterangan: null,
      };
    }

    return {
      presensi_id: presensi.presensi_id,
      mudamudi_id: item.id,
      nama: item.nama,
      desa: item.desa,
      kelompok: item.kelompok,
      kelas: item.kelas,
      jenis_kelamin: item.jenis_kelamin,
      waktu_checkin: presensi.waktu_checkin,
      status: presensi.status,
      metode: presensi.metode,
      keterangan: presensi.keterangan,
    };
  });

  const totalPeserta = peserta.length;

  const totalHadir = peserta.filter(
    (item) => item.status === "hadir",
  ).length;

  const totalTerlambat = peserta.filter(
    (item) => item.status === "terlambat",
  ).length;

  const totalIzin = peserta.filter(
    (item) => item.status === "izin",
  ).length;

  const totalSakit = peserta.filter(
    (item) => item.status === "sakit",
  ).length;

  const totalAlpa = peserta.filter(
    (item) => item.status === "alpa",
  ).length;

  const totalBelumHadir = peserta.filter(
    (item) => item.status === null,
  ).length;

  return {
    data: {
      kegiatan,
      totalPeserta,
      totalHadir,
      totalTerlambat,
      totalIzin,
      totalSakit,
      totalAlpa,
      totalBelumHadir,
      peserta,
    } satisfies MonitoringPresensi,
  };
}