"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";

import { isMudamudiTargeted } from "./target";

import { PresensiStatus } from "./types";

type UpdatePresensiStatusInput = {
  presensiId: number | null;
  kegiatanId: number;
  mudamudiId: number;
  status: PresensiStatus;
  keterangan?: string | null;
};

const VALID_STATUSES: PresensiStatus[] = [
  "hadir",
  "terlambat",
  "izin",
  "sakit",
  "alpa",
];

function getWaktuCheckin(status: PresensiStatus) {
  if (status === "izin" || status === "sakit" || status === "alpa") {
    return null;
  }

  return new Date().toISOString();
}

function normalizeKeterangan(keterangan?: string | null) {
  const value = keterangan?.trim() || null;

  return value ? value.slice(0, 500) : null;
}

async function validateTarget(
  supabase: Awaited<ReturnType<typeof createClient>>,
  kegiatanId: number,
  mudamudiId: number,
) {
  const { data: kegiatan, error: kegiatanError } = await supabase
    .from("kegiatan")
    .select(
      `
          id,
          desa,
          kelas,
          jenis_kelamin
        `,
    )
    .eq("id", kegiatanId)
    .maybeSingle();

  if (kegiatanError) {
    console.error("Gagal mengambil sasaran kegiatan:", kegiatanError);

    return {
      valid: false,
      error: "Gagal memeriksa sasaran kegiatan.",
    };
  }

  if (!kegiatan) {
    return {
      valid: false,
      error: "Kegiatan tidak ditemukan.",
    };
  }

  const { data: mudamudi, error: mudamudiError } = await supabase
    .from("mudamudi")
    .select(
      `
          id,
          desa,
          kelas,
          jenis_kelamin
        `,
    )
    .eq("id", mudamudiId)
    .maybeSingle();

  if (mudamudiError) {
    console.error("Gagal mengambil data Muda-Mudi:", mudamudiError);

    return {
      valid: false,
      error: "Gagal memeriksa data Muda-Mudi.",
    };
  }

  if (!mudamudi) {
    return {
      valid: false,
      error: "Muda-Mudi tidak ditemukan.",
    };
  }

  if (!isMudamudiTargeted(kegiatan, mudamudi)) {
    return {
      valid: false,
      error: "Muda-Mudi tidak termasuk sasaran kegiatan.",
    };
  }

  return {
    valid: true,
  };
}

export async function updatePresensiStatus(input: UpdatePresensiStatusInput) {
  await requireAdmin();

  const supabase = await createClient();

  if (
    input.presensiId !== null &&
    (!Number.isInteger(input.presensiId) || input.presensiId <= 0)
  ) {
    return {
      success: false,
      error: "Presensi tidak valid.",
    };
  }

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

  if (!VALID_STATUSES.includes(input.status)) {
    return {
      success: false,
      error: "Status presensi tidak valid.",
    };
  }

  const targetValidation = await validateTarget(
    supabase,
    input.kegiatanId,
    input.mudamudiId,
  );

  if (!targetValidation.valid) {
    return {
      success: false,
      error: targetValidation.error,
    };
  }

  const keterangan = normalizeKeterangan(input.keterangan);

  /*
   * ============================================
   * 1. PRESENSI SUDAH ADA
   * ============================================
   */

  if (input.presensiId !== null) {
    const { data: existingPresensi, error: checkError } = await supabase
      .from("presensi")
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
      .eq("id", input.presensiId)
      .maybeSingle();

    if (checkError) {
      console.error("Gagal memeriksa presensi:", checkError);

      return {
        success: false,
        error: "Gagal memeriksa data presensi.",
      };
    }

    if (!existingPresensi) {
      return {
        success: false,
        error: "Data presensi tidak ditemukan.",
      };
    }

    if (
      existingPresensi.kegiatan_id !== input.kegiatanId ||
      existingPresensi.mudamudi_id !== input.mudamudiId
    ) {
      return {
        success: false,
        error: "Data presensi tidak sesuai dengan peserta atau kegiatan.",
      };
    }

    const { data: updatedPresensi, error: updateError } = await supabase
      .from("presensi")
      .update({
        status: input.status,
        keterangan,
      })
      .eq("id", input.presensiId)
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

    if (updateError) {
      console.error("Gagal memperbarui presensi:", updateError);

      return {
        success: false,
        error: "Status dan keterangan gagal diperbarui.",
      };
    }

    return {
      success: true,

      data: {
        presensiId: updatedPresensi.id,
        kegiatanId: updatedPresensi.kegiatan_id,
        mudamudiId: updatedPresensi.mudamudi_id,
        waktuCheckin: updatedPresensi.waktu_checkin,
        status: updatedPresensi.status as PresensiStatus,
        metode: updatedPresensi.metode,
        keterangan: updatedPresensi.keterangan,
      },
    };
  }

  /*
   * ============================================
   * 2. BELUM ADA PRESENSI
   * ============================================
   */

  const { data: existingByParticipant, error: existingError } = await supabase
    .from("presensi")
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
    .eq("kegiatan_id", input.kegiatanId)
    .eq("mudamudi_id", input.mudamudiId)
    .maybeSingle();

  if (existingError) {
    console.error("Gagal memeriksa presensi peserta:", existingError);

    return {
      success: false,
      error: "Gagal memeriksa data presensi peserta.",
    };
  }

  /*
   * Jika ternyata presensi sudah dibuat oleh proses lain,
   * update record tersebut.
   */

  if (existingByParticipant) {
    const { data: updatedPresensi, error: updateError } = await supabase
      .from("presensi")
      .update({
        status: input.status,
        keterangan,
      })
      .eq("id", existingByParticipant.id)
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

    if (updateError) {
      console.error("Gagal memperbarui presensi peserta:", updateError);

      return {
        success: false,
        error: "Status dan keterangan gagal diperbarui.",
      };
    }

    return {
      success: true,

      data: {
        presensiId: updatedPresensi.id,
        kegiatanId: updatedPresensi.kegiatan_id,
        mudamudiId: updatedPresensi.mudamudi_id,
        waktuCheckin: updatedPresensi.waktu_checkin,
        status: updatedPresensi.status as PresensiStatus,
        metode: updatedPresensi.metode,
        keterangan: updatedPresensi.keterangan,
      },
    };
  }

  const waktuCheckin = getWaktuCheckin(input.status);

  const { data: newPresensi, error: insertError } = await supabase
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
    console.error("Gagal membuat presensi manual:", insertError);

    if (insertError.code === "23505") {
      return {
        success: false,
        error: "Peserta sudah memiliki presensi pada kegiatan ini.",
      };
    }

    return {
      success: false,
      error: "Presensi manual gagal dibuat.",
    };
  }

  return {
    success: true,

    data: {
      presensiId: newPresensi.id,
      kegiatanId: newPresensi.kegiatan_id,
      mudamudiId: newPresensi.mudamudi_id,
      waktuCheckin: newPresensi.waktu_checkin,
      status: newPresensi.status as PresensiStatus,
      metode: newPresensi.metode,
      keterangan: newPresensi.keterangan,
    },
  };
}
