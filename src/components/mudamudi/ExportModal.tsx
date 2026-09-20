"use client";

import { useState } from "react";
import { Mudamudi } from "../../backend/mudamudi/types";
import {
  DESA_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
  KELOMPOK_OPTIONS,
  KELAS_OPTIONS,
} from "../../backend/mudamudi/constants";
import { exportPresensiExcel } from "../../backend/mudamudi/exportExcel";
import FilterCheckboxGroup from "./FilterCheckboxGroup";
import ModalWrapper from "./ModalWrapper";
import { DownloadIcon } from "./icons";

type Props = {
  allData: Mudamudi[];
  onClose: () => void;
};

export default function ExportModal({ allData, onClose }: Props) {
  const [selectedDesa, setSelectedDesa] = useState<string[]>([]);
  const [selectedJenisKelamin, setSelectedJenisKelamin] = useState<string[]>(
    [],
  );
  const [selectedKelompok, setSelectedKelompok] = useState<string[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string[]>([]);

  async function handleExport(e: React.FormEvent) {
    e.preventDefault();

    const filtered = allData.filter((s) => {
      const matchDesa =
        selectedDesa.length === 0 || selectedDesa.includes(s.desa);

      const matchJenisKelamin =
        selectedJenisKelamin.length === 0 ||
        (s.jenis_kelamin !== null &&
          selectedJenisKelamin.includes(s.jenis_kelamin));

      const matchKelompok =
        selectedKelompok.length === 0 || selectedKelompok.includes(s.kelompok);

      const matchKelas =
        selectedKelas.length === 0 || selectedKelas.includes(s.kelas);

      return matchDesa && matchJenisKelamin && matchKelompok && matchKelas;
    });

    await exportPresensiExcel({
      data: filtered,
    });

    onClose();
  }

  return (
    <ModalWrapper onClose={onClose}>
      <form
        onSubmit={handleExport}
        className="w-full max-w-150 overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-teal-50 text-teal-600">
              <DownloadIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h2 className="text-[14px] font-semibold leading-5 text-gray-800">
                Export Data
              </h2>
              <p className="mt-0.5 text-[10px] leading-4 text-gray-400">
                Pilih data yang ingin diexport ke Excel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
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
        {/* BODY */}
        <div className="space-y-4 px-5 py-5">
          <FilterCheckboxGroup
            label="Desa"
            options={DESA_OPTIONS}
            selected={selectedDesa}
            onChange={setSelectedDesa}
            colorClass="border-teal-400 bg-teal-50 text-teal-700"
          />

          <FilterCheckboxGroup
            label="Jenis Kelamin"
            options={JENIS_KELAMIN_OPTIONS}
            selected={selectedJenisKelamin}
            onChange={setSelectedJenisKelamin}
            colorClass="border-violet-400 bg-violet-50 text-violet-700"
          />

          <FilterCheckboxGroup
            label="Kelompok"
            options={KELOMPOK_OPTIONS}
            selected={selectedKelompok}
            onChange={setSelectedKelompok}
            colorClass="border-sky-400 bg-sky-50 text-sky-700"
          />

          <FilterCheckboxGroup
            label="Kelas"
            options={KELAS_OPTIONS}
            selected={selectedKelas}
            onChange={setSelectedKelas}
            colorClass="border-orange-400 bg-orange-50 text-orange-700"
          />
        </div>
        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
          >
            Batal
          </button>

          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#171717] px-5 text-[11px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
          >
            Export Excel
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
