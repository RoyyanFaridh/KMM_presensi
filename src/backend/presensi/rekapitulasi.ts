"use server";

import { createClient } from "../supabase/server";

import {
  PresensiMetode,
  PresensiStatus,
  RekapitulasiPresensi,
} from "./types";

import { isMudamudiTargeted } from "./target";

type GetRekapitulasiParams = {
  page: number;
  itemsPerPage: number;
  search?: string;
  bulan?: string;
  kegiatanId?: number;
  desa?: string;
  kelompok?: string;
  kelas?: string;
};

type KegiatanRekap = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  lokasi: string;
  desa: string[] | null;
  kelas: string[] | null;
  jenis_kelamin: string | null;
};

type MudamudiRekap = {
  id: number;
  nama: string;
  desa: string;
  kelompok: string;
  kelas: string;
  jenis_kelamin: string | null;
};

type PresensiRekap = {
  kegiatan_id: number;
  mudamudi_id: number;
  status: string;
  metode: string;
  waktu_checkin: string | null;
  keterangan: string | null;
};

function emptyResult(
  page: number,
  itemsPerPage: number,
  error: string,
  totalItems = 0,
  totalPages = 0,
) {
  return {
    data: {
      mudamudi: [],
      kegiatan: [],
      kehadiran: [],
    } as RekapitulasiPresensi,

    pagination: {
      page,
      itemsPerPage,
      totalItems,
      totalPages,
    },

    error,
  };
}

