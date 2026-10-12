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
import { PresensiStatus } from "./types";

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

export async function getRekapitulasiPresensi(input: {
  page: number;
  itemsPerPage: number;
  search?: string;
  bulan?: string;
  kegiatanId?: number;
  desa?: string;
  kelompok?: string;
  kelas?: string;
}) {
  return getRekapitulasiPresensiAdmin(input);
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
