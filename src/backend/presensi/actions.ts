"use server";

import {
  getKegiatanById as getKegiatanByIdPublic,
  submitPresensi as submitPresensiPublic,
  getDeviceStatus as getDeviceStatusPublic,
  verifyIdentity as verifyIdentityPublic,
  registerDevice as registerDevicePublic,
  changeDeviceAccount as changeDeviceAccountPublic,
} from "./public";

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

export async function getKegiatanById(kegiatanId: number) {
  return getKegiatanByIdPublic(kegiatanId);
}

export async function getDeviceStatus(deviceToken: string | null) {
  return getDeviceStatusPublic(deviceToken);
}

export async function verifyIdentity(identity: {
  nama: string;
  tanggalLahir: string;
}) {
  return verifyIdentityPublic(identity);
}

export async function registerDevice(mudamudiId: number) {
  return registerDevicePublic(mudamudiId);
}

export async function changeDeviceAccount(
  deviceToken: string,
  mudamudiId: number,
) {
  return changeDeviceAccountPublic(deviceToken, mudamudiId);
}

export async function submitPresensi(
  deviceToken: string | null,
  kegiatanId: number,
  identity?: {
    nama: string;
    tanggalLahir: string;
  },
) {
  return submitPresensiPublic(deviceToken, kegiatanId, identity);
}

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
