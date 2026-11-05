
"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import type { Mudamudi } from "../../backend/mudamudi/types";

import {
  DESA_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
  JENJANG_OPTIONS,
  KELOMPOK_BY_DESA,
  KELOMPOK_OPTIONS,
  KELAS_OPTIONS,
} from "../../backend/mudamudi/constants";

import { exportPresensiExcel } from "../../backend/mudamudi/exportExcel";

import ModalWrapper from "./ModalWrapper";
import { DownloadIcon } from "./icons";

type Props = {
  allData: Mudamudi[];
  adminDesa: string | null;
  onClose: () => void;
};

type MultiSelectChipsProps = {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
};

function MultiSelectChips({
  options,
  selected,
  onToggle,
}: MultiSelectChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const isSelected = selected.includes(option);

        return (
          <button
            key={option}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(option)}
            className={`
              inline-flex min-h-8 items-center justify-center
              rounded-lg border px-2.5 py-1
              text-[11px] font-medium leading-none
              transition-colors duration-150
              active:scale-[0.97]
              ${isSelected
                ? "border-[#287A50] bg-[#E6F2EA] text-[#287A50]"
                : "border-[#E5EAE6] bg-white text-gray-600 hover:border-[#B9D8C3] hover:bg-[#F5F9F6]"
              }
            `}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export default function ExportModal({
  allData,
  adminDesa,
  onClose,
}: Props) {
  const [selectedDesa, setSelectedDesa] = useState<string[]>([]);
  const [selectedJenisKelamin, setSelectedJenisKelamin] = useState<string[]>(
    [],
  );
  const [selectedKelompok, setSelectedKelompok] = useState<string[]>([]);
  const [selectedJenjang, setSelectedJenjang] = useState<string[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string[]>([]);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const isSuperAdmin = adminDesa === null;

  // Data yang boleh diakses berdasarkan hak akses admin.
  const scopedData = useMemo(() => {
    return adminDesa
      ? allData.filter((item) => item.desa === adminDesa)
      : allData;
  }, [allData, adminDesa]);

  // Opsi kelompok menyesuaikan desa yang dipilih.
  const kelompokOptions = useMemo(() => {
    if (!isSuperAdmin) {
      const key = adminDesa as keyof typeof KELOMPOK_BY_DESA;
      return [...(KELOMPOK_BY_DESA[key] ?? [])];
    }

    if (selectedDesa.length > 0) {
      return Array.from(
        new Set(
          selectedDesa.flatMap((desa) => {
            const key = desa as keyof typeof KELOMPOK_BY_DESA;
            return [...(KELOMPOK_BY_DESA[key] ?? [])];
          }),
        ),
      );
    }

    return [...KELOMPOK_OPTIONS];
  }, [isSuperAdmin, adminDesa, selectedDesa]);

  // Data yang sesuai dengan seluruh filter pilihan.
  const filteredData = useMemo(() => {
    return scopedData.filter((item) => {
      const matchDesa =
        selectedDesa.length === 0 || selectedDesa.includes(item.desa);

      const matchKelompok =
        selectedKelompok.length === 0 ||
        selectedKelompok.includes(item.kelompok);

      const matchJenisKelamin =
        selectedJenisKelamin.length === 0 ||
        (item.jenis_kelamin != null &&
          selectedJenisKelamin.includes(item.jenis_kelamin));

      const matchJenjang =
        selectedJenjang.length === 0 ||
        (item.jenjang != null && selectedJenjang.includes(item.jenjang));

      const matchKelas =
        selectedKelas.length === 0 ||
        (item.kelas != null && selectedKelas.includes(item.kelas));

      return (
        matchDesa &&
        matchKelompok &&
        matchJenisKelamin &&
        matchJenjang &&
        matchKelas
      );
    });
  }, [
    scopedData,
    selectedDesa,
    selectedKelompok,
    selectedJenisKelamin,
    selectedJenjang,
    selectedKelas,
  ]);

  // Menghitung jumlah filter aktif.
  const activeFilterCount =
    selectedDesa.length +
    selectedKelompok.length +
    selectedJenisKelamin.length +
    selectedJenjang.length +
    selectedKelas.length;

  // Fungsi untuk memilih atau membatalkan pilihan chip.
  function toggleArrayValue(
    value: string,
    current: string[],
    setter: (values: string[]) => void,
  ) {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );

    setExportError(null);
  }

  // Perubahan pilihan desa sekaligus menyesuaikan pilihan kelompok.
  function handleDesaChange(desa: string) {
    const nextDesa = selectedDesa.includes(desa)
      ? selectedDesa.filter((item) => item !== desa)
      : [...selectedDesa, desa];

    setSelectedDesa(nextDesa);

    const allowedKelompok: string[] =
      nextDesa.length > 0
        ? nextDesa.flatMap((item) => {
          const key = item as keyof typeof KELOMPOK_BY_DESA;
          return [...(KELOMPOK_BY_DESA[key] ?? [])];
        })
        : [...KELOMPOK_OPTIONS];

    setSelectedKelompok((current) =>
      current.filter((kelompok) => allowedKelompok.includes(kelompok)),
    );

    setExportError(null);
  }

  // Mengembalikan seluruh filter ke kondisi awal.
  function handleReset() {
    setSelectedDesa([]);
    setSelectedKelompok([]);
    setSelectedJenisKelamin([]);
    setSelectedJenjang([]);
    setSelectedKelas([]);
    setExportError(null);
  }

  // Proses ekspor Excel.
  async function handleExport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isExporting) return;

    setIsExporting(true);
    setExportError(null);

    try {
      if (filteredData.length === 0) {
        setExportError(
          "Tidak ada data yang sesuai dengan filter pilihan. Silakan ubah filter dan coba kembali.",
        );
        return;
      }

      await exportPresensiExcel({
        data: filteredData,
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

  const sectionTitleClass =
    "mb-2 text-[11px] font-semibold text-gray-700";

  const sectionClass =
    "min-w-0 border-t border-gray-100 pt-3 first:border-t-0 first:pt-0";

  return (
    <ModalWrapper onClose={onClose} size="xl">
      <form
        onSubmit={handleExport}
        aria-busy={isExporting}
        className="flex max-h-[64dvh] min-h-0 w-full flex-col overflow-hidden bg-white"
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
              <DownloadIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h2 className="text-xs font-semibold leading-5 text-[#202824]">
                Ekspor Data Generus
              </h2>

              <p className="mt-0.5 text-[10px] leading-4 text-[#78827C]">
                Pilih kriteria data anggota yang ingin diekspor.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            aria-label="Tutup"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#78827C] transition hover:bg-[#F0F4F1] hover:text-[#202824] disabled:opacity-50"
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
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2 lg:gap-x-8">
            {/* Kolom Kiri */}
            <div className="min-w-0 space-y-4">
              {/* Desa */}
              <section className={sectionClass}>
                <p className={sectionTitleClass}>Desa</p>

                {isSuperAdmin ? (
                  <MultiSelectChips
                    options={DESA_OPTIONS}
                    selected={selectedDesa}
                    onToggle={handleDesaChange}
                  />
                ) : (
                  <div className="inline-flex items-center rounded-lg border border-[#D5EBDD] bg-[#E6F2EA] px-3 py-1.5">
                    <span className="text-[11px] font-medium text-[#287A50]">
                      {adminDesa}
                    </span>
                  </div>
                )}
              </section>

              {/* Kelompok */}
              <section className={sectionClass}>
                <p className={sectionTitleClass}>Kelompok</p>

                <MultiSelectChips
                  options={kelompokOptions}
                  selected={selectedKelompok}
                  onToggle={(value) =>
                    toggleArrayValue(
                      value,
                      selectedKelompok,
                      setSelectedKelompok,
                    )
                  }
                />
              </section>
            </div>

            {/* Kolom Kanan */}
            <div className="min-w-0 space-y-4 border-t border-gray-100 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              {/* Jenis Kelamin */}
              <section className={sectionClass}>
                <p className={sectionTitleClass}>Jenis Kelamin</p>

                <MultiSelectChips
                  options={JENIS_KELAMIN_OPTIONS}
                  selected={selectedJenisKelamin}
                  onToggle={(value) =>
                    toggleArrayValue(
                      value,
                      selectedJenisKelamin,
                      setSelectedJenisKelamin,
                    )
                  }
                />
              </section>

              {/* Jenjang */}
              <section className={sectionClass}>
                <p className={sectionTitleClass}>Jenjang</p>

                <MultiSelectChips
                  options={JENJANG_OPTIONS}
                  selected={selectedJenjang}
                  onToggle={(value) =>
                    toggleArrayValue(
                      value,
                      selectedJenjang,
                      setSelectedJenjang,
                    )
                  }
                />
              </section>

              {/* Kelas */}
              <section className={sectionClass}>
                <p className={sectionTitleClass}>Kelas</p>

                <MultiSelectChips
                  options={KELAS_OPTIONS}
                  selected={selectedKelas}
                  onToggle={(value) =>
                    toggleArrayValue(
                      value,
                      selectedKelas,
                      setSelectedKelas,
                    )
                  }
                />
              </section>
            </div>
          </div>
        </div>

        {/* Preview Jumlah Data */}
        <div className="shrink-0 border-t border-gray-100 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#DCE9DF] bg-[#F5F9F6] px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-[#34483A]">
                Data yang akan diekspor
              </p>

              <p className="mt-0.5 text-[9px] text-[#78827C]">
                {activeFilterCount > 0
                  ? `${activeFilterCount} pilihan filter aktif`
                  : "Seluruh data sesuai hak akses akun"}
              </p>
            </div>

            <div className="flex shrink-0 items-baseline gap-1.5">
              <span className="text-lg font-bold tabular-nums text-[#287A50]">
                {filteredData.length}
              </span>

              <span className="text-[10px] text-[#78827C]">
                Generus
              </span>
            </div>
          </div>

          {exportError && (
            <div
              role="alert"
              className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[10px] leading-4 text-red-700"
            >
              {exportError}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={handleReset}
            disabled={isExporting || activeFilterCount === 0}
            className="min-h-9 rounded-lg px-2 text-[11px] font-medium text-gray-500 underline underline-offset-2 transition hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset filter
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-[#E5EAE6] bg-white px-4 py-2 text-[10px] font-semibold text-[#202824] transition hover:bg-[#F0F4F1] disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isExporting || filteredData.length === 0}
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-[#287A50] px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-[#206440] disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
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
          </div>
        </footer>
      </form>
    </ModalWrapper>
  );
}
