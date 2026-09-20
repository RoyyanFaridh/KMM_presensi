"use server";

import { createAdminClient } from "../supabase/admin";
import { isKegiatanAktif } from "./helpers";

import {
  createDeviceToken,
  getDeviceByToken,
  updateDeviceLastUsed,
} from "./device";

import type { PresensiMetode, PresensiStatus } from "./types";

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

type MudamudiPresensi = {
  id: number;
  nama: string;
  kelas: string;
  desa: string;
  kelompok: string;
  jenis_kelamin: string | null;
};

const BATAS_TERLAMBAT_MENIT = 10;

function getStatusPresensi(
  tanggalMulai: string,
  jamMulai: string,
): PresensiStatus {
  const normalizedJamMulai =
    jamMulai.length === 5 ? `${jamMulai}:00` : jamMulai;

  const waktuMulai = new Date(`${tanggalMulai}T${normalizedJamMulai}+07:00`);

  const batasHadir = waktuMulai.getTime() + BATAS_TERLAMBAT_MENIT * 60 * 1000;

  const sekarang = Date.now();

  if (sekarang <= batasHadir) {
    return "hadir";
  }

  return "terlambat";
}

/**
 * Mengambil data kegiatan berdasarkan ID.
 */
export async function getKegiatanById(kegiatanId: number) {
  const supabase = createAdminClient();

  if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
    return {
      data: null,
      error: "Kegiatan tidak valid.",
    };
  }

  const { data, error } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi",
    )
    .eq("id", kegiatanId)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: "Gagal memuat kegiatan.",
    };
  }

  if (!data) {
    return {
      data: null,
      error: "Kegiatan tidak ditemukan.",
    };
  }

  return {
    data: data as Kegiatan,
  };
}

/**
 * Memeriksa status device.
 */
export async function getDeviceStatus(deviceToken: string | null) {
  if (!deviceToken?.trim()) {
    return {
      status: "unknown" as const,
    };
  }

  const deviceResult = await getDeviceByToken(deviceToken);

  if (deviceResult.error || !deviceResult.data) {
    return {
      status: "unknown" as const,
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
      status: "unknown" as const,
    };
  }

  return {
    status: "known" as const,
    mudamudi: {
      id: mudamudi.id,
      nama: mudamudi.nama,
    },
  };
}

/**
 * Memverifikasi identitas Muda-Mudi.
 *
 * Jika tanggal lahir sudah tersedia:
 * - tanggal lahir harus sesuai.
 *
 * Jika tanggal lahir masih kosong:
 * - tanggal lahir yang dimasukkan disimpan
 *   sebagai data awal.
 */
export async function verifyIdentity(identity: Identity) {
  const supabase = createAdminClient();

  const namaNormalized = identity.nama.trim();

  const tanggalLahirNormalized = identity.tanggalLahir.trim();

  if (!namaNormalized) {
    return {
      success: false as const,
      error: "Nama wajib diisi.",
    };
  }

  if (!tanggalLahirNormalized) {
    return {
      success: false as const,
      error: "Tanggal lahir wajib diisi.",
    };
  }

  const { data: candidates, error } = await supabase
    .from("mudamudi")
    .select(
      `
        id,
        nama,
        tanggal_lahir,
        kelas,
        desa,
        kelompok,
        jenis_kelamin
      `,
    )
    .ilike("nama", namaNormalized);

  if (error) {
    return {
      success: false as const,
      error: "Gagal memeriksa data Muda-Mudi.",
    };
  }

  if (!candidates || candidates.length === 0) {
    return {
      success: false as const,
      error: "Data Muda-Mudi tidak ditemukan. Periksa nama.",
    };
  }

  /**
   * Cari data yang tanggal lahirnya sudah
   * tersimpan dan sesuai dengan input.
   */
  const matchedWithTanggalLahir = candidates.find(
    (item) => item.tanggal_lahir === tanggalLahirNormalized,
  );

  if (matchedWithTanggalLahir) {
    const matched: MudamudiPresensi = {
      id: matchedWithTanggalLahir.id,
      nama: matchedWithTanggalLahir.nama,
      kelas: matchedWithTanggalLahir.kelas,
      desa: matchedWithTanggalLahir.desa,
      kelompok: matchedWithTanggalLahir.kelompok,
      jenis_kelamin: matchedWithTanggalLahir.jenis_kelamin,
    };

    return {
      success: true as const,
      tanggalLahirBaru: false as const,
      mudamudi: matched,
    };
  }

  /**
   * Cari kandidat yang tanggal lahirnya
   * masih kosong.
   */
  const kandidatDenganTanggalKosong = candidates.filter(
    (item) => !item.tanggal_lahir,
  );

  /**
   * Tidak ada data dengan tanggal lahir kosong.
   * Artinya tanggal lahir yang dimasukkan salah.
   */
  if (kandidatDenganTanggalKosong.length === 0) {
    return {
      success: false as const,
      error: "Tanggal lahir tidak sesuai. Periksa kembali data Anda.",
    };
  }

  /**
   * Jika nama hanya mengarah ke satu data
   * yang tanggal lahirnya kosong, data dapat
   * dilengkapi.
   */
  if (kandidatDenganTanggalKosong.length === 1) {
    const matched = kandidatDenganTanggalKosong[0];

    if (!matched) {
      return {
        success: false as const,
        error: "Data Muda-Mudi tidak ditemukan.",
      };
    }

    const { error: updateError } = await supabase
      .from("mudamudi")
      .update({
        tanggal_lahir: tanggalLahirNormalized,
      })
      .eq("id", matched.id);

    if (updateError) {
      return {
        success: false as const,
        error: "Tanggal lahir gagal disimpan. Silakan coba lagi.",
      };
    }

    const updatedMudamudi: MudamudiPresensi = {
      id: matched.id,
      nama: matched.nama,
      kelas: matched.kelas,
      desa: matched.desa,
      kelompok: matched.kelompok,
      jenis_kelamin: matched.jenis_kelamin,
    };

    return {
      success: true as const,
      tanggalLahirBaru: true as const,
      mudamudi: updatedMudamudi,
    };
  }

  /**
   * Nama sama dan terdapat lebih dari satu
   * data dengan tanggal lahir kosong.
   *
   * Jangan menentukan akun secara sembarang.
   */
  return {
    success: false as const,
    error:
      "Ditemukan beberapa Muda-Mudi dengan nama yang sama. Hubungi admin untuk melengkapi data.",
  };
}

