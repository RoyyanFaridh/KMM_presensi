"use client";

import CheckinStepIndicator from "./CheckinStepIndicator";
import { ScannedKegiatan } from "./CheckinTypes";
import { formatRentangTanggal } from "../../backend/kegiatan/format";

type Props = {
  kegiatan: ScannedKegiatan[];
  loading: boolean;
  error: string;
  onSelect: (kegiatan: ScannedKegiatan) => void;
  onBack: () => void;
};

function formatJam(jam: string) {
  return jam.slice(0, 5);
}

export default function CheckinKegiatan({
  kegiatan,
  loading,
  error,
  onSelect,
  onBack,
}: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-teal-600">
            SIKEMA
          </p>

          <h1 className="mt-2 text-xl font-semibold text-gray-900">
            Pilih Kegiatan
          </h1>

          <p className="mt-2 text-xs leading-5 text-gray-500">
            Pilih kegiatan yang sedang Anda ikuti.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <CheckinStepIndicator current={2} />

          <div className="space-y-2">
            {kegiatan.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={loading}
                onClick={() => onSelect(item)}
                className="w-full rounded-xl border border-gray-200 p-4 text-left transition hover:border-teal-400 hover:bg-teal-50/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900">
                      {item.nama}
                    </h2>

                    <p className="mt-1 text-[10px] text-gray-500">
                      {formatRentangTanggal(
                        item.tanggal_mulai,
                        item.tanggal_selesai,
                      )}
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-500">
                      {formatJam(item.jam_mulai)} -{" "}
                      {formatJam(item.jam_selesai)}
                    </p>

                    {item.lokasi && (
                      <p className="mt-0.5 truncate text-[10px] text-gray-500">
                        {item.lokasi}
                      </p>
                    )}
                  </div>

                  <span className="mt-1 shrink-0 text-xs text-teal-600">
                    Pilih
                  </span>
                </div>
              </button>
            ))}
          </div>

          {loading && (
            <p className="mt-3 text-center text-[10px] text-gray-500">
              Memproses presensi...
            </p>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-[10px] text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="mt-4 h-9 w-full rounded-lg border border-gray-200 text-[11px] font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}