"use client";

import CheckinStepIndicator from "./CheckinStepIndicator";

type Props = {
  nama: string;
  kegiatan: {
    nama: string;
    lokasi: string;
  } | null;
  error: string;
  loading: boolean;
  onPresensi: () => void;
  onGunakanAkunLain: () => void;
};

export default function CheckinKnownDevice({
  nama,
  kegiatan,
  error,
  loading,
  onPresensi,
  onGunakanAkunLain,
}: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-teal-600">
            SIKEMA
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Presensi Kegiatan
          </h1>

          <p className="mt-2 text-xs leading-5 text-gray-500">
            Periksa data berikut sebelum melakukan presensi.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <CheckinStepIndicator current={2} />

          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-600">
              ✓
            </div>

            <h2 className="mt-3 text-lg font-semibold text-gray-900">
              Halo, {nama}
            </h2>

            <p className="mt-1 text-[10px] text-gray-500">
              Akun perangkat berhasil dikenali.
            </p>
          </div>

          {kegiatan && (
            <div className="mt-5 rounded-xl bg-gray-50 px-3 py-3">
              <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
                Kegiatan
              </p>

              <p className="mt-1 truncate text-[11px] font-semibold text-gray-800">
                {kegiatan.nama}
              </p>

              <p className="mt-0.5 truncate text-[9px] text-gray-500">
                {kegiatan.lokasi}
              </p>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[10px] text-red-600">
              {error}
            </p>
          )}

          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={onPresensi}
              disabled={loading}
              className="h-10 w-full rounded-lg bg-teal-600 text-[11px] font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Presensi"}
            </button>

            <button
              type="button"
              onClick={onGunakanAkunLain}
              disabled={loading}
              className="h-10 w-full rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Gunakan akun lain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
