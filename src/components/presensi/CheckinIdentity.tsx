"use client";

import { useEffect, useRef, useState } from "react";

import { searchMudamudiNames } from "../../backend/mudamudi/actions";

import CheckinStepIndicator from "./CheckinStepIndicator";

import { NamaRekomendasi } from "./CheckinTypes";

type Props = {
  nama: string;
  tanggalLahir: string;
  error: string;
  loading: boolean;
  onNamaChange: (value: string) => void;
  onTanggalLahirChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export default function CheckinIdentity({
  nama,
  tanggalLahir,
  error,
  loading,
  onNamaChange,
  onTanggalLahirChange,
  onSubmit,
  onBack,
}: Props) {
  const [rekomendasi, setRekomendasi] = useState<NamaRekomendasi[]>([]);

  const [loadingNama, setLoadingNama] = useState(false);

  const [showRekomendasi, setShowRekomendasi] = useState(false);

  const selectedNamaRef = useRef(false);

  useEffect(() => {
    if (selectedNamaRef.current) {
      selectedNamaRef.current = false;
      return;
    }

    const keyword = nama.trim();

    if (!keyword) {
      setRekomendasi([]);
      setShowRekomendasi(false);
      setLoadingNama(false);
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setLoadingNama(true);

      const result = await searchMudamudiNames(keyword);

      if (cancelled) {
        return;
      }

      setRekomendasi(result.data ?? []);

      setShowRekomendasi(true);
      setLoadingNama(false);
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [nama]);

  function handleNamaInput(value: string) {
    selectedNamaRef.current = false;

    onNamaChange(value);
    setShowRekomendasi(true);
  }

  function handleSelectNama(selectedNama: string) {
    selectedNamaRef.current = true;

    onNamaChange(selectedNama);
    setShowRekomendasi(false);
    setRekomendasi([]);
    setLoadingNama(false);
  }

  function handleNamaFocus() {
    if (nama.trim()) {
      setShowRekomendasi(true);
    }
  }

  function handleNamaBlur() {
    window.setTimeout(() => {
      setShowRekomendasi(false);
    }, 150);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-teal-600">
            SIKEMA
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Verifikasi Identitas
          </h1>

          <p className="mt-2 text-xs leading-5 text-gray-500">
            Perangkat ini belum dikenali. Masukkan data diri untuk melanjutkan
            presensi.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <CheckinStepIndicator current={2} />

          <div className="space-y-4">
            <div className="relative">
              <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                Nama lengkap
              </label>

              <input
                type="text"
                value={nama}
                onChange={(event) => handleNamaInput(event.target.value)}
                onFocus={handleNamaFocus}
                onBlur={handleNamaBlur}
                autoComplete="off"
                placeholder="Masukkan nama lengkap"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-xs text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />

              {showRekomendasi && nama.trim() && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  {loadingNama ? (
                    <div className="px-3 py-3 text-[10px] text-gray-400">
                      Mencari nama...
                    </div>
                  ) : rekomendasi.length > 0 ? (
                    <div className="py-1">
                      {rekomendasi.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();

                            handleSelectNama(item.nama);
                          }}
                          className="block w-full px-3 py-2.5 text-left transition hover:bg-gray-50"
                        >
                          <p className="truncate text-[11px] font-medium text-gray-800">
                            {item.nama}
                          </p>

                          <p className="mt-0.5 truncate text-[9px] text-gray-400">
                            {item.desa} · {item.kelompok}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-3 text-[10px] text-gray-400">
                      Nama tidak ditemukan.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                Tanggal lahir
              </label>

              <input
                type="text"
                inputMode="numeric"
                value={tanggalLahir}
                onChange={(event) => onTanggalLahirChange(event.target.value)}
                placeholder="DDMMYYYY"
                maxLength={8}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-xs text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />

              <p className="mt-1.5 text-[9px] text-gray-400">
                Contoh: 17082005
              </p>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-[10px] text-red-600">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="h-10 flex-1 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Kembali
              </button>

              <button
                type="button"
                onClick={onSubmit}
                disabled={loading}
                className="h-10 flex-1 rounded-lg bg-teal-600 text-[11px] font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Memproses..." : "Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
