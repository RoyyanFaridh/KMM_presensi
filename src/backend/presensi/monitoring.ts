"use server";

import { createClient } from "../supabase/server";

import {
  MonitoringPeserta,
  MonitoringPresensi,
  PresensiMetode,
  PresensiStatus,
} from "./types";

type KegiatanMonitoring = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  desa: string[] | null;
  kelas: string[] | null;
  jenis_kelamin: string | null;
};

type MudamudiMonitoring = {
  id: number;
  nama: string;
  desa: string;
  kelompok: string;
  kelas: string;
  jenis_kelamin: string | null;
};

function emptyResult(error: string) {
  return {
    data: null as MonitoringPresensi | null,
    error,
  };
}

export async function getMonitoringPresensi(kegiatanId: number) {
  const supabase = await createClient();

  if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
    return emptyResult("Kegiatan tidak valid");
  }

  /*
   * Ambil hanya data kegiatan yang benar-benar diperlukan.
   */
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
        lokasi,
        desa,
        kelas,
        jenis_kelamin
      `,
    )
    .eq("id", kegiatanId)
    .maybeSingle();

  if (kegiatanError) {
    console.error("Gagal mengambil kegiatan:", kegiatanError);

    return emptyResult("Gagal mengambil data kegiatan");
  }

  if (!kegiatan) {
    return emptyResult("Kegiatan tidak ditemukan");
  }

  const kegiatanMonitoring = kegiatan as KegiatanMonitoring;

  /*
   * Query Muda-Mudi langsung berdasarkan target kegiatan.
   *
   * NULL / array kosong = semua.
   *
   * Dengan begitu kita tidak perlu mengambil seluruh
   * Muda-Mudi kemudian memfilter di server.
   */
  let mudamudiQuery = supabase
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
    });

  if (kegiatanMonitoring.desa?.length) {
    mudamudiQuery = mudamudiQuery.in("desa", kegiatanMonitoring.desa);
  }

  if (kegiatanMonitoring.kelas?.length) {
    mudamudiQuery = mudamudiQuery.in("kelas", kegiatanMonitoring.kelas);
  }

  if (kegiatanMonitoring.jenis_kelamin) {
    mudamudiQuery = mudamudiQuery.eq(
      "jenis_kelamin",
      kegiatanMonitoring.jenis_kelamin,
    );
  }

  /*
   * Muda-Mudi dan presensi dapat diambil bersamaan.
   *
   * Presensi dibatasi hanya untuk kegiatan yang sedang
   * dimonitor.
   */
  const [mudamudiResult, presensiResult] = await Promise.all([
    mudamudiQuery,

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

    return emptyResult("Gagal mengambil data Muda-Mudi");
  }

  if (presensiResult.error) {
    console.error("Gagal mengambil presensi:", presensiResult.error);

    return emptyResult("Gagal mengambil data presensi");
  }

  const mudamudiSasaran = (mudamudiResult.data ?? []) as MudamudiMonitoring[];

  /*
   * Buat map presensi berdasarkan ID Muda-Mudi.
   *
   * Karena database memiliki UNIQUE(kegiatan_id, mudamudi_id),
   * satu Muda-Mudi maksimal memiliki satu presensi
   * untuk satu kegiatan.
   */
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

  /*
   * Gabungkan peserta target dengan data presensinya.
   *
   * Tidak ada presensi = Belum Hadir.
   */
  const peserta: MonitoringPeserta[] = mudamudiSasaran.map((item) => {
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

  /*
   * Hitung summary dalam satu loop.
   *
   * Lebih hemat CPU daripada melakukan 6x filter()
   * terhadap array peserta.
   */
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
