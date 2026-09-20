"use server";

import { createClient } from "../supabase/server";

import { PresensiMetode, PresensiStatus, RekapitulasiPresensi } from "./types";

export async function getRekapitulasiPresensi() {
  const supabase = await createClient();

  const [mudamudiResult, kegiatanResult, presensiResult] = await Promise.all([
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
      .from("kegiatan")
      .select(
        `
          id,
          nama,
          tanggal_mulai,
          tanggal_selesai,
          lokasi
          `,
      )
      .order("tanggal_mulai", {
        ascending: true,
      }),

    supabase
      .from("presensi")
      .select(
        `
          kegiatan_id,
          mudamudi_id,
          status,
          metode,
          waktu_checkin,
          keterangan
          `,
      )
      .order("waktu_checkin", {
        ascending: false,
        nullsFirst: false,
      }),
  ]);

  if (mudamudiResult.error) {
    console.error("Gagal mengambil data muda-mudi:", mudamudiResult.error);

    return {
      data: {
        mudamudi: [],
        kegiatan: [],
        kehadiran: [],
      } as RekapitulasiPresensi,

      error: "Gagal mengambil data muda-mudi",
    };
  }

  if (kegiatanResult.error) {
    console.error("Gagal mengambil data kegiatan:", kegiatanResult.error);

    return {
      data: {
        mudamudi: [],
        kegiatan: [],
        kehadiran: [],
      } as RekapitulasiPresensi,

      error: "Gagal mengambil data kegiatan",
    };
  }

  if (presensiResult.error) {
    console.error("Gagal mengambil data presensi:", presensiResult.error);

    return {
      data: {
        mudamudi: [],
        kegiatan: [],
        kehadiran: [],
      } as RekapitulasiPresensi,

      error: "Gagal mengambil data presensi",
    };
  }

  const result: RekapitulasiPresensi = {
    mudamudi: (mudamudiResult.data ?? []).map((item) => ({
      id: item.id,
      nama: item.nama,
      desa: item.desa,
      kelompok: item.kelompok,
      kelas: item.kelas,
      jenis_kelamin: item.jenis_kelamin,
    })),

    kegiatan: (kegiatanResult.data ?? []).map((item) => ({
      id: item.id,
      nama: item.nama,
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai,
      lokasi: item.lokasi,
    })),

    kehadiran: (presensiResult.data ?? []).map((item) => ({
      kegiatan_id: item.kegiatan_id,
      mudamudi_id: item.mudamudi_id,
      status: item.status as PresensiStatus,
      metode: item.metode as PresensiMetode,
      waktu_checkin: item.waktu_checkin,
      keterangan: item.keterangan,
    })),
  };

  return {
    data: result,
  };
}
