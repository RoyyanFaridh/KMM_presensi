
"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import type {
  MonitoringPeserta,
  MonitoringPresensi,
  PresensiMetode,
  PresensiStatus,
} from "./types";

type KegiatanMonitoring = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  desa: string[] | null;
  kelompok: string[] | null;
  kelas: string[] | null;
  jenjang: string[] | null;
  jenis_kelamin: string | null;
  target_frozen_at: string | null;
};

type MudamudiMonitoring = {
  id: number;
  nama: string;
  desa: string;
  kelompok: string;
  kelas: string;
  jenjang: string | null;
  jenis_kelamin: string | null;
};

type MudamudiSnapshot = {
  mudamudi_id: number;
  nama_snapshot: string | null;
  desa_snapshot: string | null;
  kelompok_snapshot: string | null;
  kelas_snapshot: string | null;
  jenjang_snapshot: string | null;
  jenis_kelamin_snapshot: string | null;
};

type PresensiMonitoringRow = {
  id: number;
  mudamudi_id: number;
  waktu_checkin: string | null;
  status: string;
  metode: string;
  keterangan: string | null;
};

function emptyResult(error: string) {
  return {
    data: null as MonitoringPresensi | null,
    error,
  };
}

function canAccessKegiatan(
  kegiatan: KegiatanMonitoring,
  adminDesa: string | null,
  isSuperAdmin: boolean,
) {
  if (isSuperAdmin) return true;

  return (
    adminDesa !== null &&
    Array.isArray(kegiatan.desa) &&
    kegiatan.desa.length > 0 &&
    kegiatan.desa.every(
      (desa) => typeof desa === "string" && desa === adminDesa,
    )
  );
}

