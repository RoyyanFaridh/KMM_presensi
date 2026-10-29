"use server";

import { createAdminClient } from "../supabase/admin";
import { requireAdmin } from "../auth/admin";
import { isKegiatanAktif, buildDateTime } from "./helpers";
import { isMudamudiTargeted } from "./target";
import type { PresensiStatus, PresensiMetode } from "./types";

const HADIR_TOLERANCE_MINUTES = 10;
const MUDA_MUDI_QR_PREFIX = "SIKEMA:MUDA_MUDI:";

type Kegiatan = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  desa: string[] | null;
  kelompok: string[] | null;
  kelas: string[] | null;
  jenis_kelamin: string | null;
};

type Mudamudi = {
  id: number;
  nama: string;
  desa: string;
  kelompok: string;
  kelas: string;
  jenis_kelamin: string | null;
  tahun_lahir: number | null;
};

export type ScanMudamudiQRResult =
  | {
      success: true;
      type: "success";
      message: string;
      presensiId: number;
      waktuCheckin: string;
      status: PresensiStatus;
      metode: PresensiMetode;
      kegiatan: Kegiatan;
      mudamudi: Mudamudi;
    }
  | {
      success: false;
      type:
        | "invalid_qr"
        | "mudamudi_not_found"
        | "kegiatan_not_found"
        | "kegiatan_inactive"
        | "not_target"
        | "already_present"
        | "not_authorized"
        | "database_error";
      message: string;
      mudamudi?: Mudamudi;
      kegiatan?: Kegiatan;
    };

function parseMudamudiQR(qrText: string): string | null {
  const value = qrText.trim();

  if (!value.startsWith(MUDA_MUDI_QR_PREFIX)) {
    return null;
  }

  const qrId = value.slice(MUDA_MUDI_QR_PREFIX.length).trim();

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(qrId)) {
    return null;
  }

  return qrId;
}

function determinePresensiStatus(
  tanggalMulai: string,
  jamMulai: string,
  waktuCheckin: Date,
): PresensiStatus {
  const waktuMulai = buildDateTime(tanggalMulai, jamMulai);

  const batasHadir = new Date(
    waktuMulai.getTime() + HADIR_TOLERANCE_MINUTES * 60 * 1000,
  );

  return waktuCheckin.getTime() <= batasHadir.getTime() ? "hadir" : "terlambat";
}

function canAccessKegiatan(
  kegiatan: Kegiatan,
  desaAdmin: string | null,
  isSuperAdmin: boolean,
): boolean {
  if (isSuperAdmin) {
    return true;
  }

  if (!desaAdmin || !Array.isArray(kegiatan.desa)) {
    return false;
  }

  return (
    kegiatan.desa.length > 0 &&
    kegiatan.desa.every(
      (desa) => typeof desa === "string" && desa === desaAdmin,
    )
  );
}

function canAccessMudamudi(
  mudamudi: Pick<Mudamudi, "desa">,
  desaAdmin: string | null,
  isSuperAdmin: boolean,
): boolean {
  return isSuperAdmin || (!!desaAdmin && mudamudi.desa === desaAdmin);
}

async function getKegiatanByIdInternal(
  kegiatanId: number,
): Promise<Kegiatan | null> {
  if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
    return null;
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("kegiatan")
    .select(
      `
        id,
        nama,
        tanggal_mulai,
        tanggal_selesai,
        jam_mulai,
        jam_selesai,
        lokasi,
        desa,
        kelompok,
        kelas,
        jenis_kelamin
      `,
    )
    .eq("id", kegiatanId)
    .maybeSingle();

  if (error) {
    console.error("[getKegiatanByIdInternal] Database error:", error);
    return null;
  }

  return data as Kegiatan | null;
}

export async function getKegiatanById(
  kegiatanId: number,
): Promise<Kegiatan | null> {
  const { profile, isSuperAdmin } = await requireAdmin();

  const kegiatan = await getKegiatanByIdInternal(kegiatanId);

  if (!kegiatan) {
    return null;
  }

  if (!canAccessKegiatan(kegiatan, profile.desa, isSuperAdmin)) {
    return null;
  }

  return kegiatan;
}

