"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import { requireAdmin } from "../auth/admin";
import { toTitleCase } from "./format";
import {
  DESA_OPTIONS,
  KELOMPOK_BY_DESA,
  JENIS_KELAMIN_OPTIONS,
  KELAS_OPTIONS,
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
  newCount: number;
  updateCount: number;
  reviewCount: number;
};

type ImportResult = ActionResult & {
  imported?: number;
  updated?: number;
  skipped?: number;
  warnings?: ImportWarning[];
};

type ExistingImportRecord = {
  id: number;
  nama: string;
  desa: string;
  kelompok: string;
};

type ImportIdentity = {
  nama: string;
  desa: string;
  kelompok: string;
};

function isValidDesa(desa: string): boolean {
  return DESA_OPTIONS.includes(desa as (typeof DESA_OPTIONS)[number]);
}

function isValidKelompok(desa: string, kelompok: string): boolean {
  if (!isValidDesa(desa)) return false;

  const options = KELOMPOK_BY_DESA[desa as keyof typeof KELOMPOK_BY_DESA];

  return options.includes(kelompok as never);
}

function isValidJenisKelamin(jenisKelamin: string): boolean {
  return JENIS_KELAMIN_OPTIONS.includes(
    jenisKelamin as (typeof JENIS_KELAMIN_OPTIONS)[number],
  );
}

function isValidKelas(kelas: string): boolean {
  return KELAS_OPTIONS.includes(kelas as (typeof KELAS_OPTIONS)[number]);
}

function calculateAge(tanggalLahir: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tanggalLahir);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const birthDate = new Date(year, month - 1, day);

  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (birthDate > today) return null;

  let age = today.getFullYear() - year;
  const monthDifference = today.getMonth() - (month - 1);

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < day)) {
    age--;
  }

  return age >= 0 ? age : null;
}

function calculateKelas(umur: number | null): string {
  if (umur === null) return "";

  if (umur >= 5 && umur <= 6) return "PAUD";
  if (umur >= 7 && umur <= 12) return "Caberawit";
  if (umur >= 13 && umur <= 15) return "Pra Remaja";
  if (umur >= 16 && umur <= 18) return "Remaja";
  if (umur >= 19) return "Usia Nikah";

  return "";
}

function validate(
  nama: string,
  desa: string,
  kelompok: string,
  jenisKelamin: string,
  kelas: string,
  umurRaw: string,
  tanggalLahir: string,
): string | null {
  if (!nama.trim()) return "Nama wajib diisi";

  if (/\d/.test(nama)) {
    return "Nama tidak boleh mengandung angka";
  }

  if (!isValidDesa(desa)) return "Desa tidak valid";

  if (!isValidKelompok(desa, kelompok)) {
    return "Kelompok tidak sesuai dengan desa";
  }

  if (!isValidJenisKelamin(jenisKelamin)) {
    return "Jenis kelamin wajib dipilih";
  }

  if (!isValidKelas(kelas)) {
    return "Kelas wajib dipilih dan harus sesuai dengan pilihan yang tersedia";
  }

  if (umurRaw !== "") {
    const umur = Number(umurRaw);

    if (!Number.isInteger(umur) || umur < 0) {
      return "Umur harus berupa bilangan bulat minimal 0";
    }
  }

  if (tanggalLahir !== "") {
    const umurDariTanggalLahir = calculateAge(tanggalLahir);

    if (umurDariTanggalLahir === null) {
      return "Tanggal lahir tidak valid atau tidak boleh di masa depan";
    }
  }

  return null;
}

