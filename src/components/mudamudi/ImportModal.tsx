"use client";

import { useRef, useState } from "react";
import {
  importMudamudi,
  previewImportMudamudi,
} from "../../backend/mudamudi/actions";
import type { ImportRow } from "../../backend/mudamudi/importExcel";
import ModalWrapper from "./ModalWrapper";
import { UploadIcon } from "./icons";

type ImportAction = "insert" | "update";

type PreviewRow = ImportRow & {
  importAction?: ImportAction;
};

type ImportError = {
  rowNumber: number;
  message: string;
};

type ImportWarning = {
  rowNumber: number;
  message: string;
};

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function ImportModal({ onClose, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [warnings, setWarnings] = useState<ImportWarning[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [previewReady, setPreviewReady] = useState(false);

  function resetFile() {
    if (loading) return;

    setFile(null);
    setPreviewData([]);
    setErrors([]);
    setWarnings([]);
    setNewCount(0);
    setUpdateCount(0);
    setReviewCount(0);
    setStep("upload");
    setError("");
    setPreviewReady(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (loading) return;

    const selectedFile = e.target.files?.[0] ?? null;

    setError("");
    setPreviewData([]);
    setErrors([]);
    setWarnings([]);
    setNewCount(0);
    setUpdateCount(0);
    setReviewCount(0);
    setStep("upload");
    setPreviewReady(false);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".xlsx")) {
      setFile(null);
      setError("File harus berformat .xlsx.");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  }

  async function handlePreview() {
    if (loading) return;

    if (!file) {
      setError("Pilih file Excel terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setPreviewData([]);
    setErrors([]);
    setWarnings([]);
    setNewCount(0);
    setUpdateCount(0);
    setReviewCount(0);
    setPreviewReady(false);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);

      const result = await previewImportMudamudi(formData);

      if (!result.success) {
        setError(result.error || "Gagal memeriksa file Excel.");
        setStep("upload");
        return;
      }

      const data = (result.data ?? []) as PreviewRow[];
      const importErrors = result.errors ?? [];
      const importWarnings = result.warnings ?? [];

      setPreviewData(data);
      setErrors(importErrors);
      setWarnings(importWarnings);
      setNewCount(result.newCount ?? 0);
      setUpdateCount(result.updateCount ?? 0);
      setReviewCount(result.reviewCount ?? importErrors.length);
      setStep("preview");
      setPreviewReady(true);

      if (data.length === 0) {
        setError(
          importErrors.length > 0
            ? "Tidak ada data yang lolos validasi. Periksa rincian kesalahan di bawah."
            : "Tidak ada data yang dapat diproses dari file Excel.",
        );
      }
    } catch (err) {
      console.error("Gagal memeriksa file Muda-Mudi:", err);

      setError(
        err instanceof Error
          ? `Gagal membaca file: ${err.message}`
          : "Gagal membaca file Excel. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (loading) return;

    if (!file) {
      setError("Pilih file Excel terlebih dahulu.");
      return;
    }

    if (!previewReady || previewData.length === 0) {
      setError("Periksa file terlebih dahulu dan pastikan ada data valid.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);

      const result = await importMudamudi(formData);

      if (result.error) {
        const importedCount = result.imported ?? 0;
        const updatedCount = result.updated ?? 0;
        const skippedCount = result.skipped ?? 0;

        if (importedCount > 0 || updatedCount > 0) {
          setError(
            `${result.error} Sebagian perubahan mungkin sudah tersimpan: ${importedCount} data baru, ${updatedCount} data diperbarui, dan ${skippedCount} data dilewati. Periksa data sebelum mengulangi impor.`,
          );

          onSuccess();
        } else {
          setError(result.error);
        }

        return;
      }

      if (!result.success) {
        setError("Server tidak mengonfirmasi keberhasilan impor.");
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Gagal mengimpor data Muda-Mudi:", err);

      setError(
        err instanceof Error
          ? `Terjadi kesalahan saat impor: ${err.message}`
          : "Terjadi kesalahan saat mengimpor data. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  const canImport = previewReady && previewData.length > 0 && !loading;
  const totalReady = newCount + updateCount;

  return (
    <ModalWrapper onClose={loading ? () => {} : onClose}>
      <div className="flex max-h-[90dvh] w-full max-w-150 flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-teal-50 text-teal-600">
              <UploadIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h2 className="text-[14px] font-semibold leading-5 text-gray-800">
                Import Data Muda-Mudi
              </h2>

              <p className="mt-0.5 text-[10px] leading-4 text-gray-400">
                Tambahkan data baru atau perbarui data yang sudah terdaftar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup"
            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              >
                <circle cx="12" cy="12" r="9" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4M12 16h.01"
                />
              </svg>

              <p className="text-[10px] leading-4 text-red-600">{error}</p>
            </div>
          )}

          {step === "upload" && (
            <>
              <button
                type="button"
                disabled={loading}
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-teal-400 hover:bg-teal-50/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm ring-1 ring-gray-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 2v6h6"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 13h8M8 17h6"
                    />
                  </svg>
                </div>

                <p className="mt-3 break-all text-[11px] font-medium text-gray-700">
                  {file ? file.name : "Pilih file Excel"}
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  Format yang didukung: .xlsx
                </p>
              </button>

              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />

              <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
                <p className="text-[10px] font-semibold text-gray-700">
                  Format kolom
                </p>

                <p className="mt-1 text-[10px] leading-4 text-gray-500">
                  <span className="font-medium text-gray-700">Wajib:</span>{" "}
                  Desa, Kelompok, Nama Lengkap, Jenis Kelamin.
                </p>

                <p className="mt-1 text-[10px] leading-4 text-gray-500">
                  <span className="font-medium text-gray-700">Opsional:</span>{" "}
                  Tempat, Tahun Lahir, No HP, Pekerjaan, Kelas, Alamat.
                </p>

                <p className="mt-2 text-[9px] leading-4 text-gray-400">
                  Kolom NO dari file Export tidak diperlukan untuk proses
                  import.
                </p>

                <p className="mt-2 text-[9px] leading-4 text-amber-700">
                  Pencocokan data menggunakan Nama Lengkap, Desa, dan Kelompok.
                  Kelas tidak digunakan sebagai identitas pencocokan.
                </p>

                <p className="mt-1 text-[9px] leading-4 text-amber-700">
                  Kolom opsional yang tidak tersedia pada file tidak akan
                  mengubah data lama. Jika kolom tersedia tetapi selnya kosong,
                  nilainya dapat dikosongkan pada data yang diperbarui.
                </p>
              </div>
            </>
          )}

          {step === "preview" && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2.5">
                  <p className="text-[9px] font-medium uppercase tracking-wide text-teal-600">
                    Data Baru
                  </p>

                  <p className="mt-0.5 text-lg font-semibold text-teal-700">
                    {newCount}
                  </p>

                  <p className="text-[9px] text-teal-600">ditambahkan</p>
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
                  <p className="text-[9px] font-medium uppercase tracking-wide text-blue-600">
                    Diperbarui
                  </p>

                  <p className="mt-0.5 text-lg font-semibold text-blue-700">
                    {updateCount}
                  </p>

                  <p className="text-[9px] text-blue-600">data lama</p>
                </div>

                <div
                  className={`rounded-lg border px-3 py-2.5 ${
                    reviewCount > 0
                      ? "border-amber-100 bg-amber-50"
                      : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-[9px] font-medium uppercase tracking-wide ${
                      reviewCount > 0 ? "text-amber-600" : "text-gray-500"
                    }`}
                  >
                    Perlu Ditinjau
                  </p>

                  <p
                    className={`mt-0.5 text-lg font-semibold ${
                      reviewCount > 0 ? "text-amber-700" : "text-gray-700"
                    }`}
                  >
                    {reviewCount}
                  </p>

                  <p
                    className={`text-[9px] ${
                      reviewCount > 0 ? "text-amber-600" : "text-gray-500"
                    }`}
                  >
                    baris
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 11v5M12 8h.01"
                    />
                  </svg>

                  <div>
                    <p className="text-[10px] font-medium text-gray-700">
                      Hasil pencocokan data
                    </p>

                    <p className="mt-0.5 text-[9px] leading-4 text-gray-500">
                      {newCount} data akan ditambahkan dan {updateCount} data
                      akan diperbarui. Data lama hanya diperbarui jika ditemukan
                      tepat satu kecocokan berdasarkan nama lengkap, desa, dan
                      kelompok.
                    </p>

                    {reviewCount > 0 && (
                      <p className="mt-1 text-[9px] leading-4 text-amber-700">
                        {reviewCount} baris perlu diperiksa dan tidak boleh
                        diproses otomatis. Baris bermasalah ditampilkan pada
                        rincian validasi.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {(errors.length > 0 || warnings.length > 0) && (
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
                  <p className="text-[10px] font-semibold text-gray-700">
                    Ringkasan validasi
                  </p>

                  <p className="mt-1 text-[9px] leading-4 text-gray-500">
                    Kesalahan dan data ambigu tidak diproses. Peringatan
                    merupakan informasi tambahan yang perlu diperiksa sebelum
                    melanjutkan impor.
                  </p>
                </div>
              )}

              {errors.length > 0 && (
                <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                  <div className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4M12 16h.01"
                      />
                    </svg>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-red-700">
                        Baris perlu diperiksa
                      </p>

                      <p className="mt-0.5 text-[9px] leading-4 text-red-600">
                        Baris berikut tidak akan diproses secara otomatis.
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 max-h-36 space-y-1.5 overflow-y-auto border-t border-red-100 pt-2">
                    {errors.map((item, index) => (
                      <div
                        key={`${item.rowNumber}-${index}`}
                        className="flex gap-2 text-[9px] leading-4 text-red-600"
                      >
                        <span className="shrink-0 font-semibold">
                          {item.rowNumber > 0
                            ? `Baris ${item.rowNumber}:`
                            : "Periksa:"}
                        </span>

                        <span>{item.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {warnings.length > 0 && (
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                  <div className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.3 3.5 2.9 16.3A2 2 0 0 0 4.6 19.3h14.8a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3M12 15h.01"
                      />
                    </svg>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-amber-700">
                        Peringatan data
                      </p>

                      <p className="mt-0.5 text-[9px] leading-4 text-amber-600">
                        Periksa kembali data opsional, tahun lahir, nomor HP,
                        dan kelas jika ada peringatan.
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 max-h-36 space-y-1.5 overflow-y-auto border-t border-amber-100 pt-2">
                    {warnings.map((item, index) => (
                      <div
                        key={`${item.rowNumber}-${index}`}
                        className="flex gap-2 text-[9px] leading-4 text-amber-700"
                      >
                        <span className="shrink-0 font-semibold">
                          {item.rowNumber > 0
                            ? `Baris ${item.rowNumber}:`
                            : "Periksa:"}
                        </span>

                        <span>{item.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewData.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="border-b border-gray-100 bg-gray-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-700">
                          Preview Data
                        </p>

                        <p className="mt-0.5 text-[9px] text-gray-400">
                          Periksa status setiap baris sebelum mengimpor.
                        </p>
                      </div>

                      <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-[9px] font-medium text-gray-600">
                        {previewData.length} baris
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-170 text-left text-[9px]">
                      <thead className="bg-white text-gray-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">#</th>
                          <th className="px-3 py-2 font-medium">Nama</th>
                          <th className="px-3 py-2 font-medium">Desa</th>
                          <th className="px-3 py-2 font-medium">Kelompok</th>
                          <th className="px-3 py-2 font-medium">JK</th>
                          <th className="px-3 py-2 font-medium">Tahun Lahir</th>
                          <th className="px-3 py-2 font-medium">Kelas</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {previewData.slice(0, 8).map((item, index) => (
                          <tr
                            key={`${item.nama}-${item.desa}-${item.kelompok}-${index}`}
                            className="text-gray-600"
                          >
                            <td className="px-3 py-2 text-gray-400">
                              {index + 1}
                            </td>

                            <td className="px-3 py-2 font-medium text-gray-800">
                              {item.nama}
                            </td>

                            <td className="px-3 py-2">{item.desa}</td>

                            <td className="px-3 py-2">{item.kelompok}</td>

                            <td className="px-3 py-2">{item.jenis_kelamin}</td>

                            <td className="px-3 py-2">
                              {item.tahun_lahir ?? (
                                <span className="text-gray-400">Kosong</span>
                              )}
                            </td>

                            <td className="px-3 py-2">
                              {item.kelas ?? (
                                <span className="text-amber-600">Kosong</span>
                              )}
                            </td>

                            <td className="px-3 py-2">
                              {item.importAction === "update" ? (
                                <span className="inline-flex whitespace-nowrap rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700">
                                  Perbarui Data
                                </span>
                              ) : (
                                <span className="inline-flex whitespace-nowrap rounded-md bg-teal-50 px-2 py-1 font-medium text-teal-700">
                                  Data Baru
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {previewData.length > 8 && (
                    <div className="border-t border-gray-100 px-3 py-2 text-[9px] text-gray-400">
                      Menampilkan 8 dari {previewData.length} baris yang dapat
                      diproses.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="relative z-10 flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[9px] leading-4 text-gray-400">
            {step === "preview"
              ? `${totalReady} baris siap diproses`
              : "Periksa data sebelum menjalankan impor."}
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={step === "preview" ? resetFile : onClose}
              disabled={loading}
              className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {step === "preview" ? "Ganti File" : "Batal"}
            </button>

            {step === "upload" ? (
              <button
                type="button"
                onClick={handlePreview}
                disabled={!file || loading}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#171717] px-5 text-[11px] font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Memeriksa..." : "Periksa Data"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleImport}
                disabled={!canImport}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#171717] px-5 text-[11px] font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Mengimpor..." : `Proses ${totalReady} Data`}
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
