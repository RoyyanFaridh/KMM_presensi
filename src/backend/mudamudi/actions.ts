"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import { requireAdmin } from "../auth/admin";
import { toTitleCase } from "./format";
import {
  DESA_OPTIONS,
  KELOMPOK_BY_DESA,
  JENIS_KELAMIN_OPTIONS,
} from "./constants";
import {
  parseImportExcel,
  type ImportRow,
  type ImportWarning,
} from "./importExcel";

type ActionResult = {
  success?: boolean;
  error?: string;
};

export type ImportPreviewResult = {
  success: boolean;
  error?: string;
  data: ImportRow[];
  errors: Array<{
    rowNumber: number;
    message: string;
  }>;
  warnings: ImportWarning[];
};

/* =========================================================
   VALIDATION HELPERS
========================================================= */

function isValidDesa(desa: string): boolean {
  return DESA_OPTIONS.includes(desa as (typeof DESA_OPTIONS)[number]);
}

function isValidKelompok(desa: string, kelompok: string): boolean {
  if (!isValidDesa(desa)) {
    return false;
  }

  const options = KELOMPOK_BY_DESA[desa as keyof typeof KELOMPOK_BY_DESA];

  return options.includes(kelompok as never);
}

function isValidJenisKelamin(jenisKelamin: string): boolean {
  return JENIS_KELAMIN_OPTIONS.includes(jenisKelamin);
}

/**
 * Validasi tambah/edit manual.
 *
 * Kelas, umur, dan tanggal lahir berdiri sendiri.
 * Ketiganya opsional dan tidak dihitung dari satu sama lain.
 */
function validate(
  nama: string,
  desa: string,
  kelompok: string,
  jenisKelamin: string,
  kelas: string,
  umurRaw: string,
  tanggalLahir: string,
): string | null {
  if (!nama.trim()) {
    return "Nama wajib diisi";
  }

  if (/\d/.test(nama)) {
    return "Nama tidak boleh mengandung angka";
  }

  if (!isValidDesa(desa)) {
    return "Desa tidak valid";
  }

  if (!isValidKelompok(desa, kelompok)) {
    return "Kelompok tidak sesuai dengan desa";
  }

  if (!isValidJenisKelamin(jenisKelamin)) {
    return "Jenis kelamin wajib dipilih";
  }

  // Kelas opsional. Tidak bergantung pada umur atau tanggal lahir.
  // Nilai yang kosong diperbolehkan.

  // Umur opsional dan diisi secara manual.
  if (umurRaw !== "") {
    const umur = Number(umurRaw);

    if (!Number.isInteger(umur) || umur < 0) {
      return "Umur harus berupa bilangan bulat minimal 0";
    }
  }

  // Tanggal lahir opsional dan tidak digunakan untuk menghitung umur.
  if (tanggalLahir !== "") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tanggalLahir);

    if (!match) {
      return "Format tanggal lahir tidak valid";
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const birthDate = new Date(year, month - 1, day);

    if (
      birthDate.getFullYear() !== year ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day
    ) {
      return "Tanggal lahir tidak valid";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (birthDate > today) {
      return "Tanggal lahir tidak boleh di masa depan";
    }
  }

  return null;
}