export async function scanMudamudiQR(
  qrText: string,
  kegiatanId: number,
): Promise<ScanMudamudiQRResult> {
  const { profile, isSuperAdmin } = await requireAdmin();

  if (typeof qrText !== "string" || !qrText.trim()) {
    return {
      success: false,
      type: "invalid_qr",
      message: "QR Code tidak terbaca.",
    };
  }

  if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
    return {
      success: false,
      type: "kegiatan_not_found",
      message: "Kegiatan tidak valid.",
    };
  }

  const qrId = parseMudamudiQR(qrText);

  if (!qrId) {
    return {
      success: false,
      type: "invalid_qr",
      message: "QR Code bukan QR Muda-Mudi SIKEMA.",
    };
  }

  const supabase = createAdminClient();

  const { data: kegiatanData, error: kegiatanError } = await supabase
    .from("kegiatan")
    .select(
      `
        id,
        nama,
        tanggal_mulai,
        tanggal_selesai,
        jam_mulai,
        jam_selesai,
        lokasi,
        desa,
        kelompok,
        kelas,
        jenis_kelamin
      `,
    )
    .eq("id", kegiatanId)
    .maybeSingle();

  if (kegiatanError) {
    console.error("[scanMudamudiQR] Kegiatan lookup error:", kegiatanError);

    return {
      success: false,
      type: "database_error",
      message: "Terjadi kesalahan saat mencari kegiatan.",
    };
  }

  if (!kegiatanData) {
    return {
      success: false,
      type: "kegiatan_not_found",
      message: "Kegiatan tidak ditemukan.",
    };
  }

  const kegiatan = kegiatanData as Kegiatan;

  if (!canAccessKegiatan(kegiatan, profile.desa, isSuperAdmin)) {
    return {
      success: false,
      type: "not_authorized",
      message: "Kamu tidak memiliki akses untuk presensi kegiatan ini.",
    };
  }

  const { data: mudamudiData, error: mudamudiError } = await supabase
    .from("mudamudi")
    .select(
      `
        id,
        nama,
        desa,
        kelompok,
        kelas,
        jenis_kelamin,
        tahun_lahir
      `,
    )
    .eq("qr_id", qrId)
    .maybeSingle();

  if (mudamudiError) {
    console.error("[scanMudamudiQR] Mudamudi lookup error:", mudamudiError);

    return {
      success: false,
      type: "database_error",
      message: "Terjadi kesalahan saat mencari data Muda-Mudi.",
    };
  }

  if (!mudamudiData) {
    return {
      success: false,
      type: "mudamudi_not_found",
      message: "QR Code tidak terdaftar pada data Muda-Mudi.",
    };
  }

  const mudamudi = mudamudiData as Mudamudi;

  if (!canAccessMudamudi(mudamudi, profile.desa, isSuperAdmin)) {
    return {
      success: false,
      type: "not_authorized",
      message: "Kamu tidak memiliki akses untuk memproses peserta ini.",
    };
  }

  if (
    !isKegiatanAktif(
      kegiatan.tanggal_mulai,
      kegiatan.tanggal_selesai,
      kegiatan.jam_mulai,
      kegiatan.jam_selesai,
    )
  ) {
    return {
      success: false,
      type: "kegiatan_inactive",
      message: "Kegiatan belum dimulai atau sudah selesai.",
      kegiatan,
      mudamudi,
    };
  }

  if (!isMudamudiTargeted(kegiatan, mudamudi)) {
    return {
      success: false,
      type: "not_target",
      message: "Muda-Mudi tidak termasuk sasaran kegiatan.",
      kegiatan,
      mudamudi,
    };
  }

  const { data: existingPresensi, error: existingError } = await supabase
    .from("presensi")
    .select("id")
    .eq("kegiatan_id", kegiatanId)
    .eq("mudamudi_id", mudamudi.id)
    .maybeSingle();

  if (existingError) {
    console.error(
      "[scanMudamudiQR] Existing presensi lookup error:",
      existingError,
    );

    return {
      success: false,
      type: "database_error",
      message: "Terjadi kesalahan saat mengecek presensi.",
      kegiatan,
      mudamudi,
    };
  }

  if (existingPresensi) {
    return {
      success: false,
      type: "already_present",
      message: `${mudamudi.nama} sudah melakukan presensi.`,
      kegiatan,
      mudamudi,
    };
  }

  const waktuCheckin = new Date();

  const status = determinePresensiStatus(
    kegiatan.tanggal_mulai,
    kegiatan.jam_mulai,
    waktuCheckin,
  );

  const { data: presensiData, error: presensiError } = await supabase
    .from("presensi")
    .insert({
      kegiatan_id: kegiatanId,
      mudamudi_id: mudamudi.id,
      waktu_checkin: waktuCheckin.toISOString(),
      status,
      metode: "qr",
      keterangan: null,
    })
    .select("id")
    .single();

  if (presensiError) {
    if (presensiError.code === "23505") {
      return {
        success: false,
        type: "already_present",
        message: `${mudamudi.nama} sudah melakukan presensi.`,
        kegiatan,
        mudamudi,
      };
    }

    console.error("[scanMudamudiQR] Insert presensi error:", presensiError);

    return {
      success: false,
      type: "database_error",
      message: "Presensi gagal disimpan. Silakan coba lagi.",
      kegiatan,
      mudamudi,
    };
  }

  return {
    success: true,
    type: "success",
    message:
      status === "hadir"
        ? `${mudamudi.nama} berhasil melakukan presensi.`
        : `${mudamudi.nama} berhasil melakukan presensi terlambat.`,
    presensiId: presensiData.id,
    waktuCheckin: waktuCheckin.toISOString(),
    status,
    metode: "qr",
    kegiatan,
    mudamudi,
  };
}