function normalizeForCompare(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function createIdentityKey(row: ImportIdentity): string {
  return [
    normalizeForCompare(row.nama),
    normalizeForCompare(row.desa),
    normalizeForCompare(row.kelompok),
  ].join("|");
}

function readFormData(formData: FormData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const desa = String(formData.get("desa") ?? "").trim();
  const kelompok = String(formData.get("kelompok") ?? "").trim();
  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();
  const kelasRaw = String(formData.get("kelas") ?? "").trim();
  const umurRaw = String(formData.get("umur") ?? "").trim();
  const tanggalLahirRaw = String(formData.get("tanggal_lahir") ?? "").trim();

  const umurDariTanggalLahir = tanggalLahirRaw
    ? calculateAge(tanggalLahirRaw)
    : null;

  const kelasOtomatis = tanggalLahirRaw
    ? calculateKelas(umurDariTanggalLahir)
    : "";

  const kelas = kelasOtomatis || kelasRaw;
  const umur = tanggalLahirRaw
    ? umurDariTanggalLahir
    : umurRaw === ""
      ? null
      : Number(umurRaw);

  return {
    nama,
    desa,
    kelompok,
    jenisKelamin,
    kelas,
    umur,
    umurRaw: tanggalLahirRaw ? String(umurDariTanggalLahir ?? "") : umurRaw,
    tanggalLahir: tanggalLahirRaw || null,
    tempatLahir: String(formData.get("tempat_lahir") ?? "").trim() || null,
    noHp: String(formData.get("no_hp") ?? "").trim() || null,
    pekerjaan: String(formData.get("pekerjaan") ?? "").trim() || null,
    namaAyah: String(formData.get("nama_ayah") ?? "").trim() || null,
    namaIbu: String(formData.get("nama_ibu") ?? "").trim() || null,
    noHpOrtu: String(formData.get("no_hp_ortu") ?? "").trim() || null,
    alamat: String(formData.get("alamat") ?? "").trim() || null,
  };
}

function validateFormData(data: ReturnType<typeof readFormData>) {
  return validate(
    data.nama,
    data.desa,
    data.kelompok,
    data.jenisKelamin,
    data.kelas,
    data.umurRaw,
    data.tanggalLahir ?? "",
  );
}

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

function mapImportUpdate(row: ImportRow): Record<string, unknown> {
  const mapped = mapImportRow(row);
  const payload: Record<string, unknown> = {};

  for (const field of row.presentFields ?? []) {
    if (Object.prototype.hasOwnProperty.call(mapped, field)) {
      payload[field] = mapped[field as keyof typeof mapped];
    }
  }

  return payload;
}

function createEmptyPreview(error: string): ImportPreviewResult {
  return {
    success: false,
    error,
    data: [],
    errors: [],
    warnings: [],
    newCount: 0,
    updateCount: 0,
    reviewCount: 0,
  };
}

async function getExistingImportRecords(
  adminDesa: string | null,
  isSuperAdmin: boolean,
): Promise<{
  data: ExistingImportRecord[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  let query = supabase.from("mudamudi").select("id, nama, desa, kelompok");

  if (!isSuperAdmin) {
    if (!adminDesa) {
      return {
        data: null,
        error: "Desa admin tidak valid",
      };
    }

    query = query.eq("desa", adminDesa);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getExistingImportRecords error:", error);

    return {
      data: null,
      error: "Gagal memeriksa data Muda-Mudi yang sudah terdaftar",
    };
  }

  return {
    data: (data ?? []) as ExistingImportRecord[],
    error: null,
  };
}

function groupExistingByIdentity(
  records: ExistingImportRecord[],
): Map<string, ExistingImportRecord[]> {
  const grouped = new Map<string, ExistingImportRecord[]>();

  for (const record of records) {
    const key = createIdentityKey(record);
    const matches = grouped.get(key) ?? [];

    matches.push(record);
    grouped.set(key, matches);
  }

  return grouped;
}

export async function addMudamudi(formData: FormData): Promise<ActionResult> {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();
  const supabase = await createClient();
  const form = readFormData(formData);

  const desa = isSuperAdmin ? form.desa : (adminDesa ?? "");
  const data = { ...form, desa };

  if (!isSuperAdmin && !adminDesa) {
    return { error: "Desa admin tidak valid" };
  }

  const validationError = validateFormData(data);

  if (validationError) return { error: validationError };

  const nama = toTitleCase(data.nama);

  const { data: candidates, error: candidateError } = await supabase
    .from("mudamudi")
    .select("id, nama, kelas")
    .eq("kelompok", data.kelompok)
    .eq("desa", data.desa);

  if (candidateError) {
    console.error("addMudamudi candidate query error:", candidateError);
    return { error: "Gagal memeriksa duplikasi data Muda-Mudi" };
  }

  const normalizedNama = normalizeForCompare(nama);
  const normalizedKelas = normalizeForCompare(data.kelas);

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
    desa: data.desa,
    kelompok: data.kelompok,
    jenis_kelamin: data.jenisKelamin,
    tempat_lahir: data.tempatLahir,
    tanggal_lahir: data.tanggalLahir,
    umur: data.umur,
    kelas: data.kelas,
    no_hp: data.noHp,
    pekerjaan: data.pekerjaan,
    nama_ayah: data.namaAyah,
    nama_ibu: data.namaIbu,
    no_hp_ortu: data.noHpOrtu,
    alamat: data.alamat,
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

  const form = readFormData(formData);
  const desa = isSuperAdmin ? form.desa : (adminDesa ?? "");
  const data = { ...form, desa };

  const validationError = validateFormData(data);

  if (validationError) return { error: validationError };

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

  const nama = toTitleCase(data.nama);

  const { data: candidates, error: candidateError } = await supabase
    .from("mudamudi")
    .select("id, nama, kelas")
    .eq("kelompok", data.kelompok)
    .eq("desa", data.desa)
    .neq("id", id);

  if (candidateError) {
    console.error("updateMudamudi candidate query error:", candidateError);
    return { error: "Gagal memeriksa duplikasi data Muda-Mudi" };
  }

  const normalizedNama = normalizeForCompare(nama);
  const normalizedKelas = normalizeForCompare(data.kelas);

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
      desa: data.desa,
      kelompok: data.kelompok,
      jenis_kelamin: data.jenisKelamin,
      tempat_lahir: data.tempatLahir,
      tanggal_lahir: data.tanggalLahir,
      umur: data.umur,
      kelas: data.kelas,
      no_hp: data.noHp,
      pekerjaan: data.pekerjaan,
      nama_ayah: data.namaAyah,
      nama_ibu: data.namaIbu,
      no_hp_ortu: data.noHpOrtu,
      alamat: data.alamat,
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
          "Pembaruan gagal karena ada kolom wajib database yang kosong. Periksa kolom wajib di Supabase.",
      };
    }

    return { error: "Gagal memperbarui data Muda-Mudi. Periksa log server." };
  }

  revalidatePath("/admin/mudamudi");

  return { success: true };
}

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

