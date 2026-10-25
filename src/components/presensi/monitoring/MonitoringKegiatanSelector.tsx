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

type KegiatanInfoProps = {
  item: Kegiatan;
  compact?: boolean;
};

function KegiatanInfo({ item, compact = false }: KegiatanInfoProps) {
  return (
    <div className="min-w-0">
      <p className="truncate text-xs font-semibold leading-5 text-gray-800">
        {item.nama}
      </p>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
            Tanggal
          </p>
          <p
            className={`mt-0.5 text-[10px] leading-4 text-gray-600 ${
              compact ? "whitespace-normal" : "whitespace-nowrap"
            }`}
          >
            {formatRentangTanggal(
              item.tanggal_mulai,
              item.tanggal_selesai,
            )}
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
            Waktu
          </p>
          <p className="mt-0.5 whitespace-nowrap text-[10px] leading-4 text-gray-600">
            {formatJam(item.jam_mulai)} - {formatJam(item.jam_selesai)}
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
            Lokasi
          </p>
          <p
            className="mt-0.5 truncate text-[10px] leading-4 text-gray-600"
            title={item.lokasi}
          >
            {item.lokasi}
          </p>
        </div>
      </div>
    </div>
  );
}

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

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold text-gray-900 sm:text-sm">
            Pilih Kegiatan
          </h2>
          <p className="mt-0.5 text-[10px] leading-4 text-gray-500 sm:text-[11px]">
            Pilih kegiatan untuk memantau presensi.
          </p>
        </div>

        {kegiatan.length > 0 && (
          <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500">
            {kegiatan.length} kegiatan
          </span>
        )}
      </div>

      {kegiatan.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center">
          <p className="text-xs font-medium text-gray-700">
            Belum ada kegiatan
          </p>
          <p className="mt-1 text-[10px] leading-4 text-gray-500">
            Tambahkan kegiatan terlebih dahulu melalui menu Kegiatan.
          </p>
        </div>
      ) : (
        <div ref={dropdownRef} className="relative">
          <label className="mb-1.5 block text-[10px] font-medium text-gray-600 sm:text-[11px]">
            Kegiatan
          </label>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={`flex min-h-19 w-full items-start justify-between gap-3 rounded-md border bg-white px-3 py-2.5 text-left transition-colors ${
              open
                ? "border-teal-500 ring-1 ring-teal-500/20"
                : "border-gray-200 hover:border-gray-300"
            }`}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            {selectedKegiatan ? (
              <div className="min-w-0 flex-1">
                <KegiatanInfo item={selectedKegiatan} compact />
              </div>
            ) : (
              <span className="py-1 text-xs text-gray-400">
                Pilih kegiatan
              </span>
            )}

            <svg
              className={`mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition-transform ${
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
              className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
              role="listbox"
              aria-label="Daftar kegiatan"
            >
              <div className="max-h-72 overflow-y-auto p-1.5">
                {kegiatan.map((item) => {
                  const isSelected = item.id === selectedKegiatanId;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full rounded-md border px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? "border-teal-100 bg-teal-50/70"
                          : "border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="min-w-0 flex-1">
                          <KegiatanInfo item={item} compact />
                        </div>

                        {isSelected && (
                          <svg
                            className="mt-1 h-4 w-4 shrink-0 text-teal-600"
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
    </section>
  );
}