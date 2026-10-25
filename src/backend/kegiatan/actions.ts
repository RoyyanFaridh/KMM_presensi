"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";

import {
  DESA_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
  KELAS_OPTIONS,
  KELOMPOK_BY_DESA,
} from "../mudamudi/constants";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function normalizeArray(values: string[]) {
  return [...values].map(normalize).filter(Boolean).sort();
}

function sameArray(
  first: string[] | null | undefined,
  second: string[] | null | undefined,
) {
  const firstNormalized = normalizeArray(first ?? []);
  const secondNormalized = normalizeArray(second ?? []);

  if (firstNormalized.length !== secondNormalized.length) {
    return false;
  }

  return firstNormalized.every(
    (value, index) => value === secondNormalized[index],
  );
}

function getStringArray(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function isValidValues(values: string[], allowedValues: readonly string[]) {
  return (
    values.every((value) => allowedValues.includes(value)) &&
    new Set(values).size === values.length
  );
}

/**
 * Menentukan kewenangan berdasarkan pembuat kegiatan.
 *
 * Admin Daerah dapat mengelola seluruh kegiatan.
 * Admin Desa hanya dapat mengelola kegiatan buatannya sendiri.
 *
 * Desa sasaran kegiatan tidak digunakan untuk menentukan kepemilikan.
 */
function canManageKegiatan(
  createdBy: string | null,
  userId: string,
  isSuperAdmin: boolean,
) {
  if (isSuperAdmin) {
    return true;
  }

  return Boolean(createdBy) && createdBy === userId;
}

function getAllowedKelompok(desa: string[]) {
  const kelompok = new Set<string>();

  for (const namaDesa of desa) {
    if (!DESA_OPTIONS.includes(namaDesa as (typeof DESA_OPTIONS)[number])) {
      continue;
    }

    const daftarKelompok =
      KELOMPOK_BY_DESA[namaDesa as keyof typeof KELOMPOK_BY_DESA];

    for (const namaKelompok of daftarKelompok) {
      kelompok.add(namaKelompok);
    }
  }

  return [...kelompok];
}

/**
 * NULL berarti seluruh kelompok pada desa sasaran.
 */
function normalizeKelompokSelection(
  desa: string[],
  kelompok: string[],
): string[] | null {
  if (kelompok.length === 0) {
    return null;
  }

  const allowedKelompok = getAllowedKelompok(desa);

  const semuaKelompokTerpilih =
    kelompok.length === allowedKelompok.length &&
    allowedKelompok.every((nama) => kelompok.includes(nama));

  if (semuaKelompokTerpilih) {
    return null;
  }

  return [...kelompok].sort();
}

function validateServer(
  nama: string,
  tanggalMulai: string,
  tanggalSelesai: string,
  jamMulai: string,
  jamSelesai: string,
  lokasi: string,
  desa: string[],
  kelompok: string[],
  kelas: string[],
  jenisKelamin: string,
  desaAdmin: string | null,
  isSuperAdmin: boolean,
) {
  if (!nama.trim()) {
    return "Nama kegiatan wajib diisi";
  }

  if (!tanggalMulai || !tanggalSelesai) {
    return "Tanggal mulai dan tanggal selesai wajib diisi";
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(tanggalMulai) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(tanggalSelesai) ||
    Number.isNaN(Date.parse(`${tanggalMulai}T00:00:00`)) ||
    Number.isNaN(Date.parse(`${tanggalSelesai}T00:00:00`))
  ) {
    return "Format tanggal tidak valid";
  }

  if (tanggalSelesai < tanggalMulai) {
    return "Tanggal selesai harus setelah atau sama dengan tanggal mulai";
  }

  if (!jamMulai || !jamSelesai) {
    return "Jam mulai dan jam selesai wajib diisi";
  }

  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(jamMulai) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(jamSelesai)
  ) {
    return "Format jam tidak valid";
  }

  if (tanggalMulai === tanggalSelesai && jamSelesai <= jamMulai) {
    return "Jam selesai harus setelah jam mulai";
  }

  if (!lokasi.trim()) {
    return "Lokasi wajib diisi";
  }

  if (desa.length === 0) {
    return "Pilih minimal satu desa";
  }

  if (!isValidValues(desa, DESA_OPTIONS)) {
    return "Pilihan desa tidak valid";
  }

  if (!isValidValues(kelompok, getAllowedKelompok(desa))) {
    return "Pilihan kelompok tidak valid atau tidak sesuai dengan desa";
  }

  if (!isValidValues(kelas, KELAS_OPTIONS)) {
    return "Pilihan kelas tidak valid";
  }

  if (
    jenisKelamin !== "" &&
    !JENIS_KELAMIN_OPTIONS.includes(
      jenisKelamin as (typeof JENIS_KELAMIN_OPTIONS)[number],
    )
  ) {
    return "Pilihan jenis kelamin tidak valid";
  }

  if (!isSuperAdmin) {
    if (
      !desaAdmin ||
      !DESA_OPTIONS.includes(desaAdmin as (typeof DESA_OPTIONS)[number])
    ) {
      return "Profil admin tidak memiliki kewenangan desa yang valid";
    }

    if (desa.length !== 1 || desa[0] !== desaAdmin) {
      return "Admin desa hanya dapat membuat kegiatan di desanya sendiri";
    }
  }

  return null;
}

