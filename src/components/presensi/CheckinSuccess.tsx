import { SubmitPresensiResult } from "../../backend/presensi/types";
import { formatWaktuCheckin } from "../../backend/presensi/format";
import { formatRentangTanggal } from "../../backend/kegiatan/format";

type Props = {
  hasil: SubmitPresensiResult | null;
  onReset: () => void;
};

export default function CheckinSuccess({ hasil, onReset }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
            ✓
          </div>

          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Presensi Berhasil
          </h1>

          <p className="mt-2 text-xs leading-5 text-gray-500">
            Presensi kamu sudah tercatat di sistem.
          </p>

          {hasil && (
            <div className="mt-5 rounded-xl bg-gray-50 p-4 text-left">
              <p className="text-sm font-semibold text-gray-900">
                {hasil.kegiatan.nama}
              </p>

              <p className="mt-2 text-[10px] text-gray-500">
                {hasil.mudamudi.nama}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                {formatRentangTanggal(
                  hasil.kegiatan.tanggalMulai,
                  hasil.kegiatan.tanggalSelesai,
                )}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                Check-in {formatWaktuCheckin(hasil.waktuCheckin)}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onReset}
            className="mt-5 h-10 w-full rounded-lg bg-teal-600 text-xs font-medium text-white transition hover:bg-teal-700"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