export async function searchMudamudiNames(query: string) {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();
  const supabase = await createClient();
  const keyword = query.trim();

  if (!keyword) return { data: [], error: null };

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

export async function previewImportMudamudi(
  formData: FormData,
): Promise<ImportPreviewResult> {
  const { desa: adminDesa, isSuperAdmin } = await requireAdmin();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return createEmptyPreview("File Excel belum dipilih");
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return createEmptyPreview("Format file harus .xlsx");
  }

  if (!isSuperAdmin && !adminDesa) {
    return createEmptyPreview("Desa admin tidak valid");
  }

  try {
    const result = await parseImportExcel(file);

    const classErrors = result.data
      .filter((row) => !isValidKelas(String(row.kelas ?? "").trim()))
      .map((row) => ({
        rowNumber: 0,
        message: `Kelas untuk data "${row.nama}" wajib diisi dengan nilai yang tersedia.`,
      }));

    const validRows = result.data.filter((row) =>
      isValidKelas(String(row.kelas ?? "").trim()),
    );

    const errors = [...result.errors, ...classErrors];
    const scopedRows: ImportRow[] = [];

    for (const row of validRows) {
      if (!isSuperAdmin && row.desa.trim() !== adminDesa) {
        errors.push({
          rowNumber: 0,
          message: `Desa harus ${adminDesa}. Data "${row.nama}" tidak dapat dipratinjau oleh admin desa ini.`,
        });
        continue;
      }

      scopedRows.push(row);
    }

    const existingResult = await getExistingImportRecords(
      adminDesa,
      isSuperAdmin,
    );

    if (existingResult.error || !existingResult.data) {
      return {
        ...createEmptyPreview(
          existingResult.error ?? "Gagal memeriksa data yang sudah terdaftar",
        ),
        errors,
        warnings: result.warnings,
        reviewCount: errors.length,
      };
    }

    const existingByIdentity = groupExistingByIdentity(existingResult.data);
    const importableRows: ImportRow[] = [];
    let newCount = 0;
    let updateCount = 0;
    let ambiguousCount = 0;

    for (const row of scopedRows) {
      const key = createIdentityKey({
        nama: row.nama,
        desa: row.desa,
        kelompok: row.kelompok,
      });

      const matches = existingByIdentity.get(key) ?? [];

      if (matches.length > 1) {
        ambiguousCount++;
        errors.push({
          rowNumber: 0,
          message: `Data "${row.nama}" di desa ${row.desa}, kelompok ${row.kelompok} cocok dengan lebih dari satu data yang sudah terdaftar. Periksa data tersebut secara manual.`,
        });
        continue;
      }

      if (matches.length === 1) {
        updateCount++;
      } else {
        newCount++;
      }

      importableRows.push(row);
    }

    return {
      success: true,
      data: importableRows,
      errors,
      warnings: result.warnings,
      newCount,
      updateCount,
      reviewCount: errors.length + ambiguousCount,
    };
  } catch (error) {
    console.error("previewImportMudamudi error:", error);

    return createEmptyPreview(
      error instanceof Error ? error.message : "Gagal membaca file Excel",
    );
  }
}

