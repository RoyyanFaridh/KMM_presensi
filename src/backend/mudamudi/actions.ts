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

function calculateAge(tanggalLahir: string): number | null {
  if (!tanggalLahir) {
    return null;
  }

  const birthDate = new Date(`${tanggalLahir}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : null;
}

function calculatekelas(umur: number | null): string {
  if (umur === null) {
    return "";
  }

  if (umur >= 5 && umur <= 6) {
    return "PAUD";
  }

  if (umur >= 7 && umur <= 12) {
    return "Caberawit";
  }

  if (umur >= 13 && umur <= 15) {
    return "Pra Remaja";
  }

  if (umur >= 16 && umur <= 18) {
    return "Remaja";
  }

  if (umur >= 19) {
    return "Usia Nikah";
  }

  return "";
}

function validate(
  nama: string,
  desa: string,
  kelompok: string,
  jenisKelamin: string,
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

  if (!tanggalLahir) {
    return "Tanggal lahir wajib diisi";
  }

  const date = new Date(`${tanggalLahir}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal lahir tidak valid";
  }

  const today = new Date();

  if (date > today) {
    return "Tanggal lahir tidak boleh melebihi tanggal hari ini";
  }

  const umur = calculateAge(tanggalLahir);

  if (umur === null) {
    return "Tanggal lahir tidak valid";
  }

  if (umur < 5) {
    return "Usia minimal Muda-Mudi adalah 5 tahun";
  }

  return null;
}

function normalizeForCompare(nama: string): string {
  return nama.trim().toLowerCase();
}

function mapImportRow(row: ImportRow) {
  return {
    nama: toTitleCase(row.nama.trim()),
    desa: row.desa.trim(),
    kelompok: row.kelompok.trim(),
    jenis_kelamin: row.jenis_kelamin.trim(),
    tempat_lahir: row.tempat_lahir?.trim() || null,
    tanggal_lahir: row.tanggal_lahir || null,
    umur: row.umur !== null ? row.umur : null,
    no_hp: row.no_hp?.trim() || null,
    pekerjaan: row.pekerjaan?.trim() || null,
    kelas: row.kelas?.trim() || null,
    nama_ayah: row.nama_ayah?.trim() || null,
    nama_ibu: row.nama_ibu?.trim() || null,
    no_hp_ortu: row.no_hp_ortu?.trim() || null,
    alamat: row.alamat?.trim() || null,
  };
}

export async function addMudamudi(formData: FormData): Promise<ActionResult> {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();

  const supabase = await createClient();

  const namaRaw = String(formData.get("nama") ?? "").trim();
  const requestedDesa = String(formData.get("desa") ?? "").trim();
  const kelompok = String(formData.get("kelompok") ?? "").trim();
  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();
  const tanggalLahir = String(formData.get("tanggal_lahir") ?? "").trim();

  const desa = isSuperAdmin ? requestedDesa : (adminDesa ?? "");

  if (!isSuperAdmin && !adminDesa) {
    return {
      error: "Desa admin tidak valid",
    };
  }

  const validationError = validate(
    namaRaw,
    desa,
    kelompok,
    jenisKelamin,
    tanggalLahir,
  );

  if (validationError) {
    return {
      error: validationError,
    };
  }

  const nama = toTitleCase(namaRaw);

  const umur = calculateAge(tanggalLahir);

  const kelas = calculatekelas(umur);

  if (!kelas) {
    return {
      error: "Kelas tidak dapat ditentukan dari usia",
    };
  }

  const { data: candidates, error: candidateError } = await supabase
    .from("mudamudi")
    .select("id, nama")
    .eq("kelas", kelas)
    .eq("kelompok", kelompok)
    .eq("desa", desa);

  if (candidateError) {
    return {
      error: candidateError.message,
    };
  }

  const isDuplicate =
    candidates?.some(
      (candidate) =>
        normalizeForCompare(candidate.nama) === normalizeForCompare(nama),
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
    if (error.code === "23505") {
      return {
        error: "Data dengan kombinasi ini sudah ada",
      };
    }

    return {
      error: error.message,
    };
  }

  revalidatePath("/admin/mudamudi");

  return {
    success: true,
  };
}

