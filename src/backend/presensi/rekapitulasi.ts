
"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import { isMudamudiTargeted } from "./target";

import type {
  PresensiMetode,
  RekapitulasiKegiatan,
  RekapitulasiPresensi,
  RekapitulasiStatus,
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

type MudamudiRekap = {
  id: number;
  nama: string;
  desa: string;
  kelompok: string;
  kelas: string;
  jenjang: string | null;
  jenis_kelamin: string | null;
  deleted_at: string | null;
};

type SnapshotRekap = {
  kegiatan_id: number;
  mudamudi_id: number;
  nama_snapshot: string | null;
  desa_snapshot: string | null;
  kelompok_snapshot: string | null;
  kelas_snapshot: string | null;
  jenjang_snapshot: string | null;
  jenis_kelamin_snapshot: string | null;
};

type PresensiRekap = {
  kegiatan_id: number;
  mudamudi_id: number;
  status: string;
  metode: string | null;
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
    tanggal_selesai: item.tanggal_selesai ?? item.tanggal_mulai,
    jam_mulai: item.jam_mulai,
    jam_selesai: item.jam_selesai,
    lokasi: item.lokasi,
    desa: item.desa,
    kelompok: item.kelompok,
    kelas: item.kelas,
    jenis_kelamin: item.jenis_kelamin,
  };
}

function matchesFilters(
  mudamudi: MudamudiRekap,
  desaFilters: string[],
  kelompokFilters: string[],
  kelasFilters: string[],
  keyword: string,
) {
  const matchesDesa =
    desaFilters.length === 0 || desaFilters.includes(mudamudi.desa);

  const matchesKelompok =
    kelompokFilters.length === 0 ||
    kelompokFilters.includes(mudamudi.kelompok);

  const matchesKelas =
    kelasFilters.length === 0 || kelasFilters.includes(mudamudi.kelas);

  const matchesSearch =
    !keyword ||
    mudamudi.nama.toLowerCase().includes(keyword.toLowerCase());

  return (
    matchesDesa &&
    matchesKelompok &&
    matchesKelas &&
    matchesSearch
  );
}