/**
 * Mengambil informasi pembuat kegiatan dari admin_profiles.
 * Service-role client hanya digunakan di server.
 */
async function attachCreatorInfo<T extends { created_by?: string | null }>(
  kegiatan: T[],
  includeCreator: boolean,
) {
  if (!includeCreator || kegiatan.length === 0) {
    return kegiatan.map((item) => ({
      ...item,
      creator_nama: null as string | null,
      creator_desa: null as string | null,
      creator_label: item.created_by
        ? "Informasi pembuat tidak tersedia"
        : "Belum tercatat",
    }));
  }

  const creatorIds = [
    ...new Set(
      kegiatan
        .map((item) => item.created_by)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (creatorIds.length === 0) {
    return kegiatan.map((item) => ({
      ...item,
      creator_nama: null as string | null,
      creator_desa: null as string | null,
      creator_label: "Belum tercatat",
    }));
  }

  const adminClient = createAdminClient();

  const { data: profiles, error } = await adminClient
    .from("admin_profiles")
    .select("id, nama, desa")
    .in("id", creatorIds);

  if (error) {
    throw new Error("Gagal mengambil informasi pembuat kegiatan.");
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  return kegiatan.map((item) => {
    const profile = item.created_by ? profileMap.get(item.created_by) : null;

    let creatorLabel = "Belum tercatat";

    if (item.created_by && !profile) {
      creatorLabel = "Pembuat tidak ditemukan";
    } else if (profile) {
      creatorLabel = profile.desa
        ? `Admin Desa ${profile.desa}`
        : "Admin Daerah";
    }

    return {
      ...item,
      creator_nama: profile?.nama ?? null,
      creator_desa: profile?.desa ?? null,
      creator_label: creatorLabel,
    };
  });
}

/**
 * Mengambil daftar kegiatan sesuai kewenangan admin.
 *
 * Admin Daerah:
 * - Dapat melihat semua kegiatan.
 *
 * Admin Desa:
 * - Hanya dapat melihat kegiatan dengan created_by
 *   yang sama dengan ID akun yang sedang login.
 */
export async function getKegiatan() {
  const { user, isSuperAdmin } = await requireAdmin();
  const supabase = await createClient();

  let query = supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, desa, kelompok, kelas, jenis_kelamin, created_at, created_by",
    )
    .order("tanggal_mulai", { ascending: false })
    .order("jam_mulai", { ascending: false });

  if (!isSuperAdmin) {
    query = query.eq("created_by", user.id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return attachCreatorInfo(data ?? [], true);
}

export async function addKegiatan(formData: FormData) {
  const { user, desa: desaAdmin, isSuperAdmin } = await requireAdmin();

  const supabase = await createClient();

  const nama = String(formData.get("nama") ?? "").trim();
  const tanggalMulai = String(formData.get("tanggal_mulai") ?? "").trim();
  const tanggalSelesai = String(formData.get("tanggal_selesai") ?? "").trim();
  const jamMulai = String(formData.get("jam_mulai") ?? "").trim();
  const jamSelesai = String(formData.get("jam_selesai") ?? "").trim();
  const lokasi = String(formData.get("lokasi") ?? "").trim();

  const desa = isSuperAdmin
    ? getStringArray(formData, "desa")
    : desaAdmin
      ? [desaAdmin]
      : [];

  const kelompok = getStringArray(formData, "kelompok");
  const kelas = getStringArray(formData, "kelas");
  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();

  const validationError = validateServer(
    nama,
    tanggalMulai,
    tanggalSelesai,
    jamMulai,
    jamSelesai,
    lokasi,
    desa,
    kelompok,
    kelas,
    jenisKelamin,
    desaAdmin,
    isSuperAdmin,
  );

  if (validationError) {
    return { error: validationError };
  }

  const kelompokTersimpan = normalizeKelompokSelection(desa, kelompok);

  const { data: candidates, error: candidatesError } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, desa, kelompok, kelas, jenis_kelamin",
    )
    .eq("tanggal_mulai", tanggalMulai)
    .eq("tanggal_selesai", tanggalSelesai);

  if (candidatesError) {
    return { error: candidatesError.message };
  }

  const isDuplicate = (candidates ?? []).some(
    (item) =>
      normalize(item.nama) === normalize(nama) &&
      item.jam_mulai === jamMulai &&
      item.jam_selesai === jamSelesai &&
      normalize(item.lokasi ?? "") === normalize(lokasi) &&
      sameArray(item.desa, desa) &&
      sameArray(item.kelompok, kelompokTersimpan) &&
      sameArray(item.kelas, kelas) &&
      (item.jenis_kelamin ?? "") === jenisKelamin,
  );

  if (isDuplicate) {
    return { error: "Kegiatan dengan data yang sama sudah ada" };
  }

  const { error } = await supabase.from("kegiatan").insert({
    nama,
    tanggal_mulai: tanggalMulai,
    tanggal_selesai: tanggalSelesai,
    jam_mulai: jamMulai,
    jam_selesai: jamSelesai,
    lokasi,
    desa,
    kelompok: kelompokTersimpan,
    kelas: kelas.length > 0 ? kelas : null,
    jenis_kelamin: jenisKelamin || null,
    created_by: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/kegiatan");
  revalidatePath("/admin");

  return { success: true };
}

export async function updateKegiatan(id: number, formData: FormData) {
  const { user, desa: desaAdmin, isSuperAdmin } = await requireAdmin();

  const supabase = await createClient();

  if (!Number.isSafeInteger(id) || id <= 0) {
    return { error: "ID kegiatan tidak valid" };
  }

  const nama = String(formData.get("nama") ?? "").trim();
  const tanggalMulai = String(formData.get("tanggal_mulai") ?? "").trim();
  const tanggalSelesai = String(formData.get("tanggal_selesai") ?? "").trim();
  const jamMulai = String(formData.get("jam_mulai") ?? "").trim();
  const jamSelesai = String(formData.get("jam_selesai") ?? "").trim();
  const lokasi = String(formData.get("lokasi") ?? "").trim();

  const desa = isSuperAdmin
    ? getStringArray(formData, "desa")
    : desaAdmin
      ? [desaAdmin]
      : [];

  const kelompok = getStringArray(formData, "kelompok");
  const kelas = getStringArray(formData, "kelas");
  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();

  const validationError = validateServer(
    nama,
    tanggalMulai,
    tanggalSelesai,
    jamMulai,
    jamSelesai,
    lokasi,
    desa,
    kelompok,
    kelas,
    jenisKelamin,
    desaAdmin,
    isSuperAdmin,
  );

  if (validationError) {
    return { error: validationError };
  }

  const { data: existing, error: existingError } = await supabase
    .from("kegiatan")
    .select("id, created_by")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return { error: existingError.message };
  }

  if (!existing) {
    return { error: "Kegiatan tidak ditemukan" };
  }

  if (!canManageKegiatan(existing.created_by, user.id, isSuperAdmin)) {
    return {
      error: "Kamu tidak memiliki kewenangan untuk mengubah kegiatan ini",
    };
  }

  const kelompokTersimpan = normalizeKelompokSelection(desa, kelompok);

  const { data: candidates, error: candidatesError } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, desa, kelompok, kelas, jenis_kelamin",
    )
    .eq("tanggal_mulai", tanggalMulai)
    .eq("tanggal_selesai", tanggalSelesai)
    .neq("id", id);

  if (candidatesError) {
    return { error: candidatesError.message };
  }

  const isDuplicate = (candidates ?? []).some(
    (item) =>
      normalize(item.nama) === normalize(nama) &&
      item.jam_mulai === jamMulai &&
      item.jam_selesai === jamSelesai &&
      normalize(item.lokasi ?? "") === normalize(lokasi) &&
      sameArray(item.desa, desa) &&
      sameArray(item.kelompok, kelompokTersimpan) &&
      sameArray(item.kelas, kelas) &&
      (item.jenis_kelamin ?? "") === jenisKelamin,
  );

  if (isDuplicate) {
    return { error: "Kegiatan dengan data yang sama sudah ada" };
  }

  const { data: updated, error } = await supabase
    .from("kegiatan")
    .update({
      nama,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      lokasi,
      desa,
      kelompok: kelompokTersimpan,
      kelas: kelas.length > 0 ? kelas : null,
      jenis_kelamin: jenisKelamin || null,
    })
    .eq("id", id)
    .select("id");

  if (error) {
    return { error: error.message };
  }

  if (!updated || updated.length === 0) {
    return {
      error: "Kegiatan gagal diperbarui. Periksa kembali kewenangan admin.",
    };
  }

  revalidatePath("/admin/kegiatan");
  revalidatePath("/admin");

  return { success: true };
}

export async function deleteKegiatan(id: number) {
  const { user, isSuperAdmin } = await requireAdmin();

  const supabase = await createClient();

  if (!Number.isSafeInteger(id) || id <= 0) {
    return { error: "ID kegiatan tidak valid" };
  }

  const { data: existing, error: existingError } = await supabase
    .from("kegiatan")
    .select("id, created_by")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return { error: existingError.message };
  }

  if (!existing) {
    return { error: "Kegiatan tidak ditemukan" };
  }

  if (!canManageKegiatan(existing.created_by, user.id, isSuperAdmin)) {
    return {
      error: "Kamu tidak memiliki kewenangan untuk menghapus kegiatan ini",
    };
  }

  const { data: deleted, error } = await supabase
    .from("kegiatan")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    return { error: error.message };
  }

  if (!deleted || deleted.length === 0) {
    return {
      error: "Kegiatan gagal dihapus. Periksa kembali kewenangan admin.",
    };
  }

  revalidatePath("/admin/kegiatan");
  revalidatePath("/admin");

  return { success: true };
}

export async function getKegiatanFormContext() {
  const { desa, isSuperAdmin } = await requireAdmin();

  return {
    desaAdmin: desa,
    isSuperAdmin,
  };
}
