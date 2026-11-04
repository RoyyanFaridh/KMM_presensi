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
      <p className="truncate text-xs font-semibold leading-5 text-[#202824]">
        {item.nama}
      </p>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-wide text-[#78827C]">
            Tanggal
          </p>
          <p
            className={`mt-0.5 text-[10px] leading-4 text-[#202824] ${
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
          <p className="text-[9px] font-medium uppercase tracking-wide text-[#78827C]">
            Waktu
          </p>
          <p className="mt-0.5 whitespace-nowrap text-[10px] leading-4 text-[#202824]">
            {formatJam(item.jam_mulai)} - {formatJam(item.jam_selesai)}
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-wide text-[#78827C]">
            Lokasi
          </p>
          <p
            className="mt-0.5 truncate text-[10px] leading-4 text-[#202824]"
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

  const [searchKegiatan, setSearchKegiatan] = useState("");

  const filteredKegiatan = kegiatan.filter((item) => {
    if (!searchKegiatan.trim()) return true;
    const q = searchKegiatan.toLowerCase();
    return (
      item.nama.toLowerCase().includes(q) ||
      item.lokasi.toLowerCase().includes(q)
    );
  });

  return (
    <section
      className={`relative rounded-2xl border border-[#E5EAE6] bg-white p-4 shadow-xs transition-all ${
        open ? "z-30 ring-1 ring-[#287A50]/20" : "z-10"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold text-[#202824] sm:text-sm">
            Pilih Kegiatan
          </h2>
          <p className="mt-0.5 text-[10px] leading-4 text-[#78827C] sm:text-[11px]">
            Pilih kegiatan untuk memantau presensi.
          </p>
        </div>

        {kegiatan.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5EAE6] bg-[#F5F7F5] px-2.5 py-1 text-[9px] font-medium text-[#78827C]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#287A50]" />
            {kegiatan.length} kegiatan
          </span>
        )}
      </div>

      {kegiatan.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5EAE6] bg-[#F5F7F5] px-3 py-4 text-center">
          <p className="text-xs font-medium text-[#202824]">
            Belum ada kegiatan
          </p>
          <p className="mt-1 text-[10px] leading-4 text-[#78827C]">
            Tambahkan kegiatan terlebih dahulu melalui menu Kegiatan.
          </p>
        </div>
      ) : (
        <div ref={dropdownRef} className="relative">
          <label className="mb-1.5 block text-[10px] font-medium text-[#78827C] sm:text-[11px]">
            Kegiatan
          </label>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={`flex min-h-19 w-full items-start justify-between gap-3 rounded-xl border bg-white px-3 py-2.5 text-left transition-colors ${
              open
                ? "border-[#287A50] ring-2 ring-[#65B98A]/20"
                : "border-[#E5EAE6] hover:border-[#65B98A]/40"
            }`}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            {selectedKegiatan ? (
              <div className="min-w-0 flex-1">
                <KegiatanInfo item={selectedKegiatan} compact />
              </div>
            ) : (
              <span className="py-1 text-xs text-[#9AA39D]">
                Pilih kegiatan
              </span>
            )}

            <svg
              className={`mt-0.5 h-4 w-4 shrink-0 text-[#78827C] transition-transform ${
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
              className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xl ring-1 ring-black/5"
              role="listbox"
              aria-label="Daftar kegiatan"
            >
              {kegiatan.length > 4 && (
                <div className="border-b border-[#E5EAE6] p-2">
                  <div className="relative">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#78827C]"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m16 16 4 4" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Cari kegiatan..."
                      value={searchKegiatan}
                      onChange={(e) => setSearchKegiatan(e.target.value)}
                      className="h-8 w-full rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] pl-8 pr-2 text-[11px] text-[#202824] outline-none transition focus:border-[#287A50] focus:bg-white focus:ring-1 focus:ring-[#65B98A]/20"
                    />
                  </div>
                </div>
              )}

              <div className="max-h-80 overflow-y-auto overscroll-contain p-1.5">
                {filteredKegiatan.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-[#78827C]">
                    Tidak ada kegiatan yang cocok
                  </p>
                ) : (
                  filteredKegiatan.map((item) => {
                    const isSelected = item.id === selectedKegiatanId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          handleSelect(item.id);
                          setSearchKegiatan("");
                        }}
                        className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          isSelected
                            ? "border-[#65B98A]/30 bg-[#E6F2EA]"
                            : "border-transparent hover:bg-[#F5F7F5]"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="min-w-0 flex-1">
                            <KegiatanInfo item={item} compact />
                          </div>

                          {isSelected && (
                            <svg
                              className="mt-1 h-4 w-4 shrink-0 text-[#287A50]"
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
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}