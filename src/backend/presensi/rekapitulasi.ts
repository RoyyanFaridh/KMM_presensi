"use server";

import { createClient } from "../supabase/server";

import { PresensiMetode, PresensiStatus, RekapitulasiPresensi } from "./types";

type GetRekapitulasiParams = {
  page: number;
  itemsPerPage: number;
  search?: string;
  bulan?: string;
  kegiatanId?: number;
  desa?: string;
  kelompok?: string;
};

export async function getRekapitulasiPresensi({
  page,
  itemsPerPage,
  search = "",
  bulan,
  kegiatanId,
  desa,
  kelompok,
}: GetRekapitulasiParams) {
  const supabase = await createClient();

  const safePage = Math.max(1, page);
  const safeItemsPerPage = Math.max(1, itemsPerPage);

  const from = (safePage - 1) * safeItemsPerPage;
  const to = from + safeItemsPerPage - 1;

  /*
   * ============================================================
   * KEGIATAN
   * ============================================================
   *
   * Kegiatan tetap diambil berdasarkan filter kegiatan/bulan.
   * Jumlah kegiatan biasanya jauh lebih kecil daripada data
   * Muda-Mudi sehingga tidak menggunakan pagination.
   */
  let kegiatanQuery = supabase
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
    kegiatanQuery = kegiatanQuery.eq("id", kegiatanId);
  }

  /*
   * ============================================================
   * MUDA-MUDI
   * ============================================================
   *
   * count: "exact" digunakan untuk mendapatkan jumlah seluruh
   * data yang sesuai filter tanpa mengambil semuanya.
   *
   * range() hanya mengambil data untuk halaman aktif.
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
      {
        count: "exact",
      },
    )
    .order("nama", {
      ascending: true,
    })
    .range(from, to);

  const keyword = search.trim();

  if (keyword) {
    mudamudiQuery = mudamudiQuery.ilike("nama", `%${keyword}%`);
  }

  if (desa) {
    mudamudiQuery = mudamudiQuery.eq("desa", desa);
  }

  if (kelompok) {
    mudamudiQuery = mudamudiQuery.eq("kelompok", kelompok);
  }

  const [mudamudiResult, kegiatanResult] = await Promise.all([
    mudamudiQuery,
    kegiatanQuery,
  ]);

  if (mudamudiResult.error) {
    console.error("Gagal mengambil data muda-mudi:", mudamudiResult.error);

    return {
      data: {
        mudamudi: [],
        kegiatan: [],
        kehadiran: [],
      } as RekapitulasiPresensi,

      pagination: {
        page: safePage,
        itemsPerPage: safeItemsPerPage,
        totalItems: 0,
        totalPages: 0,
      },

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

      pagination: {
        page: safePage,
        itemsPerPage: safeItemsPerPage,
        totalItems: 0,
        totalPages: 0,
      },

      error: "Gagal mengambil data kegiatan",
    };
  }

  const mudamudiData = mudamudiResult.data ?? [];
  const kegiatanData = kegiatanResult.data ?? [];

  const totalItems = mudamudiResult.count ?? 0;

  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / safeItemsPerPage);

  /*
   * ============================================================
   * PRESENSI
   * ============================================================
   *
   * Hanya mengambil presensi:
   *
   * - Muda-Mudi yang sedang berada di halaman aktif
   * - Kegiatan yang sedang ditampilkan
   *
   * Jadi tidak lagi mengambil seluruh tabel presensi.
   */
  const mudamudiIds = mudamudiData.map((item) => item.id);

  const kegiatanIds = kegiatanData.map((item) => item.id);

  let presensiData: typeof mudamudiData extends never[]
    ? never[]
    : {
        kegiatan_id: number;
        mudamudi_id: number;
        status: string;
        metode: string;
        waktu_checkin: string | null;
        keterangan: string | null;
      }[] = [];

  if (mudamudiIds.length > 0 && kegiatanIds.length > 0) {
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
      .in("kegiatan_id", kegiatanIds)
      .order("waktu_checkin", {
        ascending: false,
        nullsFirst: false,
      });

    if (presensiResult.error) {
      console.error("Gagal mengambil data presensi:", presensiResult.error);

      return {
        data: {
          mudamudi: [],
          kegiatan: [],
          kehadiran: [],
        } as RekapitulasiPresensi,

        pagination: {
          page: safePage,
          itemsPerPage: safeItemsPerPage,
          totalItems,
          totalPages,
        },

        error: "Gagal mengambil data presensi",
      };
    }

    presensiData = presensiResult.data ?? [];
  }

  /*
   * ============================================================
   * HASIL
   * ============================================================
   */
  const result: RekapitulasiPresensi = {
    mudamudi: mudamudiData.map((item) => ({
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