export async function importMudamudi(
  formData: FormData,
): Promise<ImportResult> {
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
          updated: 0,
          skipped: result.errors.length,
          warnings: result.warnings,
        };
      }

      return {
        error: "Tidak ada data yang dapat diimpor.",
        imported: 0,
        updated: 0,
        skipped: 0,
        warnings: result.warnings,
      };
    }

    const invalidClassRows = result.data.filter(
      (row) => !isValidKelas(String(row.kelas ?? "").trim()),
    );

    if (invalidClassRows.length > 0) {
      return {
        error:
          "Import dibatalkan karena ada data yang kelasnya kosong atau tidak valid. Lengkapi kelas pada file Excel, termasuk pilihan MT jika sesuai.",
        imported: 0,
        updated: 0,
        skipped: invalidClassRows.length + result.errors.length,
        warnings: result.warnings,
      };
    }

    const scopedRows: ImportRow[] = [];
    let unauthorizedCount = 0;

    for (const row of result.data) {
      if (!isSuperAdmin && row.desa.trim() !== adminDesa) {
        unauthorizedCount++;
        continue;
      }

      scopedRows.push(row);
    }

    if (scopedRows.length === 0) {
      return {
        error: `Tidak ada data ${adminDesa ?? ""} yang dapat diimpor.`,
        imported: 0,
        updated: 0,
        skipped: result.errors.length + unauthorizedCount,
        warnings: result.warnings,
      };
    }

    const existingResult = await getExistingImportRecords(
      adminDesa,
      isSuperAdmin,
    );

    if (existingResult.error || !existingResult.data) {
      return {
        error:
          existingResult.error ??
          "Gagal memeriksa data Muda-Mudi yang sudah terdaftar",
        imported: 0,
        updated: 0,
        skipped: result.errors.length + unauthorizedCount,
        warnings: result.warnings,
      };
    }

    const existingByIdentity = groupExistingByIdentity(existingResult.data);
    const rowsToInsert: ReturnType<typeof mapImportRow>[] = [];
    const rowsToUpdate: Array<{
      id: number;
      payload: Record<string, unknown>;
    }> = [];
    const seenImportKeys = new Set<string>();

    let ambiguousCount = 0;
    let duplicateImportCount = 0;

    for (const row of scopedRows) {
      const key = createIdentityKey({
        nama: row.nama,
        desa: row.desa,
        kelompok: row.kelompok,
      });

      if (seenImportKeys.has(key)) {
        duplicateImportCount++;
        continue;
      }

      seenImportKeys.add(key);

      const matches = existingByIdentity.get(key) ?? [];

      if (matches.length > 1) {
        ambiguousCount++;
        continue;
      }

      if (matches.length === 1) {
        const payload = mapImportUpdate(row);

        if (Object.keys(payload).length === 0) {
          ambiguousCount++;
          continue;
        }

        rowsToUpdate.push({
          id: matches[0].id,
          payload,
        });

        continue;
      }

      rowsToInsert.push(mapImportRow(row));
    }

    const skipped =
      result.errors.length +
      unauthorizedCount +
      ambiguousCount +
      duplicateImportCount;

    if (rowsToInsert.length === 0 && rowsToUpdate.length === 0) {
      return {
        error:
          "Tidak ada data yang dapat diproses. Data mungkin sudah bermasalah, ambigu, duplikat dalam file, atau berasal dari desa lain.",
        imported: 0,
        updated: 0,
        skipped,
        warnings: result.warnings,
      };
    }

    let imported = 0;
    let updated = 0;

    for (const item of rowsToUpdate) {
      let updateQuery = supabase
        .from("mudamudi")
        .update(item.payload)
        .eq("id", item.id);

      if (!isSuperAdmin) {
        updateQuery = updateQuery.eq("desa", adminDesa);
      }

      const { data, error } = await updateQuery.select("id").maybeSingle();

      if (error || !data) {
        console.error("Import update error:", error);

        return {
          error:
            error?.code === "23505"
              ? "Pembaruan gagal karena data bertabrakan dengan data lain yang sudah terdaftar."
              : error?.code === "23502"
                ? "Pembaruan gagal karena kolom wajib database bernilai NULL."
                : "Import berhenti saat memperbarui data. Sebagian perubahan mungkin sudah tersimpan.",
          imported,
          updated,
          skipped,
          warnings: result.warnings,
        };
      }

      updated++;
    }

    const batchSize = 100;

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
                : "Import berhenti saat menambahkan data baru. Sebagian perubahan mungkin sudah tersimpan.",
          imported,
          updated,
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
      updated,
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
