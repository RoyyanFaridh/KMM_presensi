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
      console.error("Gagal mengekspor data Generus:", error);

      setExportError(
        "Export gagal. Silakan coba kembali. Jika masalah berlanjut, periksa konsol aplikasi.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <ModalWrapper onClose={onClose} size="md">
      <form
        onSubmit={handleExport}
        aria-busy={isExporting}
        className="flex max-h-[90dvh] min-h-0 w-full flex-col overflow-hidden bg-white"
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
              <DownloadIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h2 className="text-[11px] font-semibold leading-5 text-[#202824]">
                Ekspor Data Generus
              </h2>

              <p className="mt-0.5 text-[9px] leading-4 text-[#78827C]">
                Pilih kriteria data anggota yang ingin diekspor ke file Excel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            aria-label="Tutup"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[#78827C] transition hover:bg-[#F0F4F1] hover:text-[#202824] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
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
        </header>

        {/* Filter Content */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
          <FilterCheckboxGroup
            label="Desa"
            options={desaOptions}
            selected={selectedDesa}
            onChange={handleDesaChange}
            colorClass="border-[#65B98A] bg-[#E6F2EA] text-[#206440]"
          />

          <FilterCheckboxGroup
            label="Kelompok"
            options={kelompokOptions}
            selected={selectedKelompok}
            onChange={handleKelompokChange}
            colorClass="border-[#65B98A] bg-[#E6F2EA] text-[#206440]"
          />

          <FilterCheckboxGroup
            label="Jenis Kelamin"
            options={[...JENIS_KELAMIN_OPTIONS]}
            selected={selectedJenisKelamin}
            onChange={handleJenisKelaminChange}
            colorClass="border-[#65B98A] bg-[#E6F2EA] text-[#206440]"
          />

          <FilterCheckboxGroup
            label="Kelas"
            options={[...KELAS_OPTIONS]}
            selected={selectedKelas}
            onChange={handleKelasChange}
            colorClass="border-[#65B98A] bg-[#E6F2EA] text-[#206440]"
          />

          {exportError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[10px] leading-4 text-red-700"
            >
              {exportError}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="inline-flex min-h-9 items-center justify-center rounded-xl border border-[#E5EAE6] bg-white px-3.5 py-2 text-[9px] font-semibold text-[#202824] transition hover:bg-[#F0F4F1] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isExporting}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-[#287A50] px-4 py-2 text-[9px] font-semibold text-white transition hover:bg-[#206440] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
                <span>Menyiapkan Excel...</span>
              </>
            ) : (
              <>
                <DownloadIcon className="h-3.5 w-3.5" />
                <span>Unduh Excel</span>
              </>
            )}
          </button>
        </footer>
      </form>
    </ModalWrapper>
  );
}