export async function getMonitoringPresensi(kegiatanId: number) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
    return emptyResult("Kegiatan tidak valid.");
  }

  const { data: kegiatan, error: kegiatanError } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, desa, kelompok, kelas, jenjang, jenis_kelamin, target_frozen_at",
    )
    .eq("id", kegiatanId)
    .maybeSingle();

  if (kegiatanError) {
    console.error("Gagal mengambil kegiatan:", kegiatanError);
    return emptyResult("Gagal mengambil data kegiatan.");
  }

  if (!kegiatan) {
    return emptyResult("Kegiatan tidak ditemukan atau tidak memiliki akses.");
  }

  const kegiatanMonitoring = kegiatan as KegiatanMonitoring;

  if (!canAccessKegiatan(kegiatanMonitoring, admin.desa, admin.isSuperAdmin)) {
    return emptyResult("Kamu tidak memiliki akses ke kegiatan ini.");
  }

  let mudamudiSasaran: MudamudiMonitoring[] = [];

  if (kegiatanMonitoring.target_frozen_at !== null) {
    const { data: snapshotData, error: snapshotError } = await supabase
      .from("kegiatan_mudamudi")
      .select(
        "mudamudi_id, nama_snapshot, desa_snapshot, kelompok_snapshot, kelas_snapshot, jenjang_snapshot, jenis_kelamin_snapshot",
      )
      .eq("kegiatan_id", kegiatanId)
      .order("nama_snapshot", { ascending: true });

    if (snapshotError) {
      console.error("Gagal mengambil snapshot peserta:", snapshotError);
      return emptyResult("Gagal mengambil data snapshot peserta kegiatan.");
    }

    mudamudiSasaran = ((snapshotData ?? []) as MudamudiSnapshot[]).map(
      (item) => ({
        id: item.mudamudi_id,
        nama: item.nama_snapshot ?? "Nama tidak tersedia",
        desa: item.desa_snapshot ?? "",
        kelompok: item.kelompok_snapshot ?? "",
        kelas: item.kelas_snapshot ?? "",
        jenjang: item.jenjang_snapshot ?? null,
        jenis_kelamin: item.jenis_kelamin_snapshot ?? null,
      }),
    );
  } else {
    let mudamudiQuery = supabase
      .from("mudamudi")
      .select("id, nama, desa, kelompok, kelas, jenjang, jenis_kelamin")
      .is("deleted_at", null)
      .order("nama", { ascending: true });

    if (!admin.isSuperAdmin && admin.desa !== null) {
      mudamudiQuery = mudamudiQuery.eq("desa", admin.desa);
    }

    if (kegiatanMonitoring.desa?.length) {
      mudamudiQuery = mudamudiQuery.in(
        "desa",
        kegiatanMonitoring.desa,
      );
    }

    if (kegiatanMonitoring.kelompok?.length) {
      mudamudiQuery = mudamudiQuery.in(
        "kelompok",
        kegiatanMonitoring.kelompok,
      );
    }

    if (kegiatanMonitoring.kelas?.length) {
      const kelasList = [...kegiatanMonitoring.kelas];

      if (kelasList.includes("Caberawit")) {
        kelasList.push("Caberawit A", "Caberawit B");
      }

      mudamudiQuery = mudamudiQuery.in("kelas", [...new Set(kelasList)]);
    }

    if (kegiatanMonitoring.jenjang?.length) {
      mudamudiQuery = mudamudiQuery.in(
        "jenjang",
        kegiatanMonitoring.jenjang,
      );
    }

    if (kegiatanMonitoring.jenis_kelamin) {
      mudamudiQuery = mudamudiQuery.eq(
        "jenis_kelamin",
        kegiatanMonitoring.jenis_kelamin,
      );
    }

    const { data: mudamudiData, error: mudamudiError } =
      await mudamudiQuery;

    if (mudamudiError) {
      console.error("Gagal mengambil Muda-Mudi:", mudamudiError);
      return emptyResult("Gagal mengambil data Muda-Mudi.");
    }

    mudamudiSasaran = (mudamudiData ?? []) as MudamudiMonitoring[];
  }

  const { data: presensiData, error: presensiError } = await supabase
    .from("presensi")
    .select("id, mudamudi_id, waktu_checkin, status, metode, keterangan")
    .eq("kegiatan_id", kegiatanId)
    .order("waktu_checkin", {
      ascending: true,
      nullsFirst: false,
    });

  if (presensiError) {
    console.error("Gagal mengambil presensi:", presensiError);
    return emptyResult("Gagal mengambil data presensi.");
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

  for (const item of (presensiData ?? []) as PresensiMonitoringRow[]) {
    presensiMap.set(item.mudamudi_id, {
      presensi_id: item.id,
      waktu_checkin: item.waktu_checkin,
      status: item.status as PresensiStatus,
      metode: item.metode as PresensiMetode,
      keterangan: item.keterangan,
    });
  }

  const peserta: MonitoringPeserta[] = mudamudiSasaran.map((item) => {
    const presensi = presensiMap.get(item.id);

    return {
      presensi_id: presensi?.presensi_id ?? null,
      mudamudi_id: item.id,
      nama: item.nama,
      desa: item.desa,
      kelompok: item.kelompok,
      kelas: item.kelas,
      jenjang: item.jenjang ?? null,
      jenis_kelamin: item.jenis_kelamin ?? null,
      waktu_checkin: presensi?.waktu_checkin ?? null,
      status: presensi?.status ?? null,
      metode: presensi?.metode ?? null,
      keterangan: presensi?.keterangan ?? null,
    };
  });

  let totalHadir = 0;
  let totalTerlambat = 0;
  let totalIzin = 0;
  let totalSakit = 0;
  let totalAlpa = 0;
  let totalBelumHadir = 0;

  for (const item of peserta) {
    switch (item.status) {
      case "hadir":
        totalHadir++;
        break;
      case "terlambat":
        totalTerlambat++;
        break;
      case "izin":
        totalIzin++;
        break;
      case "sakit":
        totalSakit++;
        break;
      case "alpa":
        totalAlpa++;
        break;
      default:
        totalBelumHadir++;
        break;
    }
  }

  return {
    data: {
      kegiatan: kegiatanMonitoring,
      totalPeserta: peserta.length,
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
