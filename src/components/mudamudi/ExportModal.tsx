"use client";

import { useMemo, useState } from "react";

import { Mudamudi } from "../../backend/mudamudi/types";
import {
  DESA_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
  KELOMPOK_BY_DESA,
  KELOMPOK_OPTIONS,
  KELAS_OPTIONS,
} from "../../backend/mudamudi/constants";

import { exportPresensiExcel } from "../../backend/mudamudi/exportExcel";

import FilterCheckboxGroup from "./FilterCheckboxGroup";
import ModalWrapper from "./ModalWrapper";
import { DownloadIcon } from "./icons";

type Props = {
  allData: Mudamudi[];
  adminDesa: string | null;
  onClose: () => void;
};

export default function ExportModal({ allData, adminDesa, onClose }: Props) {
  const [selectedDesa, setSelectedDesa] = useState<string[]>([]);
  const [selectedJenisKelamin, setSelectedJenisKelamin] = useState<string[]>(
    [],
  );
  const [selectedKelompok, setSelectedKelompok] = useState<string[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const desaOptions = useMemo(() => {
    if (adminDesa) {
      return [adminDesa];
    }

    return [...DESA_OPTIONS];
  }, [adminDesa]);

  const kelompokOptions = useMemo(() => {
    if (adminDesa) {
      return [
        ...(KELOMPOK_BY_DESA[adminDesa as keyof typeof KELOMPOK_BY_DESA] ?? []),
      ];
    }

    if (selectedDesa.length === 0) {
      return [...KELOMPOK_OPTIONS];
    }

    return Array.from(
      new Set(
        selectedDesa.flatMap((desa) => [
          ...(KELOMPOK_BY_DESA[desa as keyof typeof KELOMPOK_BY_DESA] ?? []),
        ]),
      ),
    );
  }, [adminDesa, selectedDesa]);

  function handleDesaChange(next: string[]) {
    if (adminDesa) {
      setSelectedDesa(next.includes(adminDesa) ? [adminDesa] : []);
      setExportError(null);
      return;
    }

    setSelectedDesa(next);

    setSelectedKelompok((current) =>
      current.filter((kelompok) =>
        next.length === 0
          ? true
          : next.some((desa) =>
              (
                KELOMPOK_BY_DESA[desa as keyof typeof KELOMPOK_BY_DESA] ?? []
              ).includes(kelompok as never),
            ),
      ),
    );

    setExportError(null);
  }

  function handleJenisKelaminChange(next: string[]) {
    setSelectedJenisKelamin(next);
    setExportError(null);
  }

  function handleKelompokChange(next: string[]) {
    setSelectedKelompok(next);
    setExportError(null);
  }

  function handleKelasChange(next: string[]) {
    setSelectedKelas(next);
    setExportError(null);
  }

  async function handleExport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isExporting) {
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      // Pembatasan data berdasarkan hak akses admin tetap diterapkan.
      const scopedData = adminDesa
        ? allData.filter((item) => item.desa === adminDesa)
        : allData;

      // Terapkan seluruh filter yang dipilih.
      const filtered = scopedData.filter((item) => {
        const matchDesa =
          selectedDesa.length === 0 || selectedDesa.includes(item.desa);

        const matchJenisKelamin =
          selectedJenisKelamin.length === 0 ||
          (item.jenis_kelamin != null &&
            selectedJenisKelamin.includes(item.jenis_kelamin));

        const matchKelompok =
          selectedKelompok.length === 0 ||
          selectedKelompok.includes(item.kelompok);

        const matchKelas =
          selectedKelas.length === 0 || selectedKelas.includes(item.kelas);

        return matchDesa && matchJenisKelamin && matchKelompok && matchKelas;
      });

      if (filtered.length === 0) {
        setExportError(
          "Tidak ada data yang sesuai dengan filter pilihan. Silakan ubah filter dan coba kembali.",
        );
        return;
      }

      await exportPresensiExcel({
        data: filtered,
        adminDesa,
      });

      onClose();
    } catch (error) {
      console.error("Gagal mengekspor data Muda-Mudi:", error);

      setExportError(
        "Export gagal. Silakan coba kembali. Jika masalah berlanjut, periksa konsol aplikasi.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <ModalWrapper onClose={onClose}>
      <form
        onSubmit={handleExport}
        aria-busy={isExporting}
        className="w-full max-w-150 overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-teal-50 text-teal-600">
              <DownloadIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h2 className="text-[14px] font-semibold leading-5 text-gray-800">
                Export Data Muda-Mudi
              </h2>

              <p className="mt-0.5 text-[10px] leading-4 text-gray-400">
                Pilih data yang ingin diekspor ke Excel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
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

        {/* Filter */}
        <div className="space-y-4 px-5 py-5">
          <FilterCheckboxGroup
            label="Desa"
            options={desaOptions}
            selected={selectedDesa}
            onChange={handleDesaChange}
            colorClass="border-teal-400 bg-teal-50 text-teal-700"
          />

          <FilterCheckboxGroup
            label="Kelompok"
            options={kelompokOptions}
            selected={selectedKelompok}
            onChange={handleKelompokChange}
            colorClass="border-sky-400 bg-sky-50 text-sky-700"
          />

          <FilterCheckboxGroup
            label="Jenis Kelamin"
            options={[...JENIS_KELAMIN_OPTIONS]}
            selected={selectedJenisKelamin}
            onChange={handleJenisKelaminChange}
            colorClass="border-violet-400 bg-violet-50 text-violet-700"
          />

          <FilterCheckboxGroup
            label="Kelas"
            options={[...KELAS_OPTIONS]}
            selected={selectedKelas}
            onChange={handleKelasChange}
            colorClass="border-orange-400 bg-orange-50 text-orange-700"
          />
        </div>

        {/* Pesan error */}
        {exportError && (
          <div className="px-5 pb-3">
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700"
            >
              {exportError}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isExporting}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#171717] px-5 text-[11px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting ? (
              <>
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Menyiapkan Excel...
              </>
            ) : (
              <>
                <DownloadIcon className="h-3.5 w-3.5" />
                Export Excel
              </>
            )}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
