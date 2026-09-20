"use server";

import { createAdminClient } from "../supabase/admin";

import type { DeviceCheckResult } from "./types";

export async function getDeviceByToken(deviceToken: string) {
  const supabase = createAdminClient();

  const token = deviceToken.trim();

  if (!token) {
    return {
      data: null,
      error: "Device token tidak valid.",
    };
  }

  const { data, error } = await supabase
    .from("presensi_device")
    .select("id, mudamudi_id, device_token, last_used_at")
    .eq("device_token", token)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: "Gagal memeriksa perangkat.",
    };
  }

  if (!data) {
    return {
      data: null,
    };
  }

  return {
    data: {
      id: data.id,
      mudamudiId: data.mudamudi_id,
      deviceToken: data.device_token,
      lastUsedAt: data.last_used_at,
    },
  };
}

export async function checkDevice(
  deviceToken: string | null,
): Promise<DeviceCheckResult> {
  if (!deviceToken?.trim()) {
    return {
      status: "unknown",
    };
  }

  const deviceResult = await getDeviceByToken(deviceToken);

  if (deviceResult.error || !deviceResult.data) {
    return {
      status: "unknown",
    };
  }

  const supabase = createAdminClient();

  const { data: mudamudi, error } = await supabase
    .from("mudamudi")
    .select("id, nama")
    .eq("id", deviceResult.data.mudamudiId)
    .maybeSingle();

  if (error || !mudamudi) {
    return {
      status: "unknown",
    };
  }

  return {
    status: "known",
    mudamudi: {
      id: mudamudi.id,
      nama: mudamudi.nama,
    },
  };
}

export async function createDeviceToken(mudamudiId: number) {
  const supabase = createAdminClient();

  if (!Number.isInteger(mudamudiId) || mudamudiId <= 0) {
    return {
      success: false as const,
      error: "Data Muda-Mudi tidak valid.",
    };
  }

  const { data: mudamudi, error: mudamudiError } = await supabase
    .from("mudamudi")
    .select("id, nama")
    .eq("id", mudamudiId)
    .maybeSingle();

  if (mudamudiError) {
    return {
      success: false as const,
      error: "Gagal memeriksa data Muda-Mudi.",
    };
  }

  if (!mudamudi) {
    return {
      success: false as const,
      error: "Muda-Mudi tidak ditemukan.",
    };
  }

  const deviceToken = crypto.randomUUID();
  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from("presensi_device").insert({
    mudamudi_id: mudamudi.id,
    device_token: deviceToken,
    last_used_at: now,
  });

  if (insertError) {
    return {
      success: false as const,
      error: "Perangkat gagal didaftarkan.",
    };
  }

  return {
    success: true as const,
    mudamudi: {
      id: mudamudi.id,
      nama: mudamudi.nama,
    },
    deviceToken,
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
      success: false as const,
      error: "Device token tidak valid.",
    };
  }

  if (!Number.isInteger(mudamudiId) || mudamudiId <= 0) {
    return {
      success: false as const,
      error: "Data Muda-Mudi tidak valid.",
    };
  }

  const { data: device, error: deviceError } = await supabase
    .from("presensi_device")
    .select("id")
    .eq("device_token", token)
    .maybeSingle();

  if (deviceError) {
    return {
      success: false as const,
      error: "Gagal memeriksa perangkat.",
    };
  }

  if (!device) {
    return {
      success: false as const,
      error: "Perangkat belum terdaftar.",
    };
  }

  const { data: mudamudi, error: mudamudiError } = await supabase
    .from("mudamudi")
    .select("id, nama")
    .eq("id", mudamudiId)
    .maybeSingle();

  if (mudamudiError) {
    return {
      success: false as const,
      error: "Gagal memeriksa data Muda-Mudi.",
    };
  }

  if (!mudamudi) {
    return {
      success: false as const,
      error: "Muda-Mudi tidak ditemukan.",
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
    return {
      success: false as const,
      error: "Gagal mengganti akun perangkat.",
    };
  }

  return {
    success: true as const,
    deviceToken: token,
    mudamudi: {
      id: mudamudi.id,
      nama: mudamudi.nama,
    },
  };
}

export async function updateDeviceLastUsed(deviceToken: string) {
  const supabase = createAdminClient();

  const token = deviceToken.trim();

  if (!token) {
    return {
      success: false,
    };
  }

  const { error } = await supabase
    .from("presensi_device")
    .update({
      last_used_at: new Date().toISOString(),
    })
    .eq("device_token", token);

  return {
    success: !error,
  };
}
