import CheckinStepIndicator from "./CheckinStepIndicator";
import {
  formatJam,
} from "../../backend/presensi/format";
import {
  formatRentangTanggal,
} from "../../backend/kegiatan/format";
import { ScannedKegiatan } from "./CheckinTypes";

type Props = {
  nama: string;
  tanggalLahir: string;
  kegiatan: ScannedKegiatan | null;
  error: string;
  loading: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

export default function CheckinConfirmation({
  nama,
  tanggalLahir,
  kegiatan,
  error,
  loading,
  onBack,
  onConfirm,
}: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-teal-600">
            SIKEMA
          </p>

          <h1 className="mt-2 text-xl font-semibold text-gray-900">
            Konfirmasi Presensi
          </h1>

          <p className="mt-2 text-xs leading-5 text-gray-500">
            Pastikan data dan kegiatan sudah benar.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <CheckinStepIndicator current={3} />

          {kegiatan ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-[9px] uppercase tracking-wide text-gray-400">
                  Kegiatan
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {kegiatan.nama}
                </p>

                <p className="mt-2 text-[10px] text-gray-500">
                  {formatRentangTanggal(
                    kegiatan.tanggal_mulai,
                    kegiatan.tanggal_selesai,
                  )}
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  {formatJam(kegiatan.jam_mulai)} -{" "}
                  {formatJam(kegiatan.jam_selesai)}
                  {kegiatan.lokasi
                    ? ` • ${kegiatan.lokasi}`
                    : ""}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-wide text-gray-400">
                  Peserta
                </p>

                <p className="mt-1 text-xs font-semibold text-gray-900">
                  {nama}
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Tanggal lahir: {tanggalLahir}
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
                  className="h-10 flex-1 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="h-10 flex-1 rounded-lg bg-teal-600 text-[11px] font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Menyimpan..."
                    : "Konfirmasi"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Memuat data kegiatan...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}