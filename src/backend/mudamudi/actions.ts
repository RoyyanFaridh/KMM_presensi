"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import { toTitleCase } from "./format";
import {
  DESA_OPTIONS,
  KELOMPOK_BY_DESA,
  JENIS_KELAMIN_OPTIONS,
} from "./constants";
import { parseImportExcel, type ImportRow } from "./importExcel";

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
  const tanggalLahir = row.tanggal_lahir;

  const umur = calculateAge(tanggalLahir);

  const kelas = calculatekelas(umur);

  return {
    nama: toTitleCase(row.nama.trim()),
    desa: row.desa.trim(),
    kelompok: row.kelompok.trim(),
    jenis_kelamin: row.jenis_kelamin.trim(),
    tempat_lahir: row.tempat_lahir.trim() || null,
    tanggal_lahir: tanggalLahir,
    umur,
    no_hp: row.no_hp.trim() || null,
    pekerjaan: row.pekerjaan.trim() || null,
    kelas,
    nama_ayah: row.nama_ayah.trim() || null,
    nama_ibu: row.nama_ibu.trim() || null,
    no_hp_ortu: row.no_hp_ortu.trim() || null,
    alamat: row.alamat.trim() || null,
  };
}

export async function addMudamudi(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const namaRaw = String(formData.get("nama") ?? "").trim();

  const desa = String(formData.get("desa") ?? "").trim();

  const kelompok = String(formData.get("kelompok") ?? "").trim();

  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();

  const tanggalLahir = String(formData.get("tanggal_lahir") ?? "").trim();

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
      error: "kelas tidak dapat ditentukan dari usia",
    };
  }

  const { data: candidates, error: candidateError } = await supabase
    .from("mudamudi")
    .select("id, nama")
    .eq("kelas", kelas)
    .eq("kelompok", kelompok);

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
  const supabase = await createClient();

  const namaRaw = String(formData.get("nama") ?? "").trim();

  const desa = String(formData.get("desa") ?? "").trim();

  const kelompok = String(formData.get("kelompok") ?? "").trim();

  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();

  const tanggalLahir = String(formData.get("tanggal_lahir") ?? "").trim();

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
      error: "kelas tidak dapat ditentukan dari usia",
    };
  }

  const { data: candidates, error: candidateError } = await supabase
    .from("mudamudi")
    .select("id, nama")
    .eq("kelas", kelas)
    .eq("kelompok", kelompok)
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
  const supabase = await createClient();

  const { error } = await supabase.from("mudamudi").delete().eq("id", id);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/admin/mudamudi");

  return {
    success: true,
  };
}

export async function getMudamudi() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mudamudi")
    .select("*")
    .order("created_at", {
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
  const supabase = await createClient();

  const keyword = query.trim();

  if (!keyword) {
    return {
      data: [],
      error: null,
    };
  }

  const { data, error } = await supabase
    .from("mudamudi")
    .select("id, nama, desa, kelompok")
    .ilike("nama", `%${keyword}%`)
    .order("nama", {
      ascending: true,
    })
    .limit(5);

  if (error) {
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
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      success: false,
      error: "File Excel belum dipilih",
      data: [],
      errors: [],
    };
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return {
      success: false,
      error: "Format file harus .xlsx",
      data: [],
      errors: [],
    };
  }

  try {
    const result = await parseImportExcel(file);

    return {
      success: true,
      data: result.data,
      errors: result.errors,
    };
  } catch (error) {
    console.error("previewImportMudamudi error:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal membaca file Excel",
      data: [],
      errors: [],
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
  }
> {
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

  try {
    const result = await parseImportExcel(file);

    if (result.errors.length > 0) {
      return {
        error:
          "Masih terdapat data yang tidak valid. Periksa kembali file Excel.",
      };
    }

    if (result.data.length === 0) {
      return {
        error: "Tidak ada data yang dapat diimpor.",
      };
    }

    const rows = result.data.map(mapImportRow);

    const invalidRows = rows.filter((row) => !row.kelas || row.umur === null);

    if (invalidRows.length > 0) {
      return {
        error:
          "Terdapat data dengan usia atau tanggal lahir yang tidak dapat menentukan kelas.",
      };
    }

    const { data: existingData, error: existingError } = await supabase
      .from("mudamudi")
      .select("id, nama, kelas, kelompok");

    if (existingError) {
      return {
        error: existingError.message,
      };
    }

    const existingKeys = new Set<string>();

    for (const item of existingData ?? []) {
      const key = `${normalizeForCompare(item.nama)}|${item.kelas.toLowerCase()}|${item.kelompok.toLowerCase()}`;

      existingKeys.add(key);
    }

    const rowsToInsert = rows.filter((row) => {
      const key = `${normalizeForCompare(row.nama)}|${row.kelas.toLowerCase()}|${row.kelompok.toLowerCase()}`;

      if (existingKeys.has(key)) {
        return false;
      }

      existingKeys.add(key);

      return true;
    });

    const skipped = rows.length - rowsToInsert.length;

    if (rowsToInsert.length === 0) {
      return {
        error: "Semua data dalam file sudah terdaftar.",
        imported: 0,
        skipped,
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
          skipped: rows.length - imported,
        };
      }

      imported += batch.length;
    }

    revalidatePath("/admin/mudamudi");

    return {
      success: true,
      imported,
      skipped,
    };
  } catch (error) {
    console.error("importMudamudi error:", error);

    return {
      error:
        error instanceof Error ? error.message : "Gagal mengimpor data Excel",
    };
  }
}