export async function getRekapitulasiPresensi({
  page,
  itemsPerPage,
  search = "",
  bulan,
  kegiatanId,
  desa,
  kelompok,
  kelas,
}: GetRekapitulasiParams) {
  const supabase = await createClient();

  const safePage = Math.max(1, Math.floor(page));
  const safeItemsPerPage = Math.min(
    100,
    Math.max(1, Math.floor(itemsPerPage)),
  );

  /*
   * ============================================================
   * 1. QUERY KEGIATAN
   * ============================================================
   *
   * Hanya mengambil kolom yang memang dibutuhkan Rekapitulasi.
   */

  let kegiatanQuery = supabase
    .from("kegiatan")
    .select(
      `
        id,
        nama,
        tanggal_mulai,
        tanggal_selesai,
        lokasi,
        desa,
        kelas,
        jenis_kelamin
      `,
    )
    .order("tanggal_mulai", {
      ascending: false,
    })
    .order("jam_mulai", {
      ascending: false,
    });

  if (bulan) {
    const [year, month] = bulan.split("-").map(Number);

    if (
      Number.isInteger(year) &&
      Number.isInteger(month) &&
      month >= 1 &&
      month <= 12
    ) {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

      const nextMonth = new Date(Date.UTC(year, month, 1));

      const endDate = nextMonth.toISOString().slice(0, 10);

      kegiatanQuery = kegiatanQuery
        .gte("tanggal_mulai", startDate)
        .lt("tanggal_mulai", endDate);
    }
  }

  if (kegiatanId !== undefined) {
    if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
      return emptyResult(
        safePage,
        safeItemsPerPage,
        "Kegiatan tidak valid",
      );
    }

    kegiatanQuery = kegiatanQuery.eq("id", kegiatanId);
  }

  /*
   * ============================================================
   * 2. QUERY MUDA-MUDI
   * ============================================================
   *
   * Search, desa, kelompok, dan kelas semuanya diterapkan
   * langsung di Supabase.
   *
   * Jadi Vercel tidak perlu menerima data yang tidak sesuai
   * filter tersebut.
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

  const keyword = search.trim();

  if (keyword) {
    mudamudiQuery = mudamudiQuery.ilike(
      "nama",
      `%${keyword}%`,
    );
  }

  if (desa) {
    mudamudiQuery = mudamudiQuery.eq("desa", desa);
  }

  if (kelompok) {
    mudamudiQuery = mudamudiQuery.eq("kelompok", kelompok);
  }

  if (kelas) {
    mudamudiQuery = mudamudiQuery.eq("kelas", kelas);
  }

  /*
   * Kegiatan dan Muda-Mudi bisa diambil bersamaan.
   *
   * Ini tetap dua query Supabase, tetapi berjalan paralel
   * sehingga tidak menunggu query pertama selesai dahulu.
   */

  const [mudamudiResult, kegiatanResult] = await Promise.all([
    mudamudiQuery,
    kegiatanQuery,
  ]);

  if (mudamudiResult.error) {
    console.error(
      "Gagal mengambil data Muda-Mudi:",
      mudamudiResult.error,
    );

    return emptyResult(
      safePage,
      safeItemsPerPage,
      "Gagal mengambil data Muda-Mudi",
    );
  }

  if (kegiatanResult.error) {
    console.error(
      "Gagal mengambil data kegiatan:",
      kegiatanResult.error,
    );

    return emptyResult(
      safePage,
      safeItemsPerPage,
      "Gagal mengambil data kegiatan",
    );
  }

  const kegiatanData = (kegiatanResult.data ??
    []) as KegiatanRekap[];

  const mudamudiData = (mudamudiResult.data ??
    []) as MudamudiRekap[];

  /*
   * ============================================================
   * 3. TENTUKAN PESERTA SASARAN
   * ============================================================
   *
   * Seseorang hanya masuk Rekapitulasi jika menjadi sasaran
   * minimal pada salah satu kegiatan yang sedang ditampilkan.
   *
   * Target tetap menggunakan satu sumber kebenaran:
   * isMudamudiTargeted().
   */

  const pesertaSasaran =
    kegiatanData.length === 0
      ? []
      : mudamudiData.filter((mudamudi) =>
          kegiatanData.some((kegiatan) =>
            isMudamudiTargeted(kegiatan, mudamudi),
          ),
        );

  /*
   * ============================================================
   * 4. PAGINATION
   * ============================================================
   *
   * Pagination dilakukan setelah peserta sasaran diketahui.
   *
   * Ini sengaja dipertahankan karena target kegiatan bersifat
   * dinamis berdasarkan desa, kelas, dan jenis kelamin.
   */

  const totalItems = pesertaSasaran.length;

  const totalPages =
    totalItems === 0
      ? 0
      : Math.ceil(totalItems / safeItemsPerPage);

  const from = (safePage - 1) * safeItemsPerPage;
  const to = from + safeItemsPerPage;

  const mudamudiDataPaginated = pesertaSasaran.slice(
    from,
    to,
  );

  const mudamudiIds = mudamudiDataPaginated.map(
    (item) => item.id,
  );

  const kegiatanIds = kegiatanData.map(
    (item) => item.id,
  );

  /*
   * ============================================================
   * 5. QUERY PRESENSI
   * ============================================================
   *
   * Hanya mengambil presensi:
   * - Muda-Mudi yang ada pada halaman aktif
   * - Kegiatan yang sedang ditampilkan
   *
   * Tidak mengambil seluruh tabel presensi.
   *
   * Tidak menggunakan ORDER BY karena pasangan
   * (kegiatan_id, mudamudi_id) sudah UNIQUE.
   */

  let presensiData: PresensiRekap[] = [];

  if (
    mudamudiIds.length > 0 &&
    kegiatanIds.length > 0
  ) {
    const presensiResult = await supabase
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
      .in("mudamudi_id", mudamudiIds)
      .in("kegiatan_id", kegiatanIds);

    if (presensiResult.error) {
      console.error(
        "Gagal mengambil data presensi:",
        presensiResult.error,
      );

      return emptyResult(
        safePage,
        safeItemsPerPage,
        "Gagal mengambil data presensi",
        totalItems,
        totalPages,
      );
    }

    presensiData =
      (presensiResult.data ?? []) as PresensiRekap[];
  }

  /*
   * ============================================================
   * 6. BENTUK RESPONSE
   * ============================================================
   */

  const result: RekapitulasiPresensi = {
    mudamudi: mudamudiDataPaginated.map((item) => ({
      id: item.id,
      nama: item.nama,
      desa: item.desa,
      kelompok: item.kelompok,
      kelas: item.kelas,
      jenis_kelamin: item.jenis_kelamin,
    })),

    kegiatan: kegiatanData.map((item) => ({
      id: item.id,
      nama: item.nama,
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai,
      lokasi: item.lokasi,
      desa: item.desa,
      kelas: item.kelas,
      jenis_kelamin: item.jenis_kelamin,
    })),

    kehadiran: presensiData.map((item) => ({
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

    pagination: {
      page: safePage,
      itemsPerPage: safeItemsPerPage,
      totalItems,
      totalPages,
    },
  };
}