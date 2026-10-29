"use client";

import { useMemo, useState } from "react";

import { Kegiatan } from "../../../backend/kegiatan/types";
import { MonitoringPresensi } from "../../../backend/presensi/types";
import { hitungRekapitulasiBeritaAcara } from "../../../backend/presensi/beritaAcaraData";
import {
  downloadBeritaAcaraDocxFile,
  formatRentangTanggalBeritaAcara,
  formatRupiahIndonesia,
  JabatanKyaiOption,
  PemateriRow,
} from "../../../backend/presensi/beritaAcaraDocx";

type Props = {
  kegiatan: Kegiatan;
  monitoringData: MonitoringPresensi | null;
  onClose: () => void;
};

const DEFAULT_PEMATERI_ROW: PemateriRow = {
  waktu: "",
  materi: "",
  petugas: "",
  keterangan: "",
};

const INPUT_CLASS =
  "mt-1 h-8 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-[11px] text-gray-700 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400";

const LABEL_CLASS =
  "block text-[10px] font-semibold tracking-wide text-gray-600";

export default function BeritaAcaraModal({
  kegiatan,
  monitoringData,
  onClose,
}: Props) {
  const [pembawaAcara, setPembawaAcara] = useState("");
  const [petugas, setPetugas] = useState("");
  const [kyaiDesa, setKyaiDesa] = useState("");
  const [jabatanKyai, setJabatanKyai] = useState<JabatanKyaiOption>("KYAI DESA");

  const [pemateriList, setPemateriList] = useState<PemateriRow[]>([
    { ...DEFAULT_PEMATERI_ROW },
  ]);

  const [infaqAmplop, setInfaqAmplop] = useState<number>(0);
  const [infaqPpg, setInfaqPpg] = useState<number>(0);
  const [infaqPresensi, setInfaqPresensi] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalInfaq = useMemo(() => {
    const a = Number.isFinite(infaqAmplop) && infaqAmplop >= 0 ? infaqAmplop : 0;
    const b = Number.isFinite(infaqPpg) && infaqPpg >= 0 ? infaqPpg : 0;
    const c =
      Number.isFinite(infaqPresensi) && infaqPresensi >= 0 ? infaqPresensi : 0;
    return a + b + c;
  }, [infaqAmplop, infaqPpg, infaqPresensi]);

  function handleAddPemateriRow() {
    setPemateriList((prev) => [...prev, { ...DEFAULT_PEMATERI_ROW }]);
  }

  function handleRemovePemateriRow(index: number) {
    if (pemateriList.length <= 1) {
      setPemateriList([{ ...DEFAULT_PEMATERI_ROW }]);
      return;
    }
    setPemateriList((prev) => prev.filter((_, i) => i !== index));
  }

  function handlePemateriChange(
    index: number,
    field: keyof PemateriRow,
    value: string,
  ) {
    setPemateriList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function parseNumberInput(val: string): number {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) return 0;
    const num = parseInt(cleaned, 10);
    return Number.isFinite(num) && num >= 0 ? num : 0;
  }

  async function handleDownload(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;
    setError("");

    // Validasi input wajib
    if (!pembawaAcara.trim()) {
      setError("Nama Pembawa Acara wajib diisi.");
      return;
    }

    if (!petugas.trim()) {
      setError("Nama Petugas wajib diisi.");
      return;
    }

    if (!kyaiDesa.trim()) {
      setError(`Nama ${jabatanKyai} wajib diisi.`);
      return;
    }

    if (!monitoringData) {
      setError("Data presensi kegiatan belum tersedia.");
      return;
    }

    setLoading(true);

    try {
      // Hitung rekapitulasi data kehadiran berdasarkan peserta monitoring
      const rekap = hitungRekapitulasiBeritaAcara(monitoringData.peserta);

      await downloadBeritaAcaraDocxFile(
        {
          nama: kegiatan.nama,
          tanggal_mulai: kegiatan.tanggal_mulai,
          tanggal_selesai: kegiatan.tanggal_selesai,
          lokasi: kegiatan.lokasi,
        },
        rekap,
        {
          pembawaAcara: pembawaAcara.trim(),
          petugas: petugas.trim(),
          kyaiDesa: kyaiDesa.trim(),
          jabatanKyai,
          pemateriList,
          infaqAmplop,
          infaqPpg,
          infaqPresensi,
          totalInfaq,
        },
      );

      onClose();
    } catch (err) {
      console.error("Gagal membuat dokumen Berita Acara:", err);
      setError(
        err instanceof Error
          ? `Gagal membuat dokumen: ${err.message}`
          : "Terjadi kesalahan saat membuat file Berita Acara.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="berita-acara-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/40 p-0 backdrop-blur-xs sm:items-center sm:p-4"
    >
      <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-gray-100 bg-white shadow-xl sm:rounded-2xl">
        <form
          onSubmit={handleDownload}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {/* Header Modal */}
          <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-4 py-3.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 13.5h6m-6 3h6"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <h2
                  id="berita-acara-modal-title"
                  className="truncate text-[11px] font-semibold text-gray-800 sm:text-xs"
                >
                  Unduh Berita Acara Kegiatan
                </h2>
                <p className="mt-0.5 truncate text-[9px] text-gray-400 sm:text-[10px]">
                  {kegiatan.nama} ·{" "}
                  {formatRentangTanggalBeritaAcara(
                    kegiatan.tanggal_mulai,
                    kegiatan.tanggal_selesai,
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Tutup modal"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 6 12 12M18 6 6 18"
                />
              </svg>
            </button>
          </div>

          {/* Body Form */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="flex items-start gap-2 rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5m0-8h.01" />
              </svg>

              <p className="text-[10px] leading-4 text-teal-900">
                Dokumen Berita Acara akan dibuat dalam format Word (.docx) portrait
                yang rapi dan dapat diedit kembali sebelum dicetak atau ditandatangani.
              </p>
            </div>

            {/* Bagian 1: Identitas & Petugas */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-[10px] font-semibold text-gray-800">
                  Petugas Acara & Penandatangan
                </h3>
                <span className="text-[9px] text-red-500">* Wajib diisi</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4">
                <div className="min-w-0">
                  <label htmlFor="pembawa-acara" className={LABEL_CLASS}>
                    Pembawa Acara <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pembawa-acara"
                    type="text"
                    required
                    value={pembawaAcara}
                    onChange={(e) => setPembawaAcara(e.target.value)}
                    placeholder="Nama MC / Pembawa Acara"
                    disabled={loading}
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="min-w-0">
                  <label htmlFor="nama-petugas" className={LABEL_CLASS}>
                    Petugas / Pembuat <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nama-petugas"
                    type="text"
                    required
                    value={petugas}
                    onChange={(e) => setPetugas(e.target.value)}
                    placeholder="Nama Petugas"
                    disabled={loading}
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="min-w-0">
                  <label htmlFor="jabatan-kyai" className={LABEL_CLASS}>
                    Jabatan Penandatangan <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="jabatan-kyai"
                    value={jabatanKyai}
                    onChange={(e) =>
                      setJabatanKyai(e.target.value as JabatanKyaiOption)
                    }
                    disabled={loading}
                    className={INPUT_CLASS}
                  >
                    <option value="KYAI DAERAH">KYAI DAERAH</option>
                    <option value="KYAI DESA">KYAI DESA</option>
                    <option value="KYAI KELOMPOK">KYAI KELOMPOK</option>
                  </select>
                </div>

                <div className="min-w-0">
                  <label htmlFor="nama-kyai" className={LABEL_CLASS}>
                    Nama {jabatanKyai === "KYAI DAERAH" ? "Kyai Daerah" : jabatanKyai === "KYAI KELOMPOK" ? "Kyai Kelompok" : "Kyai Desa"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nama-kyai"
                    type="text"
                    required
                    value={kyaiDesa}
                    onChange={(e) => setKyaiDesa(e.target.value)}
                    placeholder="Nama Kyai"
                    disabled={loading}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Daftar Pemateri */}
            <div className="border-t border-gray-100 pt-3">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-[10px] font-semibold text-gray-800">
                    Daftar Pemateri
                  </h3>
                  <p className="mt-0.5 text-[9px] text-gray-400">
                    Isi sesi materi atau biarkan kosong jika ingin diisi manual saat dicetak.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddPemateriRow}
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[9px] font-medium text-teal-700 transition hover:bg-teal-50 hover:border-teal-200 disabled:opacity-50"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3 w-3"
                    aria-hidden="true"
                  >
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Tambah Baris
                </button>
              </div>

              {/* Table Container dengan responsive scroll horizontal */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[500px] border-collapse text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80 text-[9px] font-semibold text-gray-600">
                      <th className="w-8 px-2.5 py-2 text-center">No</th>
                      <th className="w-24 px-2 py-2">Waktu</th>
                      <th className="px-2 py-2">Materi</th>
                      <th className="w-32 px-2 py-2">Petugas</th>
                      <th className="w-24 px-2 py-2">Keterangan</th>
                      <th className="w-8 px-2 py-2 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {pemateriList.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50/50">
                        <td className="px-2.5 py-1.5 text-center font-medium text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            value={row.waktu}
                            onChange={(e) =>
                              handlePemateriChange(index, "waktu", e.target.value)
                            }
                            placeholder="08:00 - 09:00"
                            disabled={loading}
                            className="h-7 w-full rounded border border-gray-200 px-2 text-[10px] text-gray-700 outline-none focus:border-teal-500"
                          />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            value={row.materi}
                            onChange={(e) =>
                              handlePemateriChange(index, "materi", e.target.value)
                            }
                            placeholder="Judul materi pengajian"
                            disabled={loading}
                            className="h-7 w-full rounded border border-gray-200 px-2 text-[10px] text-gray-700 outline-none focus:border-teal-500"
                          />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            value={row.petugas}
                            onChange={(e) =>
                              handlePemateriChange(index, "petugas", e.target.value)
                            }
                            placeholder="Nama ustadz / penceramah"
                            disabled={loading}
                            className="h-7 w-full rounded border border-gray-200 px-2 text-[10px] text-gray-700 outline-none focus:border-teal-500"
                          />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <input
                            type="text"
                            value={row.keterangan}
                            onChange={(e) =>
                              handlePemateriChange(
                                index,
                                "keterangan",
                                e.target.value,
                              )
                            }
                            placeholder="Keterangan"
                            disabled={loading}
                            className="h-7 w-full rounded border border-gray-200 px-2 text-[10px] text-gray-700 outline-none focus:border-teal-500"
                          />
                        </td>
                        <td className="px-1 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePemateriRow(index)}
                            disabled={loading}
                            title="Hapus baris"
                            className="inline-flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <svg
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bagian 3: Rekapitulasi Infak */}
            <div className="border-t border-gray-100 pt-3">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <h3 className="text-[10px] font-semibold text-gray-800">
                  Rekapitulasi Infak
                </h3>
                <span className="text-[9px] text-gray-400">Opsional</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div className="min-w-0">
                  <label htmlFor="infaq-amplop" className={LABEL_CLASS}>
                    Infaq Amplop
                  </label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[10px] text-gray-400">
                      Rp
                    </span>
                    <input
                      id="infaq-amplop"
                      type="text"
                      inputMode="numeric"
                      value={infaqAmplop ? infaqAmplop.toLocaleString("id-ID") : ""}
                      onChange={(e) =>
                        setInfaqAmplop(parseNumberInput(e.target.value))
                      }
                      placeholder="0"
                      disabled={loading}
                      className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-2.5 text-[11px] text-gray-700 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <label htmlFor="infaq-ppg" className={LABEL_CLASS}>
                    Infaq PPG
                  </label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[10px] text-gray-400">
                      Rp
                    </span>
                    <input
                      id="infaq-ppg"
                      type="text"
                      inputMode="numeric"
                      value={infaqPpg ? infaqPpg.toLocaleString("id-ID") : ""}
                      onChange={(e) =>
                        setInfaqPpg(parseNumberInput(e.target.value))
                      }
                      placeholder="0"
                      disabled={loading}
                      className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-2.5 text-[11px] text-gray-700 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <label htmlFor="infaq-presensi" className={LABEL_CLASS}>
                    Infaq Presensi
                  </label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[10px] text-gray-400">
                      Rp
                    </span>
                    <input
                      id="infaq-presensi"
                      type="text"
                      inputMode="numeric"
                      value={
                        infaqPresensi ? infaqPresensi.toLocaleString("id-ID") : ""
                      }
                      onChange={(e) =>
                        setInfaqPresensi(parseNumberInput(e.target.value))
                      }
                      placeholder="0"
                      disabled={loading}
                      className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-2.5 text-[11px] text-gray-700 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
                    />
                  </div>
                </div>
              </div>

              {/* Box Total Infak */}
              <div className="mt-2.5 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-2 text-[10px]">
                <span className="font-semibold text-gray-700">Jumlah Total Infak</span>
                <span className="font-bold text-teal-800">
                  {formatRupiahIndonesia(totalInfaq)}
                </span>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] leading-4 text-red-700"
              >
                {error}
              </div>
            )}
          </div>

          {/* Footer Modal */}
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-[11px] font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3"
                    />
                  </svg>
                  Unduh Berita Acara (.docx)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
