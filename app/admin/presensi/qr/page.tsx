"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getKegiatan } from "../../../../src/backend/kegiatan/actions";
import { Kegiatan } from "../../../../src/backend/kegiatan/types";
import {
  formatJam,
  formatRentangTanggal,
} from "../../../../src/backend/kegiatan/format";

export default function Page() {
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getKegiatan();
        setKegiatan(data);
      } catch {
        setError("Gagal memuat data kegiatan.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const selectedKegiatan =
    kegiatan.find((item) => String(item.id) === selectedId) ?? null;

  const qrValue = "SIKEMA:PRESENSI";

  function handlePrint() {
    window.print();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
            Presensi
          </p>

          <h1 className="mt-1 text-xl font-semibold text-gray-900">
            QR Kegiatan
          </h1>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Tampilkan QR Code kegiatan agar Muda-Mudi dapat melakukan presensi.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-[11px] font-medium text-gray-700">
            Pilih kegiatan
          </label>

          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={loading}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">
              {loading ? "Memuat kegiatan..." : "Pilih kegiatan"}
            </option>

            {kegiatan.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama} •{" "}
                {formatRentangTanggal(item.tanggal_mulai, item.tanggal_selesai)}{" "}
                • {formatJam(item.jam_mulai)}
              </option>
            ))}
          </select>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[10px] text-red-600">
              {error}
            </p>
          )}

          {selectedKegiatan && (
            <div className="mt-6">
              <div className="mx-auto max-w-sm rounded-xl border border-gray-200 bg-white p-6 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
                  SIKEMA
                </p>

                <h2 className="mt-2 text-lg font-semibold text-gray-900">
                  {selectedKegiatan.nama}
                </h2>

                <p className="mt-2 text-[10px] text-gray-500">
                  {formatRentangTanggal(
                    selectedKegiatan.tanggal_mulai,
                    selectedKegiatan.tanggal_selesai,
                  )}
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  {formatJam(selectedKegiatan.jam_mulai)} -{" "}
                  {formatJam(selectedKegiatan.jam_selesai)}
                </p>

                {selectedKegiatan.lokasi && (
                  <p className="mt-1 text-[10px] text-gray-500">
                    {selectedKegiatan.lokasi}
                  </p>
                )}

                <div className="mx-auto mt-6 w-fit rounded-lg bg-white p-3">
                  <QRCodeSVG value={qrValue} size={240} level="M" />
                </div>

                <p className="mt-4 text-[9px] text-gray-400">
                  Scan QR ini menggunakan kamera pada halaman presensi SIKEMA.
                </p>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="mt-5 h-9 w-full rounded-lg bg-teal-600 text-[11px] font-medium text-white transition hover:bg-teal-700 print:hidden"
                >
                  Cetak QR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