/**
 * Membuat device token setelah identitas
 * berhasil diverifikasi.
 */
export async function registerDevice(mudamudiId: number) {
  return createDeviceToken(mudamudiId);
}

/**
 * Mengganti akun yang terhubung dengan device.
 *
 * Digunakan untuk fitur:
 * "Gunakan akun lain"
 */
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

  /**
   * Pastikan device terdaftar.
   */
  const deviceResult = await getDeviceByToken(token);

  if (deviceResult.error) {
    return {
      success: false as const,
      error: deviceResult.error,
    };
  }

  if (!deviceResult.data) {
    return {
      success: false as const,
      error: "Perangkat belum terdaftar.",
    };
  }

  /**
   * Ambil data Muda-Mudi yang akan
   * dihubungkan ke device.
   */
  const { data: mudamudi, error } = await supabase
    .from("mudamudi")
    .select("id, nama, kelas, desa, kelompok, jenis_kelamin")
    .eq("id", mudamudiId)
    .maybeSingle();

  if (error) {
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

  /**
   * Ubah akun yang terhubung dengan device.
   */
  const { error: updateError } = await supabase
    .from("presensi_device")
    .update({
      mudamudi_id: mudamudi.id,
      last_used_at: new Date().toISOString(),
    })
    .eq("device_token", token);

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
      kelas: mudamudi.kelas,
      desa: mudamudi.desa,
      kelompok: mudamudi.kelompok,
      jenis_kelamin: mudamudi.jenis_kelamin,
    },
  };
}

/**
 * Submit presensi QR.
 *
 * Flow:
 * 1. Validasi kegiatan.
 * 2. Validasi kegiatan masih aktif.
 * 3. Cek device token.
 * 4. Jika device dikenal, gunakan akun device.
 * 5. Jika device belum dikenal, minta identitas.
 * 6. Verifikasi nama + tanggal lahir.
 * 7. Lengkapi tanggal lahir jika masih kosong.
 * 8. Buat device token jika diperlukan.
 * 9. Cek duplikasi presensi.
 * 10. Tentukan status hadir/terlambat.
 * 11. Simpan presensi.
 */
