"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import { isMudamudiTargeted } from "./target";

import type {
  PresensiMetode,
  PresensiStatus,
  RekapitulasiKegiatan,
  RekapitulasiPresensi,
} from "./types";

type FilterValue = string | string[];

type GetRekapitulasiParams = {
  page: number;
  itemsPerPage: number;
  search?: string;
  bulan?: string;
  kegiatanId?: number;
  desa?: FilterValue;
  kelompok?: FilterValue;
  kelas?: FilterValue;
};

type KegiatanRekap = {
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

function normalizeFilter(value?: FilterValue): string[] {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(value.map((item) => item.trim()).filter(Boolean)),
    );
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
}

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

function canAccessKegiatan(
  kegiatan: KegiatanRekap,
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

function mapKegiatan(item: KegiatanRekap): RekapitulasiKegiatan {
  return {
    id: item.id,
    nama: item.nama,
    tanggal_mulai: item.tanggal_mulai,
    tanggal_selesai: item.tanggal_selesai,
    jam_mulai: item.jam_mulai,
    jam_selesai: item.jam_selesai,
    lokasi: item.lokasi,
    desa: item.desa,
    kelas: item.kelas,
    jenis_kelamin: item.jenis_kelamin,
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
  const admin = await requireAdmin();
  const supabase = await createClient();

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  const safeItemsPerPage =
    Number.isFinite(itemsPerPage) && itemsPerPage > 0
      ? Math.min(100, Math.floor(itemsPerPage))
      : 10;

  if (
    kegiatanId !== undefined &&
    (!Number.isInteger(kegiatanId) || kegiatanId <= 0)
  ) {
    return emptyResult(safePage, safeItemsPerPage, "Kegiatan tidak valid.");
  }

  const desaFilters = normalizeFilter(desa);
  const kelompokFilters = normalizeFilter(kelompok);
  const kelasFilters = normalizeFilter(kelas);

  if (
    !admin.isSuperAdmin &&
    admin.desa !== null &&
    desaFilters.some((item) => item !== admin.desa)
  ) {
    return emptyResult(
      safePage,
      safeItemsPerPage,
      "Kamu tidak memiliki akses ke data desa tersebut.",
    );
  }

  let kegiatanQuery = supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, desa, kelas, jenis_kelamin",
    )
    .order("tanggal_mulai", { ascending: false })
    .order("jam_mulai", { ascending: false });

  if (bulan) {
    const match = /^(\d{4})-(\d{2})$/.exec(bulan);

    if (!match) {
      return emptyResult(
        safePage,
        safeItemsPerPage,
        "Format bulan tidak valid.",
      );
    }

    const year = Number(match[1]);
    const month = Number(match[2]);

    if (month < 1 || month > 12) {
      return emptyResult(
        safePage,
        safeItemsPerPage,
        "Format bulan tidak valid.",
      );
    }

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(Date.UTC(year, month, 1))
      .toISOString()
      .slice(0, 10);

    kegiatanQuery = kegiatanQuery
      .gte("tanggal_mulai", startDate)
      .lt("tanggal_mulai", endDate);
  }

  if (kegiatanId !== undefined) {
    kegiatanQuery = kegiatanQuery.eq("id", kegiatanId);
  }

  let mudamudiQuery = supabase
    .from("mudamudi")
    .select("id, nama, desa, kelompok, kelas, jenis_kelamin")
    .order("nama", { ascending: true });

  const keyword = search.trim();

  if (keyword) {
    mudamudiQuery = mudamudiQuery.ilike("nama", `%${keyword}%`);
  }

  if (!admin.isSuperAdmin && admin.desa !== null) {
    mudamudiQuery = mudamudiQuery.eq("desa", admin.desa);
  } else if (desaFilters.length === 1) {
    mudamudiQuery = mudamudiQuery.eq("desa", desaFilters[0]);
  } else if (desaFilters.length > 1) {
    mudamudiQuery = mudamudiQuery.in("desa", desaFilters);
  }

  if (kelompokFilters.length === 1) {
    mudamudiQuery = mudamudiQuery.eq("kelompok", kelompokFilters[0]);
  } else if (kelompokFilters.length > 1) {
    mudamudiQuery = mudamudiQuery.in("kelompok", kelompokFilters);
  }

  if (kelasFilters.length === 1) {
    mudamudiQuery = mudamudiQuery.eq("kelas", kelasFilters[0]);
  } else if (kelasFilters.length > 1) {
    mudamudiQuery = mudamudiQuery.in("kelas", kelasFilters);
  }

  const [mudamudiResult, kegiatanResult] = await Promise.all([
    mudamudiQuery,
    kegiatanQuery,
  ]);

  if (mudamudiResult.error) {
    console.error("Gagal mengambil data Muda-Mudi:", mudamudiResult.error);

    return emptyResult(
      safePage,
      safeItemsPerPage,
      "Gagal mengambil data Muda-Mudi.",
    );
  }

  if (kegiatanResult.error) {
    console.error("Gagal mengambil data kegiatan:", kegiatanResult.error);

    return emptyResult(
      safePage,
      safeItemsPerPage,
      "Gagal mengambil data kegiatan.",
    );
  }

  const semuaKegiatan = (kegiatanResult.data ?? []) as KegiatanRekap[];

  const kegiatanData = semuaKegiatan.filter((kegiatan) =>
    canAccessKegiatan(kegiatan, admin.desa, admin.isSuperAdmin),
  );

  const mudamudiData = (mudamudiResult.data ?? []) as MudamudiRekap[];

  const pesertaSasaran =
    kegiatanData.length === 0
      ? []
      : mudamudiData.filter((mudamudi) =>
          kegiatanData.some((kegiatan) =>
            isMudamudiTargeted(kegiatan, mudamudi),
          ),
        );

  const totalItems = pesertaSasaran.length;
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / safeItemsPerPage);

  const from = (safePage - 1) * safeItemsPerPage;
  const to = from + safeItemsPerPage;
  const mudamudiDataPaginated = pesertaSasaran.slice(from, to);

  const mudamudiIds = mudamudiDataPaginated.map((item) => item.id);
  const kegiatanIds = kegiatanData.map((item) => item.id);

  let presensiData: PresensiRekap[] = [];

  if (mudamudiIds.length > 0 && kegiatanIds.length > 0) {
    const presensiResult = await supabase
      .from("presensi")
      .select(
        "kegiatan_id, mudamudi_id, status, metode, waktu_checkin, keterangan",
      )
      .in("mudamudi_id", mudamudiIds)
      .in("kegiatan_id", kegiatanIds);

    if (presensiResult.error) {
      console.error("Gagal mengambil data presensi:", presensiResult.error);

      return emptyResult(
        safePage,
        safeItemsPerPage,
        "Gagal mengambil data presensi.",
        totalItems,
        totalPages,
      );
    }

    presensiData = (presensiResult.data ?? []) as PresensiRekap[];
  }

  const result: RekapitulasiPresensi = {
    mudamudi: mudamudiDataPaginated.map((item) => ({
      id: item.id,
      nama: item.nama,
      desa: item.desa,
      kelompok: item.kelompok,
      kelas: item.kelas,
      jenis_kelamin: item.jenis_kelamin,
    })),
    kegiatan: kegiatanData.map(mapKegiatan),
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

export async function getRekapitulasiKegiatanExportOptions() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, desa, kelas, jenis_kelamin",
    )
    .order("tanggal_mulai", { ascending: false })
    .order("jam_mulai", { ascending: false });

  if (error) {
    console.error("Gagal mengambil opsi kegiatan ekspor:", error);

    return { error: "Gagal mengambil pilihan kegiatan ekspor." };
  }

  const kegiatan = ((data ?? []) as KegiatanRekap[])
    .filter((item) => canAccessKegiatan(item, admin.desa, admin.isSuperAdmin))
    .map(mapKegiatan);

  return { data: kegiatan };
}