function normalizeForCompare(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Kunci pembanding duplikat untuk data import.
 */
function createDuplicateKey(row: {
  nama: string;
  desa: string | null;
  kelas: string | null;
  kelompok: string | null;
}): string {
  return [
    normalizeForCompare(row.nama),
    normalizeForCompare(row.desa),
    normalizeForCompare(row.kelas),
    normalizeForCompare(row.kelompok),
  ].join("|");
}

/**
 * Mengubah hasil parser Excel menjadi format untuk Supabase.
 *
 * Aturan import tetap mengikuti parseImportExcel().
 */
function mapImportRow(row: ImportRow) {
  return {
    nama: toTitleCase(row.nama.trim()),
    desa: row.desa.trim(),
    kelompok: row.kelompok.trim(),
    jenis_kelamin: row.jenis_kelamin.trim(),
    tempat_lahir: row.tempat_lahir?.trim() || null,
    tanggal_lahir: row.tanggal_lahir || null,
    umur: row.umur ?? null,
    no_hp: row.no_hp?.trim() || null,
    pekerjaan: row.pekerjaan?.trim() || null,
    kelas: row.kelas?.trim() || null,
    nama_ayah: row.nama_ayah?.trim() || null,
    nama_ibu: row.nama_ibu?.trim() || null,
    no_hp_ortu: row.no_hp_ortu?.trim() || null,
    alamat: row.alamat?.trim() || null,
  };
}

/**
 * Membaca field opsional dari form.
 *
 * Nilai kosong diubah menjadi null agar sesuai dengan kolom
 * database yang mengizinkan NULL.
 */
function readOptionalFields(formData: FormData) {
  const kelasRaw = String(formData.get("kelas") ?? "").trim();
  const umurRaw = String(formData.get("umur") ?? "").trim();
  const tanggalLahir = String(formData.get("tanggal_lahir") ?? "").trim();

  return {
    kelas: kelasRaw || null,
    umur: umurRaw === "" ? null : Number(umurRaw),
    umurRaw,
    tanggalLahir: tanggalLahir || null,
  };
}

/* =========================================================
   ADD MUDAMUDI
========================================================= */

export async function addMudamudi(formData: FormData): Promise<ActionResult> {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();
  const supabase = await createClient();

  const namaRaw = String(formData.get("nama") ?? "").trim();
  const requestedDesa = String(formData.get("desa") ?? "").trim();
  const kelompok = String(formData.get("kelompok") ?? "").trim();
  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();

  const optionalFields = readOptionalFields(formData);
  const { kelas, umur, umurRaw, tanggalLahir } = optionalFields;

  // Admin desa tidak boleh menentukan desa di luar wilayahnya.
  const desa = isSuperAdmin ? requestedDesa : (adminDesa ?? "");

  if (!isSuperAdmin && !adminDesa) {
    return { error: "Desa admin tidak valid" };
  }

  const validationError = validate(
    namaRaw,
    desa,
    kelompok,
    jenisKelamin,
    kelas ?? "",
    umurRaw,
    tanggalLahir ?? "",
  );

  if (validationError) {
    return { error: validationError };
  }

  const nama = toTitleCase(namaRaw);

  // Cari kandidat pada desa dan kelompok yang sama.
  // Kelas tidak difilter di query karena boleh bernilai NULL.
  const { data: candidates, error: candidateError } = await supabase
    .from("mudamudi")
    .select("id, nama, kelas")
    .eq("kelompok", kelompok)
    .eq("desa", desa);

  if (candidateError) {
    console.error("addMudamudi candidate query error:", candidateError);
    return { error: "Gagal memeriksa duplikasi data Muda-Mudi" };
  }

  const normalizedNama = normalizeForCompare(nama);
  const normalizedKelas = normalizeForCompare(kelas);

  const isDuplicate =
    candidates?.some(
      (candidate) =>
        normalizeForCompare(candidate.nama) === normalizedNama &&
        normalizeForCompare(candidate.kelas) === normalizedKelas,
    ) ?? false;

  if (isDuplicate) {
    return {
      error: "Data dengan nama, kelas, dan kelompok yang sama sudah ada",
    };
  }

  const { error } = await supabase.from("mudamudi").insert({
    nama,
    desa,
    kelas,
    kelompok,
    jenis_kelamin: jenisKelamin,
    tempat_lahir: String(formData.get("tempat_lahir") ?? "").trim() || null,
    tanggal_lahir: tanggalLahir,
    umur,
    no_hp: String(formData.get("no_hp") ?? "").trim() || null,
    pekerjaan: String(formData.get("pekerjaan") ?? "").trim() || null,
    nama_ayah: String(formData.get("nama_ayah") ?? "").trim() || null,
    nama_ibu: String(formData.get("nama_ibu") ?? "").trim() || null,
    no_hp_ortu: String(formData.get("no_hp_ortu") ?? "").trim() || null,
    alamat: String(formData.get("alamat") ?? "").trim() || null,
  });

  if (error) {
    console.error("addMudamudi insert error:", error);

    if (error.code === "23505") {
      return { error: "Data dengan kombinasi ini sudah ada" };
    }

    if (error.code === "23502") {
      return {
        error:
          "Penyimpanan gagal karena ada kolom wajib database yang kosong. Periksa pengaturan kolom di Supabase.",
      };
    }

    return { error: "Gagal menyimpan data Muda-Mudi. Periksa log server." };
  }

  revalidatePath("/admin/mudamudi");

  return { success: true };
}

/* =========================================================
   UPDATE MUDAMUDI
========================================================= */

export async function updateMudamudi(
  id: number,
  formData: FormData,
): Promise<ActionResult> {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();
  const supabase = await createClient();

  if (!Number.isInteger(id) || id <= 0) {
    return { error: "ID Muda-Mudi tidak valid" };
  }

  if (!isSuperAdmin && !adminDesa) {
    return { error: "Desa admin tidak valid" };
  }

  const namaRaw = String(formData.get("nama") ?? "").trim();
  const requestedDesa = String(formData.get("desa") ?? "").trim();
  const kelompok = String(formData.get("kelompok") ?? "").trim();
  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();

  const optionalFields = readOptionalFields(formData);
  const { kelas, umur, umurRaw, tanggalLahir } = optionalFields;

  const desa = isSuperAdmin ? requestedDesa : (adminDesa ?? "");

  const validationError = validate(
    namaRaw,
    desa,
    kelompok,
    jenisKelamin,
    kelas ?? "",
    umurRaw,
    tanggalLahir ?? "",
  );

  if (validationError) {
    return { error: validationError };
  }

  let existingQuery = supabase.from("mudamudi").select("id, desa").eq("id", id);

  if (!isSuperAdmin) {
    existingQuery = existingQuery.eq("desa", adminDesa);
  }

  const { data: existing, error: existingError } =
    await existingQuery.maybeSingle();

  if (existingError) {
    console.error("updateMudamudi existing query error:", existingError);
    return { error: "Gagal memeriksa data Muda-Mudi" };
  }

  if (!existing) {
    return {
      error: "Data Muda-Mudi tidak ditemukan atau tidak dapat diakses",
    };
  }

  if (!isSuperAdmin && existing.desa !== adminDesa) {
    return {
      error: "Anda tidak memiliki akses ke data Muda-Mudi desa ini",
    };
  }

  const nama = toTitleCase(namaRaw);

  // Kelas dapat NULL, sehingga pemeriksaan duplikat dilakukan
  // dengan mengambil kandidat berdasarkan desa dan kelompok.
  const { data: candidates, error: candidateError } = await supabase
    .from("mudamudi")
    .select("id, nama, kelas")
    .eq("kelompok", kelompok)
    .eq("desa", desa)
    .neq("id", id);

  if (candidateError) {
    console.error("updateMudamudi candidate query error:", candidateError);
    return { error: "Gagal memeriksa duplikasi data Muda-Mudi" };
  }

  const normalizedNama = normalizeForCompare(nama);
  const normalizedKelas = normalizeForCompare(kelas);

  const isDuplicate =
    candidates?.some(
      (candidate) =>
        normalizeForCompare(candidate.nama) === normalizedNama &&
        normalizeForCompare(candidate.kelas) === normalizedKelas,
    ) ?? false;

  if (isDuplicate) {
    return {
      error: "Data dengan nama, kelas, dan kelompok yang sama sudah ada",
    };
  }

  const { error } = await supabase
    .from("mudamudi")
    .update({
      nama,
      desa,
      kelas,
      kelompok,
      jenis_kelamin: jenisKelamin,
      tempat_lahir: String(formData.get("tempat_lahir") ?? "").trim() || null,
      tanggal_lahir: tanggalLahir,
      umur,
      no_hp: String(formData.get("no_hp") ?? "").trim() || null,
      pekerjaan: String(formData.get("pekerjaan") ?? "").trim() || null,
      nama_ayah: String(formData.get("nama_ayah") ?? "").trim() || null,
      nama_ibu: String(formData.get("nama_ibu") ?? "").trim() || null,
      no_hp_ortu: String(formData.get("no_hp_ortu") ?? "").trim() || null,
      alamat: String(formData.get("alamat") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) {
    console.error("updateMudamudi update error:", error);

    if (error.code === "23505") {
      return { error: "Data dengan kombinasi ini sudah ada" };
    }

    if (error.code === "23502") {
      return {
        error:
          "Pembaruan gagal karena ada kolom wajib database yang kosong. Periksa pengaturan kolom di Supabase.",
      };
    }

    return { error: "Gagal memperbarui data Muda-Mudi. Periksa log server." };
  }

  revalidatePath("/admin/mudamudi");

  return { success: true };
}

/* =========================================================
   DELETE MUDAMUDI
========================================================= */

export async function deleteMudamudi(id: number): Promise<ActionResult> {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();
  const supabase = await createClient();

  if (!Number.isInteger(id) || id <= 0) {
    return { error: "ID Muda-Mudi tidak valid" };
  }

  if (!isSuperAdmin && !adminDesa) {
    return { error: "Desa admin tidak valid" };
  }

  let query = supabase.from("mudamudi").delete().eq("id", id);

  if (!isSuperAdmin) {
    query = query.eq("desa", adminDesa);
  }

  const { data, error } = await query.select("id");

  if (error) {
    console.error("deleteMudamudi error:", error);
    return { error: "Gagal menghapus data Muda-Mudi" };
  }

  if (!data || data.length === 0) {
    return {
      error: "Data Muda-Mudi tidak ditemukan atau tidak dapat diakses",
    };
  }

  revalidatePath("/admin/mudamudi");

  return { success: true };
}

/* =========================================================
   GET MUDAMUDI
========================================================= */

export async function getMudamudi() {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();
  const supabase = await createClient();

  if (!isSuperAdmin && !adminDesa) {
    return { data: [], error: "Desa admin tidak valid" };
  }

  let query = supabase.from("mudamudi").select("*");

  if (!isSuperAdmin) {
    query = query.eq("desa", adminDesa);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("getMudamudi error:", error);
    return { data: [], error: "Gagal mengambil data Muda-Mudi" };
  }

  return { data: data ?? [], error: null };
}

/* =========================================================
   SEARCH NAME
========================================================= */

export async function searchMudamudiNames(query: string) {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();
  const supabase = await createClient();

  const keyword = query.trim();

  if (!keyword) {
    return { data: [], error: null };
  }

  if (!isSuperAdmin && !adminDesa) {
    return { data: [], error: "Desa admin tidak valid" };
  }

  let searchQuery = supabase
    .from("mudamudi")
    .select("id, nama, desa, kelompok")
    .ilike("nama", `%${keyword}%`);

  if (!isSuperAdmin) {
    searchQuery = searchQuery.eq("desa", adminDesa);
  }

  const { data, error } = await searchQuery
    .order("nama", { ascending: true })
    .limit(5);

  if (error) {
    console.error("searchMudamudiNames error:", error);
    return { data: [], error: "Gagal mencari nama Muda-Mudi" };
  }

  return { data: data ?? [], error: null };
}

/* =========================================================
   PREVIEW IMPORT
========================================================= */

export async function previewImportMudamudi(
  formData: FormData,
): Promise<ImportPreviewResult> {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      success: false,
      error: "File Excel belum dipilih",
      data: [],
      errors: [],
      warnings: [],
    };
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return {
      success: false,
      error: "Format file harus .xlsx",
      data: [],
      errors: [],
      warnings: [],
    };
  }

  if (!isSuperAdmin && !adminDesa) {
    return {
      success: false,
      error: "Desa admin tidak valid",
      data: [],
      errors: [],
      warnings: [],
    };
  }

  try {
    const result = await parseImportExcel(file);

    if (isSuperAdmin) {
      return {
        success: true,
        data: result.data,
        errors: result.errors,
        warnings: result.warnings,
      };
    }

    const scopedData: ImportRow[] = [];
    const scopedErrors = [...result.errors];

    for (const row of result.data) {
      if (row.desa.trim() !== adminDesa) {
        scopedErrors.push({
          rowNumber: 0,
          message: `Desa harus ${adminDesa}. Data "${row.nama}" tidak dapat dipratinjau oleh admin desa ini.`,
        });

        continue;
      }

      scopedData.push(row);
    }

    return {
      success: true,
      data: scopedData,
      errors: scopedErrors,
      warnings: result.warnings,
    };
  } catch (error) {
    console.error("previewImportMudamudi error:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal membaca file Excel",
      data: [],
      errors: [],
      warnings: [],
    };
  }
}

/* =========================================================
   IMPORT
========================================================= */

export async function importMudamudi(formData: FormData): Promise<
  ActionResult & {
    imported?: number;
    skipped?: number;
    warnings?: ImportWarning[];
  }
> {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();
  const supabase = await createClient();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { error: "File Excel belum dipilih" };
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return { error: "Format file harus .xlsx" };
  }

  if (!isSuperAdmin && !adminDesa) {
    return { error: "Desa admin tidak valid" };
  }

  try {
    const result = await parseImportExcel(file);

    if (result.data.length === 0) {
      if (result.errors.length > 0) {
        return {
          error:
            "Tidak ada data yang dapat diimpor. Semua baris memiliki masalah pada kolom wajib atau duplikat dalam file.",
          imported: 0,
          skipped: result.errors.length,
          warnings: result.warnings,
        };
      }

      return {
        error: "Tidak ada data yang dapat diimpor.",
        imported: 0,
        skipped: 0,
        warnings: result.warnings,
      };
    }

    let scopedRows = result.data;

    if (!isSuperAdmin) {
      scopedRows = result.data.filter((row) => row.desa.trim() === adminDesa);
    }

    const unauthorizedCount = result.data.length - scopedRows.length;

    if (scopedRows.length === 0) {
      return {
        error: `Tidak ada data ${adminDesa} yang dapat diimpor.`,
        imported: 0,
        skipped: result.errors.length + unauthorizedCount,
        warnings: result.warnings,
      };
    }

    // Import tetap mengikuti hasil parser Excel.
    const rows = scopedRows.map(mapImportRow);

    let existingQuery = supabase
      .from("mudamudi")
      .select("id, nama, desa, kelas, kelompok");

    if (!isSuperAdmin) {
      existingQuery = existingQuery.eq("desa", adminDesa);
    }

    const { data: existingData, error: existingError } = await existingQuery;

    if (existingError) {
      console.error("importMudamudi existing query error:", existingError);
      return { error: "Gagal memeriksa data yang sudah terdaftar" };
    }

    const existingKeys = new Set<string>();

    for (const item of existingData ?? []) {
      existingKeys.add(
        createDuplicateKey({
          nama: item.nama,
          desa: item.desa,
          kelas: item.kelas,
          kelompok: item.kelompok,
        }),
      );
    }

    const rowsToInsert: ReturnType<typeof mapImportRow>[] = [];
    let duplicateCount = 0;

    for (const row of rows) {
      const key = createDuplicateKey({
        nama: row.nama,
        desa: row.desa,
        kelas: row.kelas,
        kelompok: row.kelompok,
      });

      if (existingKeys.has(key)) {
        duplicateCount++;
        continue;
      }

      // Mencegah duplikat antarbari​​s dalam file yang sama.
      existingKeys.add(key);
      rowsToInsert.push(row);
    }

    const skipped = result.errors.length + duplicateCount + unauthorizedCount;

    if (rowsToInsert.length === 0) {
      return {
        error:
          "Semua data sudah terdaftar, berasal dari desa lain, atau tidak memenuhi validasi.",
        imported: 0,
        skipped,
        warnings: result.warnings,
      };
    }

    const batchSize = 100;
    let imported = 0;

    for (let index = 0; index < rowsToInsert.length; index += batchSize) {
      const batch = rowsToInsert.slice(index, index + batchSize);

      const { error } = await supabase.from("mudamudi").insert(batch);

      if (error) {
        console.error("Import batch error:", error);

        return {
          error:
            error.code === "23502"
              ? "Import gagal karena kolom wajib database masih bernilai NULL. Periksa kolom wajib di Supabase."
              : error.code === "23505"
                ? "Import gagal karena terdapat data duplikat."
                : "Import gagal menyimpan data. Periksa log server.",
          imported,
          skipped: skipped + (rowsToInsert.length - imported - batch.length),
          warnings: result.warnings,
        };
      }

      imported += batch.length;
    }

    revalidatePath("/admin/mudamudi");

    return {
      success: true,
      imported,
      skipped,
      warnings: result.warnings,
    };
  } catch (error) {
    console.error("importMudamudi error:", error);

    return {
      error:
        error instanceof Error ? error.message : "Gagal mengimpor data Excel",
    };
  }
}