export async function updateMudamudi(
  id: number,
  formData: FormData,
): Promise<ActionResult> {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();

  const supabase = await createClient();

  if (!Number.isInteger(id) || id <= 0) {
    return {
      error: "ID Muda-Mudi tidak valid",
    };
  }

  if (!isSuperAdmin && !adminDesa) {
    return {
      error: "Desa admin tidak valid",
    };
  }

  const namaRaw = String(formData.get("nama") ?? "").trim();
  const requestedDesa = String(formData.get("desa") ?? "").trim();
  const kelompok = String(formData.get("kelompok") ?? "").trim();
  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();
  const tanggalLahir = String(formData.get("tanggal_lahir") ?? "").trim();

  const desa = isSuperAdmin ? requestedDesa : (adminDesa ?? "");

  const validationError = validate(
    namaRaw,
    desa,
    kelompok,
    jenisKelamin,
    tanggalLahir,
  );

  if (validationError) {
    return {
      error: validationError,
    };
  }

  let existingQuery = supabase.from("mudamudi").select("id, desa").eq("id", id);

  if (!isSuperAdmin) {
    existingQuery = existingQuery.eq("desa", adminDesa);
  }

  const { data: existing, error: existingError } =
    await existingQuery.maybeSingle();

  if (existingError) {
    return {
      error: existingError.message,
    };
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

  const umur = calculateAge(tanggalLahir);

  const kelas = calculatekelas(umur);

  if (!kelas) {
    return {
      error: "Kelas tidak dapat ditentukan dari usia",
    };
  }

  const { data: candidates, error: candidateError } = await supabase
    .from("mudamudi")
    .select("id, nama")
    .eq("kelas", kelas)
    .eq("kelompok", kelompok)
    .eq("desa", desa)
    .neq("id", id);

  if (candidateError) {
    return {
      error: candidateError.message,
    };
  }

  const isDuplicate =
    candidates?.some(
      (candidate) =>
        normalizeForCompare(candidate.nama) === normalizeForCompare(nama),
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
    if (error.code === "23505") {
      return {
        error: "Data dengan kombinasi ini sudah ada",
      };
    }

    return {
      error: error.message,
    };
  }

  revalidatePath("/admin/mudamudi");

  return {
    success: true,
  };
}

export async function deleteMudamudi(id: number): Promise<ActionResult> {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();

  const supabase = await createClient();

  if (!Number.isInteger(id) || id <= 0) {
    return {
      error: "ID Muda-Mudi tidak valid",
    };
  }

  if (!isSuperAdmin && !adminDesa) {
    return {
      error: "Desa admin tidak valid",
    };
  }

  let query = supabase.from("mudamudi").delete().eq("id", id);

  if (!isSuperAdmin) {
    query = query.eq("desa", adminDesa);
  }

  const { data, error } = await query.select("id");

  if (error) {
    return {
      error: error.message,
    };
  }

  if (!data || data.length === 0) {
    return {
      error: "Data Muda-Mudi tidak ditemukan atau tidak dapat diakses",
    };
  }

  revalidatePath("/admin/mudamudi");

  return {
    success: true,
  };
}

export async function getMudamudi() {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();

  const supabase = await createClient();

  if (!isSuperAdmin && !adminDesa) {
    return {
      data: [],
      error: "Desa admin tidak valid",
    };
  }

  let query = supabase.from("mudamudi").select("*");

  if (!isSuperAdmin) {
    query = query.eq("desa", adminDesa);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    return {
      data: [],
      error: error.message,
    };
  }

  return {
    data: data ?? [],
    error: null,
  };
}

/* =========================================================
   SEARCH NAME
========================================================= */

export async function searchMudamudiNames(query: string) {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();

  const supabase = await createClient();

  const keyword = query.trim();

  if (!keyword) {
    return {
      data: [],
      error: null,
    };
  }

  if (!isSuperAdmin && !adminDesa) {
    return {
      data: [],
      error: "Desa admin tidak valid",
    };
  }

  let searchQuery = supabase
    .from("mudamudi")
    .select("id, nama, desa, kelompok")
    .ilike("nama", `%${keyword}%`);

  if (!isSuperAdmin) {
    searchQuery = searchQuery.eq("desa", adminDesa);
  }

  const { data, error } = await searchQuery
    .order("nama", {
      ascending: true,
    })
    .limit(5);

  if (error) {
    console.error("searchMudamudiNames:", error);

    return {
      data: [],
      error: "Gagal mencari nama Muda-Mudi",
    };
  }

  return {
    data: data ?? [],
    error: null,
  };
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

    for (const [index, row] of result.data.entries()) {
      if (row.desa.trim() !== adminDesa) {
        scopedErrors.push({
          rowNumber: index + 2,
          message: `Desa harus ${adminDesa}`,
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
    return {
      error: "File Excel belum dipilih",
    };
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return {
      error: "Format file harus .xlsx",
    };
  }

  if (!isSuperAdmin && !adminDesa) {
    return {
      error: "Desa admin tidak valid",
    };
  }

  try {
    const result = await parseImportExcel(file);

    if (result.data.length === 0) {
      if (result.errors.length > 0) {
        return {
          error:
            "Tidak ada data yang dapat diimpor. Semua baris memiliki masalah pada kolom wajib.",
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

      const unauthorizedRows = result.data.length - scopedRows.length;

      if (scopedRows.length === 0) {
        return {
          error: `Tidak ada data ${adminDesa} yang dapat diimpor.`,
          imported: 0,
          skipped: result.errors.length + unauthorizedRows,
          warnings: result.warnings,
        };
      }
    }

    const rows = scopedRows.map(mapImportRow);

    let existingQuery = supabase
      .from("mudamudi")
      .select("id, nama, desa, kelas, kelompok");

    if (!isSuperAdmin) {
      existingQuery = existingQuery.eq("desa", adminDesa);
    }

    const { data: existingData, error: existingError } = await existingQuery;

    if (existingError) {
      return {
        error: existingError.message,
      };
    }

    const existingKeys = new Set<string>();

    for (const item of existingData ?? []) {
      const key = [
        normalizeForCompare(item.nama),
        item.desa?.toLowerCase() ?? "",
        item.kelas?.toLowerCase() ?? "",
        item.kelompok?.toLowerCase() ?? "",
      ].join("|");

      existingKeys.add(key);
    }

    const rowsToInsert = rows.filter((row) => {
      const key = [
        normalizeForCompare(row.nama),
        row.desa?.toLowerCase() ?? "",
        row.kelas?.toLowerCase() ?? "",
        row.kelompok?.toLowerCase() ?? "",
      ].join("|");

      if (existingKeys.has(key)) {
        return false;
      }

      existingKeys.add(key);

      return true;
    });

    const duplicateCount = rows.length - rowsToInsert.length;

    const unauthorizedCount = isSuperAdmin
      ? 0
      : result.data.length - scopedRows.length;

    const skipped = result.errors.length + duplicateCount + unauthorizedCount;

    if (rowsToInsert.length === 0) {
      return {
        error:
          "Semua data dalam file sudah terdaftar, berada di desa lain, atau tidak memenuhi kolom wajib.",
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
            error.code === "23505"
              ? "Import gagal karena terdapat data duplikat."
              : error.message,
          imported,
          skipped:
            result.errors.length +
            duplicateCount +
            unauthorizedCount +
            (rowsToInsert.length - imported - batch.length),
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
