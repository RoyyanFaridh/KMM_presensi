"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "../supabase/server";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function validateServer(
  nama: string,
  tanggalMulai: string,
  tanggalSelesai: string,
  jamMulai: string,
  jamSelesai: string,
  lokasi: string,
) {
  if (!nama.trim()) {
    return "Nama kegiatan wajib diisi";
  }

  if (!tanggalMulai) {
    return "Tanggal mulai wajib diisi";
  }

  if (!tanggalSelesai) {
    return "Tanggal selesai wajib diisi";
  }

  if (tanggalSelesai < tanggalMulai) {
    return "Tanggal selesai harus setelah atau sama dengan tanggal mulai";
  }

  if (!jamMulai) {
    return "Jam mulai wajib diisi";
  }

  if (!jamSelesai) {
    return "Jam selesai wajib diisi";
  }

  if (tanggalMulai === tanggalSelesai && jamSelesai <= jamMulai) {
    return "Jam selesai harus setelah jam mulai";
  }

  if (!lokasi.trim()) {
    return "Lokasi wajib diisi";
  }

  return null;
}

export async function getKegiatan() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, created_at",
    )
    .order("tanggal_mulai", { ascending: false })
    .order("jam_mulai", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function addKegiatan(formData: FormData) {
  const supabase = await createClient();

  const namaRaw = String(formData.get("nama") ?? "");
  const tanggalMulai = String(formData.get("tanggal_mulai") ?? "");
  const tanggalSelesai = String(formData.get("tanggal_selesai") ?? "");
  const jamMulai = String(formData.get("jam_mulai") ?? "");
  const jamSelesai = String(formData.get("jam_selesai") ?? "");
  const lokasiRaw = String(formData.get("lokasi") ?? "");

  const nama = namaRaw.trim();
  const lokasi = lokasiRaw.trim();

  const validationError = validateServer(
    nama,
    tanggalMulai,
    tanggalSelesai,
    jamMulai,
    jamSelesai,
    lokasi,
  );

  if (validationError) {
    return { error: validationError };
  }

  const { data: candidates } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi",
    )
    .eq("tanggal_mulai", tanggalMulai)
    .eq("tanggal_selesai", tanggalSelesai);

  const isDuplicate = candidates?.some(
    (item) =>
      normalize(item.nama) === normalize(nama) &&
      item.jam_mulai === jamMulai &&
      item.jam_selesai === jamSelesai &&
      normalize(item.lokasi) === normalize(lokasi),
  );

  if (isDuplicate) {
    return {
      error: "Kegiatan dengan data yang sama sudah ada",
    };
  }

  const { error } = await supabase.from("kegiatan").insert({
    nama,
    tanggal_mulai: tanggalMulai,
    tanggal_selesai: tanggalSelesai,
    jam_mulai: jamMulai,
    jam_selesai: jamSelesai,
    lokasi,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/kegiatan");

  return { success: true };
}

export async function updateKegiatan(id: number, formData: FormData) {
  const supabase = await createClient();

  const namaRaw = String(formData.get("nama") ?? "");
  const tanggalMulai = String(formData.get("tanggal_mulai") ?? "");
  const tanggalSelesai = String(formData.get("tanggal_selesai") ?? "");
  const jamMulai = String(formData.get("jam_mulai") ?? "");
  const jamSelesai = String(formData.get("jam_selesai") ?? "");
  const lokasiRaw = String(formData.get("lokasi") ?? "");

  const nama = namaRaw.trim();
  const lokasi = lokasiRaw.trim();

  const validationError = validateServer(
    nama,
    tanggalMulai,
    tanggalSelesai,
    jamMulai,
    jamSelesai,
    lokasi,
  );

  if (validationError) {
    return { error: validationError };
  }

  const { data: candidates } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi",
    )
    .eq("tanggal_mulai", tanggalMulai)
    .eq("tanggal_selesai", tanggalSelesai)
    .neq("id", id);

  const isDuplicate = candidates?.some(
    (item) =>
      normalize(item.nama) === normalize(nama) &&
      item.jam_mulai === jamMulai &&
      item.jam_selesai === jamSelesai &&
      normalize(item.lokasi) === normalize(lokasi),
  );

  if (isDuplicate) {
    return {
      error: "Kegiatan dengan data yang sama sudah ada",
    };
  }

  const { error } = await supabase
    .from("kegiatan")
    .update({
      nama,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      lokasi,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/kegiatan");

  return { success: true };
}

export async function deleteKegiatan(id: number) {
  const supabase = await createClient();

  const { error } = await supabase.from("kegiatan").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/kegiatan");

  return { success: true };
}
