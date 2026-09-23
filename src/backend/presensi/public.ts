"use server";

import { createAdminClient } from "../supabase/admin";
import { isKegiatanAktif, buildDateTime } from "./helpers";

import {
  createDeviceToken as createDeviceTokenLegacy,
  getDeviceByToken,
  updateDeviceLastUsed,
} from "./device";

import type { PresensiStatus, PresensiMetode } from "./types";

const HADIR_TOLERANCE_MINUTES = 10;

const MUDA_MUDI_QR_PREFIX = "SIKEMA:MUDA_MUDI:";

type Identity = {
  nama: string;
  tanggalLahir: string;
};

type Kegiatan = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
};

type Mudamudi = {
  id: number;
  nama: string;
  desa: string;
  kelompok: string;
  kelas: string;
  jenis_kelamin: string | null;
  tanggal_lahir: string | null;
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
        | "already_present"
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

  if (!qrId) {
    return null;
  }

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

export async function getKegiatanById(
  kegiatanId: number,
): Promise<Kegiatan | null> {
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
        lokasi
      `,
    )
    .eq("id", kegiatanId)
    .maybeSingle();

  if (error) {
    console.error("[getKegiatanById] Database error:", error);
    return null;
  }

  return data as Kegiatan | null;
}

/*
 * ============================================
 * NEW QR MUDAMUDI FLOW
 * ============================================
 */

export async function scanMudamudiQR(
  qrText: string,
  kegiatanId: number,
): Promise<ScanMudamudiQRResult> {
  if (!qrText?.trim()) {
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
        tanggal_lahir
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
        lokasi
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
      mudamudi,
    };
  }

  if (!kegiatanData) {
    return {
      success: false,
      type: "kegiatan_not_found",
      message: "Kegiatan tidak ditemukan.",
      mudamudi,
    };
  }

  const kegiatan = kegiatanData as Kegiatan;

  const kegiatanAktif = isKegiatanAktif(
    kegiatan.tanggal_mulai,
    kegiatan.tanggal_selesai,
    kegiatan.jam_mulai,
    kegiatan.jam_selesai,
  );

  if (!kegiatanAktif) {
    return {
      success: false,
      type: "kegiatan_inactive",
      message: "Kegiatan belum dimulai atau sudah selesai.",
      kegiatan,
      mudamudi,
    };
  }

  const { data: existingPresensi, error: existingError } = await supabase
    .from("presensi")
    .select("id, status, waktu_checkin")
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

/*
 * ============================================
 * LEGACY DEVICE FLOW
 * ============================================
 *
 * Fungsi-fungsi di bawah ini sementara
 * dipertahankan agar file lain yang masih
 * menggunakan alur lama tidak langsung error.
 */

export async function getDeviceStatus(deviceToken: string | null) {
  if (!deviceToken?.trim()) {
    return {
      registered: false,
      mudamudi: null,
    };
  }

  const device = await getDeviceByToken(deviceToken);

  if (device.error || !device.data) {
    return {
      registered: false,
      mudamudi: null,
    };
  }

  const supabase = createAdminClient();

  const { data: mudamudi, error } = await supabase
    .from("mudamudi")
    .select("id, nama")
    .eq("id", device.data.mudamudiId)
    .maybeSingle();

  if (error || !mudamudi) {
    return {
      registered: false,
      mudamudi: null,
    };
  }

  return {
    registered: true,
    mudamudi: {
      id: mudamudi.id,
      nama: mudamudi.nama,
    },
  };
}

export async function verifyIdentity(identity: Identity) {
  const supabase = createAdminClient();

  const nama = identity.nama.trim();

  if (!nama || !identity.tanggalLahir) {
    return {
      success: false,
      mudamudi: null,
      message: "Nama dan tanggal lahir wajib diisi.",
    };
  }

  const { data, error } = await supabase
    .from("mudamudi")
    .select(
      `
        id,
        nama,
        desa,
        kelompok,
        kelas,
        jenis_kelamin,
        tanggal_lahir
      `,
    )
    .ilike("nama", nama)
    .eq("tanggal_lahir", identity.tanggalLahir)
    .maybeSingle();

  if (error) {
    console.error("[verifyIdentity] Database error:", error);

    return {
      success: false,
      mudamudi: null,
      message: "Terjadi kesalahan saat memverifikasi identitas.",
    };
  }

  if (!data) {
    return {
      success: false,
      mudamudi: null,
      message: "Data Muda-Mudi tidak ditemukan.",
    };
  }

  return {
    success: true,
    mudamudi: data,
    message: "Identitas berhasil diverifikasi.",
  };
}

export async function registerDevice(mudamudiId: number) {
  const result = await createDeviceTokenLegacy(mudamudiId);

  if (!result.success) {
    return {
      success: false,
      deviceToken: null,
      mudamudi: null,
      message: result.error,
    };
  }

  return {
    success: true,
    deviceToken: result.deviceToken,
    mudamudi: result.mudamudi,
    message: "Device berhasil didaftarkan.",
  };
}

export async function changeDeviceAccount(
  deviceToken: string,
  mudamudiId: number,
) {
  const supabase = createAdminClient();

  const token = deviceToken.trim();

  if (!token) {
    return {
      success: false,
      mudamudi: null,
      message: "Device token tidak valid.",
    };
  }

  if (!Number.isInteger(mudamudiId) || mudamudiId <= 0) {
    return {
      success: false,
      mudamudi: null,
      message: "Data Muda-Mudi tidak valid.",
    };
  }

  const { data: mudamudi, error: mudamudiError } = await supabase
    .from("mudamudi")
    .select("id, nama")
    .eq("id", mudamudiId)
    .maybeSingle();

  if (mudamudiError || !mudamudi) {
    return {
      success: false,
      mudamudi: null,
      message: "Data Muda-Mudi tidak ditemukan.",
    };
  }

  const { data: device, error: deviceError } = await supabase
    .from("presensi_device")
    .select("id")
    .eq("device_token", token)
    .maybeSingle();

  if (deviceError) {
    console.error("[changeDeviceAccount] Device lookup error:", deviceError);

    return {
      success: false,
      mudamudi: null,
      message: "Gagal memeriksa perangkat.",
    };
  }

  if (!device) {
    return {
      success: false,
      mudamudi: null,
      message: "Perangkat belum terdaftar.",
    };
  }

  const { error: updateError } = await supabase
    .from("presensi_device")
    .update({
      mudamudi_id: mudamudi.id,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", device.id);

  if (updateError) {
    console.error("[changeDeviceAccount] Update error:", updateError);

    return {
      success: false,
      mudamudi: null,
      message: "Akun device gagal diperbarui.",
    };
  }

  return {
    success: true,
    mudamudi,
    message: "Akun device berhasil diperbarui.",
  };
}

export async function submitPresensi(
  deviceToken: string | null,
  kegiatanId: number,
  identity?: Identity,
) {
  const supabase = createAdminClient();

  const kegiatan = await getKegiatanById(kegiatanId);

  if (!kegiatan) {
    return {
      success: false,
      message: "Kegiatan tidak ditemukan.",
    };
  }

  const kegiatanAktif = isKegiatanAktif(
    kegiatan.tanggal_mulai,
    kegiatan.tanggal_selesai,
    kegiatan.jam_mulai,
    kegiatan.jam_selesai,
  );

  if (!kegiatanAktif) {
    return {
      success: false,
      message: "Kegiatan belum dimulai atau sudah selesai.",
    };
  }

  let mudamudi: Mudamudi | null = null;

  if (deviceToken?.trim()) {
    const device = await getDeviceByToken(deviceToken);

    if (!device.error && device.data) {
      const { data: deviceMudamudi, error: mudamudiError } = await supabase
        .from("mudamudi")
        .select(
          `
            id,
            nama,
            desa,
            kelompok,
            kelas,
            jenis_kelamin,
            tanggal_lahir
          `,
        )
        .eq("id", device.data.mudamudiId)
        .maybeSingle();

      if (!mudamudiError && deviceMudamudi) {
        mudamudi = deviceMudamudi as Mudamudi;
      }
    }
  }

  if (!mudamudi && identity) {
    const identityResult = await verifyIdentity(identity);

    if (identityResult.success && identityResult.mudamudi) {
      mudamudi = identityResult.mudamudi as Mudamudi;
    }
  }

  if (!mudamudi) {
    return {
      success: false,
      message: "Data Muda-Mudi tidak dapat ditemukan.",
    };
  }

  const { data: existing } = await supabase
    .from("presensi")
    .select("id")
    .eq("kegiatan_id", kegiatanId)
    .eq("mudamudi_id", mudamudi.id)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      message: "Muda-Mudi sudah melakukan presensi.",
    };
  }

  const waktuCheckin = new Date();

  const status = determinePresensiStatus(
    kegiatan.tanggal_mulai,
    kegiatan.jam_mulai,
    waktuCheckin,
  );

  const { data, error } = await supabase
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

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        message: "Muda-Mudi sudah melakukan presensi.",
      };
    }

    console.error("[submitPresensi] Database error:", error);

    return {
      success: false,
      message: "Presensi gagal disimpan.",
    };
  }

  if (deviceToken?.trim()) {
    try {
      await updateDeviceLastUsed(deviceToken);
    } catch (error) {
      console.error("[submitPresensi] Failed to update device:", error);
    }
  }

  return {
    success: true,
    presensiId: data.id,
    waktuCheckin: waktuCheckin.toISOString(),
    status,
    metode: "qr",
    keterangan: null,
    deviceToken,
    kegiatan,
    mudamudi,
  };
}