async function fetchAllMudamudi(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const pageSize = 1000;
  const allData: MudamudiRekap[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("mudamudi")
      .select(
        "id, nama, desa, kelompok, kelas, jenjang, jenis_kelamin, deleted_at",
      )
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      return { data: null, error };
    }

    const rows = (data ?? []) as MudamudiRekap[];
    allData.push(...rows);

    if (rows.length < pageSize) break;
  }

  return { data: allData, error: null };
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
  const keyword = search.trim();

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
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, desa, kelompok, kelas, jenjang, jenis_kelamin, target_frozen_at",
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

  const [kegiatanResult, mudamudiResult] = await Promise.all([
    kegiatanQuery,
    fetchAllMudamudi(supabase),
  ]);

  if (kegiatanResult.error) {
    console.error("Gagal mengambil data kegiatan:", kegiatanResult.error);

    return emptyResult(
      safePage,
      safeItemsPerPage,
      "Gagal mengambil data kegiatan.",
    );
  }

  if (mudamudiResult.error) {
    console.error("Gagal mengambil data Muda-Mudi:", mudamudiResult.error);

    return emptyResult(
      safePage,
      safeItemsPerPage,
      "Gagal mengambil data Muda-Mudi.",
    );
  }

  const semuaKegiatan = (kegiatanResult.data ?? []) as KegiatanRekap[];

  const kegiatanData = semuaKegiatan.filter((kegiatan) =>
    canAccessKegiatan(kegiatan, admin.desa, admin.isSuperAdmin),
  );

  const kegiatanFrozenIds = kegiatanData
    .filter((item) => item.target_frozen_at !== null)
    .map((item) => item.id);

  let snapshotData: SnapshotRekap[] = [];

  if (kegiatanFrozenIds.length > 0) {
    const snapshotResult = await supabase
      .from("kegiatan_mudamudi")
      .select(
        "kegiatan_id, mudamudi_id, nama_snapshot, desa_snapshot, kelompok_snapshot, kelas_snapshot, jenjang_snapshot, jenis_kelamin_snapshot",
      )
      .in("kegiatan_id", kegiatanFrozenIds);

    if (snapshotResult.error) {
      console.error(
        "Gagal mengambil snapshot sasaran kegiatan:",
        snapshotResult.error,
      );

      return emptyResult(
        safePage,
        safeItemsPerPage,
        "Gagal mengambil snapshot sasaran kegiatan.",
      );
    }

    snapshotData = (snapshotResult.data ?? []) as SnapshotRekap[];
  }

  const mudamudiMap = new Map<number, MudamudiRekap>();

  for (const item of mudamudiResult.data ?? []) {
    mudamudiMap.set(item.id, item);
  }

  const snapshotByMudamudi = new Map<number, SnapshotRekap>();

  const kegiatanFrozenOrder = [...kegiatanData]
    .filter((item) => item.target_frozen_at !== null)
    .sort(
      (a, b) =>
        new Date(b.target_frozen_at!).getTime() -
        new Date(a.target_frozen_at!).getTime(),
    );

  for (const kegiatan of kegiatanFrozenOrder) {
    const snapshots = snapshotData.filter(
      (item) => item.kegiatan_id === kegiatan.id,
    );

    for (const snapshot of snapshots) {
      if (!snapshotByMudamudi.has(snapshot.mudamudi_id)) {
        snapshotByMudamudi.set(snapshot.mudamudi_id, snapshot);
      }
    }
  }

  const pesertaSnapshotIds = new Set(
    snapshotData.map((item) => item.mudamudi_id),
  );

  const mudamudiData: MudamudiRekap[] = [];

  for (const [id, mudamudi] of mudamudiMap.entries()) {
    const snapshot = snapshotByMudamudi.get(id);

    if (mudamudi.deleted_at !== null && !pesertaSnapshotIds.has(id)) {
      continue;
    }

    const effectiveMudamudi: MudamudiRekap = snapshot
      ? {
        ...mudamudi,
        nama: snapshot.nama_snapshot ?? mudamudi.nama,
        desa: snapshot.desa_snapshot ?? mudamudi.desa,
        kelompok: snapshot.kelompok_snapshot ?? mudamudi.kelompok,
        kelas: snapshot.kelas_snapshot ?? mudamudi.kelas,
        jenjang: snapshot.jenjang_snapshot ?? mudamudi.jenjang,
        jenis_kelamin:
          snapshot.jenis_kelamin_snapshot ?? mudamudi.jenis_kelamin,
      }
      : mudamudi;

    if (
      matchesFilters(
        effectiveMudamudi,
        desaFilters,
        kelompokFilters,
        kelasFilters,
        keyword,
      )
    ) {
      mudamudiData.push(effectiveMudamudi);
    }
  }

  mudamudiData.sort((a, b) => a.nama.localeCompare(b.nama, "id"));

  const totalItems = mudamudiData.length;
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / safeItemsPerPage);

  const currentPage = totalPages > 0 ? Math.min(safePage, totalPages) : 1;

  const from = (currentPage - 1) * safeItemsPerPage;
  const to = from + safeItemsPerPage;
  const mudamudiDataPaginated = mudamudiData.slice(from, to);

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
        currentPage,
        safeItemsPerPage,
        "Gagal mengambil data presensi.",
        totalItems,
        totalPages,
      );
    }

    presensiData = (presensiResult.data ?? []) as PresensiRekap[];
  }

  const presensiMap = new Map<string, PresensiRekap>();

  for (const item of presensiData) {
    presensiMap.set(`${item.kegiatan_id}:${item.mudamudi_id}`, item);
  }

  const snapshotTargetMap = new Map<number, Set<number>>();

  for (const snapshot of snapshotData) {
    if (!snapshotTargetMap.has(snapshot.kegiatan_id)) {
      snapshotTargetMap.set(snapshot.kegiatan_id, new Set<number>());
    }

    snapshotTargetMap.get(snapshot.kegiatan_id)!.add(snapshot.mudamudi_id);
  }

  const kehadiran = kegiatanData.flatMap((kegiatan) =>
    mudamudiDataPaginated.map((mudamudi) => {
      const key = `${kegiatan.id}:${mudamudi.id}`;
      const presensi = presensiMap.get(key);

      const targeted =
        kegiatan.target_frozen_at !== null
          ? snapshotTargetMap.get(kegiatan.id)?.has(mudamudi.id) ?? false
          : mudamudi.deleted_at === null &&
          isMudamudiTargeted(kegiatan, mudamudi);

      if (!targeted) {
        return {
          kegiatan_id: kegiatan.id,
          mudamudi_id: mudamudi.id,
          status: "tidak_berlaku" as RekapitulasiStatus,
          metode: null,
          waktu_checkin: null,
          keterangan: null,
        };
      }

      return {
        kegiatan_id: kegiatan.id,
        mudamudi_id: mudamudi.id,
        status: (presensi?.status ?? "alpa") as RekapitulasiStatus,
        metode: (presensi?.metode ?? null) as PresensiMetode | null,
        waktu_checkin: presensi?.waktu_checkin ?? null,
        keterangan: presensi?.keterangan ?? null,
      };
    }),
  );

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
    kehadiran,
  };

  return {
    data: result,
    pagination: {
      page: currentPage,
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
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, desa, kelompok, kelas, jenjang, jenis_kelamin, target_frozen_at",
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
