"use client";

import { useEffect, useRef, useState } from "react";

import {
  formatJam,
  formatRentangTanggal,
} from "../../../backend/kegiatan/format";

import { Kegiatan } from "../../../backend/kegiatan/types";

type Props = {
  kegiatan: Kegiatan[];
  selectedKegiatanId: number | null;
  onSelect: (kegiatanId: number) => void;
};

export default function MonitoringKegiatanSelector({
  kegiatan,
  selectedKegiatanId,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedKegiatan = kegiatan.find(
    (item) => item.id === selectedKegiatanId,
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSelect(kegiatanId: number) {
    onSelect(kegiatanId);
    setOpen(false);
  }

  function KegiatanInfo({ item }: { item: Kegiatan }) {
    return (
      <>
        <p className="truncate text-xs font-semibold text-gray-800">
          {item.nama}
        </p>

        <div className="mt-2 grid grid-cols-[1.5fr_1fr_1fr] gap-2 sm:grid-cols-[1.4fr_1fr_1.2fr] sm:gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
              Tanggal
            </p>

            <p className="mt-0.5 whitespace-nowrap text-[9px] font-medium text-gray-600 sm:text-[10px]">
              {formatRentangTanggal(item.tanggal_mulai, item.tanggal_selesai)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
              Waktu
            </p>

            <p className="mt-0.5 whitespace-nowrap text-[9px] font-medium text-gray-600 sm:text-[10px]">
              {formatJam(item.jam_mulai)} - {formatJam(item.jam_selesai)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
              Lokasi
            </p>

            <p
              className="truncate text-[9px] font-medium text-gray-600 sm:text-[10px]"
              title={item.lokasi}
            >
              {item.lokasi}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Pilih Kegiatan</h2>

        <p className="mt-1 text-[11px] text-gray-500">
          Pilih kegiatan untuk melihat dan memantau presensi.
        </p>
      </div>

      {kegiatan.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-4">
          <p className="text-xs font-medium text-gray-700">
            Belum ada kegiatan.
          </p>

          <p className="mt-1 text-[10px] text-gray-400">
            Tambahkan kegiatan terlebih dahulu melalui menu Kegiatan.
          </p>
        </div>
      ) : (
        <div ref={dropdownRef} className="relative">
          <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
            Kegiatan
          </label>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={`flex min-h-20.5 w-full items-start justify-between rounded-lg border bg-white px-3 py-2.5 text-left outline-none transition-colors ${
              open
                ? "border-teal-500 ring-1 ring-teal-500"
                : "border-gray-300 hover:border-gray-400"
            }`}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            {selectedKegiatan ? (
              <div className="min-w-0 flex-1">
                <KegiatanInfo item={selectedKegiatan} />
              </div>
            ) : (
              <span className="py-1 text-xs text-gray-400">Pilih kegiatan</span>
            )}

            <svg
              className={`ml-3 mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                open ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25-4.5a.75.75 0 01-1.08 1.04l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {open && (
            <div
              className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
              role="listbox"
            >
              <div className="max-h-80 overflow-y-auto p-1.5">
                {kegiatan.map((item) => {
                  const isSelected = item.id === selectedKegiatanId;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full rounded-md px-3 py-3 text-left transition-colors ${
                        isSelected ? "bg-teal-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <KegiatanInfo item={item} />
                        </div>

                        {isSelected && (
                          <svg
                            className="mt-0.5 h-4 w-4 shrink-0 text-teal-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.42l2.543 2.544 6.543-6.544a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