export async function submitPresensi(
  deviceToken: string | null,
  kegiatanId: number,
  identity?: Identity,
) {
  const supabase = createAdminClient();

  if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
    return {
      error: "Kegiatan tidak valid.",
    };
  }

  /**
   * Ambil kegiatan.
   */
  const kegiatanResult = await getKegiatanById(kegiatanId);

  if (kegiatanResult.error) {
    return {
      error: kegiatanResult.error,
    };
  }

  const kegiatan = kegiatanResult.data;

  if (!kegiatan) {
    return {
      error: "Kegiatan tidak ditemukan.",
    };
  }

  /**
   * Pastikan kegiatan masih aktif.
   */
  if (
    !isKegiatanAktif(
      kegiatan.tanggal_mulai,
      kegiatan.tanggal_selesai,
      kegiatan.jam_mulai,
      kegiatan.jam_selesai,
    )
  ) {
    return {
      error: "Kegiatan ini tidak sedang aktif atau sudah selesai.",
    };
  }

  let mudamudi: MudamudiPresensi | null = null;

  let currentDeviceToken = deviceToken?.trim() || null;

  /**
   * =====================================================
   * 1. CEK DEVICE
   * =====================================================
   */
  if (currentDeviceToken) {
    const deviceResult = await getDeviceByToken(currentDeviceToken);

    if (deviceResult.error) {
      return {
        error: deviceResult.error,
      };
    }

    if (deviceResult.data) {
      const { data: deviceMudamudi, error: mudamudiError } = await supabase
        .from("mudamudi")
        .select("id, nama, kelas, desa, kelompok, jenis_kelamin")
        .eq("id", deviceResult.data.mudamudiId)
        .maybeSingle();

      if (mudamudiError) {
        return {
          error: "Gagal memeriksa data Muda-Mudi.",
        };
      }

      if (deviceMudamudi) {
        mudamudi = {
          id: deviceMudamudi.id,
          nama: deviceMudamudi.nama,
          kelas: deviceMudamudi.kelas,
          desa: deviceMudamudi.desa,
          kelompok: deviceMudamudi.kelompok,
          jenis_kelamin: deviceMudamudi.jenis_kelamin,
        };
      }
    }
  }

  /**
   * =====================================================
   * 2. JIKA DEVICE BELUM DIKENAL
   * =====================================================
   */
  if (!mudamudi) {
    if (!identity) {
      return {
        requiresIdentity: true,
      };
    }

    const identityResult = await verifyIdentity(identity);

    if (!identityResult.success) {
      return {
        error: identityResult.error,
      };
    }

    mudamudi = identityResult.mudamudi;

    /**
     * Jika belum ada device token,
     * buat token baru setelah identitas
     * berhasil diverifikasi.
     */
    if (!currentDeviceToken) {
      const deviceResult = await createDeviceToken(mudamudi.id);

      if (!deviceResult.success) {
        return {
          error: deviceResult.error,
        };
      }

      currentDeviceToken = deviceResult.deviceToken;
    }
  }

  /**
   * Guard untuk memastikan TypeScript
   * mengetahui bahwa mudamudi sudah ada.
   */
  if (!mudamudi) {
    return {
      error: "Data Muda-Mudi tidak ditemukan.",
    };
  }

  /**
   * =====================================================
   * 3. CEK DUPLIKASI PRESENSI
   * =====================================================
   */
  const { data: existingPresensi, error: presensiCheckError } = await supabase
    .from("presensi")
    .select("id")
    .eq("kegiatan_id", kegiatan.id)
    .eq("mudamudi_id", mudamudi.id)
    .maybeSingle();

  if (presensiCheckError) {
    return {
      error: "Gagal memeriksa status presensi.",
    };
  }

  if (existingPresensi) {
    return {
      alreadyPresent: true,
      error: "Anda sudah melakukan presensi pada kegiatan ini.",
    };
  }

  /**
   * =====================================================
   * 4. TENTUKAN STATUS
   * =====================================================
   */
  const status = getStatusPresensi(kegiatan.tanggal_mulai, kegiatan.jam_mulai);

  const waktuCheckin = new Date().toISOString();

  /**
   * =====================================================
   * 5. SIMPAN PRESENSI
   * =====================================================
   */
  const { data: presensi, error: insertError } = await supabase
    .from("presensi")
    .insert({
      kegiatan_id: kegiatan.id,
      mudamudi_id: mudamudi.id,
      waktu_checkin: waktuCheckin,
      status,
      metode: "qr",
      keterangan: null,
    })
    .select("id, waktu_checkin, status, metode, keterangan")
    .single();

  if (insertError) {
    /**
     * Pengaman jika dua request presensi
     * masuk hampir bersamaan.
     */
    if (insertError.code === "23505") {
      return {
        alreadyPresent: true,
        error: "Anda sudah melakukan presensi pada kegiatan ini.",
      };
    }

    return {
      error: "Presensi gagal disimpan.",
    };
  }

  /**
   * =====================================================
   * 6. UPDATE LAST USED DEVICE
   * =====================================================
   */
  if (currentDeviceToken) {
    await updateDeviceLastUsed(currentDeviceToken);
  }

  /**
   * =====================================================
   * 7. HASIL
   * =====================================================
   */
  return {
    success: true,

    data: {
      presensiId: presensi.id,

      waktuCheckin: presensi.waktu_checkin,

      status: presensi.status as PresensiStatus,

      metode: presensi.metode as PresensiMetode,

      keterangan: presensi.keterangan,

      deviceToken: currentDeviceToken,

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
        kelas: mudamudi.kelas,
        desa: mudamudi.desa,
        kelompok: mudamudi.kelompok,
        jenisKelamin: mudamudi.jenis_kelamin,
      },
    },
  };
}
