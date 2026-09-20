"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";

import { PresensiStatus } from "./types";

type ManualPresensiInput = {
  kegiatanId: number;
  mudamudiId: number;
  status: PresensiStatus;
  keterangan?: string | null;
};

export async function createManualPresensi(input: ManualPresensiInput) {
  await requireAdmin();

  const supabase = await createClient();

  if (!Number.isInteger(input.kegiatanId) || input.kegiatanId <= 0) {
    return {
      success: false,
      error: "Kegiatan tidak valid.",
    };
  }

  if (!Number.isInteger(input.mudamudiId) || input.mudamudiId <= 0) {
    return {
      success: false,
      error: "Muda-Mudi tidak valid.",
    };
  }

  const validStatuses: PresensiStatus[] = [
    "hadir",
    "terlambat",
    "izin",
    "sakit",
    "alpa",
  ];

  if (!validStatuses.includes(input.status)) {
    return {
      success: false,
      error: "Status presensi tidak valid.",
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
    .eq("id", input.kegiatanId)
    .maybeSingle();

  if (kegiatanError) {
    console.error("Gagal mengambil kegiatan:", kegiatanError);

    return {
      success: false,
      error: "Gagal mengambil data kegiatan.",
    };
  }

  if (!kegiatan) {
    return {
      success: false,
      error: "Kegiatan tidak ditemukan.",
    };
  }

  const { data: mudamudi, error: mudamudiError } = await supabase
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
    .eq("id", input.mudamudiId)
    .maybeSingle();

  if (mudamudiError) {
    console.error("Gagal mengambil data Muda-Mudi:", mudamudiError);

    return {
      success: false,
      error: "Gagal mengambil data Muda-Mudi.",
    };
  }

  if (!mudamudi) {
    return {
      success: false,
      error: "Muda-Mudi tidak ditemukan.",
    };
  }

  const { data: existingPresensi, error: presensiCheckError } = await supabase
    .from("presensi")
    .select(
      `
          id,
          status,
          metode
        `,
    )
    .eq("kegiatan_id", input.kegiatanId)
    .eq("mudamudi_id", input.mudamudiId)
    .maybeSingle();

  if (presensiCheckError) {
    console.error("Gagal memeriksa presensi:", presensiCheckError);

    return {
      success: false,
      error: "Gagal memeriksa status presensi.",
    };
  }

  if (existingPresensi) {
    return {
      success: false,
      alreadyPresent: true,
      error: "Muda-Mudi tersebut sudah memiliki presensi pada kegiatan ini.",
    };
  }

  const waktuCheckin =
    input.status === "izin" ||
    input.status === "sakit" ||
    input.status === "alpa"
      ? null
      : new Date().toISOString();

  const keterangan = input.keterangan?.trim() || null;

  const { data: presensi, error: insertError } = await supabase
    .from("presensi")
    .insert({
      kegiatan_id: input.kegiatanId,
      mudamudi_id: input.mudamudiId,
      waktu_checkin: waktuCheckin,
      status: input.status,
      metode: "manual",
      keterangan,
    })
    .select(
      `
        id,
        kegiatan_id,
        mudamudi_id,
        waktu_checkin,
        status,
        metode,
        keterangan
      `,
    )
    .single();

  if (insertError) {
    console.error("Gagal menyimpan presensi manual:", insertError);

    if (insertError.code === "23505") {
      return {
        success: false,
        alreadyPresent: true,
        error: "Muda-Mudi tersebut sudah memiliki presensi pada kegiatan ini.",
      };
    }

    return {
      success: false,
      error: "Presensi manual gagal disimpan.",
    };
  }

  return {
    success: true,

    data: {
      presensiId: presensi.id,

      kegiatanId: presensi.kegiatan_id,

      mudamudiId: presensi.mudamudi_id,

      waktuCheckin: presensi.waktu_checkin,

      status: presensi.status as PresensiStatus,

      metode: "manual" as const,

      keterangan: presensi.keterangan,

      kegiatan: {
        id: kegiatan.id,
        nama: kegiatan.nama,
        tanggalMulai: kegiatan.tanggal_mulai,
        tanggalSelesai: kegiatan.tanggal_selesai,
        jamMulai: kegiatan.jam_mulai,
        jamSelesai: kegiatan.jam_selesai,
        lokasi: kegiatan.lokasi,
      },

      mudamudi: {
        id: mudamudi.id,
        nama: mudamudi.nama,
        desa: mudamudi.desa,
        kelompok: mudamudi.kelompok,
        kelas: mudamudi.kelas,
        jenisKelamin: mudamudi.jenis_kelamin,
      },
    },
  };
}
