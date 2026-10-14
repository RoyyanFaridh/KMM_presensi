"use server";

import {
  getPresensiSummary as getPresensiSummaryDashboard,
  getKegiatanPresensi as getKegiatanPresensiDashboard,
  getPresensiTerbaru as getPresensiTerbaruDashboard,
} from "./dashboard";

import { getMonitoringPresensi as getMonitoringPresensiAdmin } from "./monitoring";
import { getRekapitulasiPresensi as getRekapitulasiPresensiAdmin } from "./rekapitulasi";
import { createManualPresensi as createManualPresensiAdmin } from "./manual";
import { updatePresensiStatus as updatePresensiStatusAdmin } from "./update";
import type { PresensiStatus } from "./types";

type FilterValue = string | string[];

type RekapitulasiFilters = {
  search?: string;
  bulan?: string;
  kegiatanId?: number;
  desa?: FilterValue;
  kelompok?: FilterValue;
  kelas?: FilterValue;
};

export async function getPresensiSummary() {
  return getPresensiSummaryDashboard();
}

export async function getKegiatanPresensi() {
  return getKegiatanPresensiDashboard();
}

export async function getPresensiTerbaru() {
  return getPresensiTerbaruDashboard();
}

export async function getMonitoringPresensi(kegiatanId: number) {
  return getMonitoringPresensiAdmin(kegiatanId);
}

export async function getRekapitulasiPresensi(
  input: RekapitulasiFilters & {
    page: number;
    itemsPerPage: number;
  },
) {
  return getRekapitulasiPresensiAdmin(input);
}

/**
 * Mengambil seluruh data rekapitulasi untuk kebutuhan ekspor Excel.
 * Data diambil per halaman agar ekspor tidak terbatas pada halaman tabel
 * yang sedang ditampilkan.
 */
export async function getRekapitulasiPresensiExport(
  input: RekapitulasiFilters,
) {
  const itemsPerPage = 100;

  const firstResult = await getRekapitulasiPresensiAdmin({
    ...input,
    page: 1,
    itemsPerPage,
  });

  if ("error" in firstResult) {
    return firstResult;
  }

  const totalPages = firstResult.pagination.totalPages;
  const allResults = [firstResult];

  for (let page = 2; page <= totalPages; page++) {
    const result = await getRekapitulasiPresensiAdmin({
      ...input,
      page,
      itemsPerPage,
    });

    if ("error" in result) {
      return result;
    }

    allResults.push(result);
  }

  return {
    data: {
      mudamudi: allResults.flatMap((result) => result.data.mudamudi),
      kegiatan: firstResult.data.kegiatan,
      kehadiran: allResults.flatMap((result) => result.data.kehadiran),
    },
    pagination: {
      page: 1,
      itemsPerPage,
      totalItems: firstResult.pagination.totalItems,
      totalPages,
    },
  };
}

export async function createManualPresensi(input: {
  kegiatanId: number;
  mudamudiId: number;
  status: PresensiStatus;
  keterangan?: string | null;
}) {
  return createManualPresensiAdmin(input);
}

export async function updatePresensiStatus(input: {
  presensiId: number | null;
  kegiatanId: number;
  mudamudiId: number;
  status: PresensiStatus;
  keterangan?: string | null;
}) {
  return updatePresensiStatusAdmin(input);
}
