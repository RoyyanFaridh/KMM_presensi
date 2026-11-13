
"use client";

import { useMemo, useState } from "react";

import { Kegiatan } from "../../../backend/kegiatan/types";
import { MonitoringPresensi } from "../../../backend/presensi/types";
import { hitungRekapitulasiBeritaAcara } from "../../../backend/presensi/beritaAcaraData";
import {
  downloadBeritaAcaraDocxFile,
  formatRentangTanggalBeritaAcara,
  formatRupiahIndonesia,
  PemateriRow,
} from "../../../backend/presensi/beritaAcaraDocx";
import ModalWrapper from "../../../components/mudamudi/ModalWrapper";

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
  "h-9 w-full min-w-0 rounded-xl border border-[#E5EAE6] bg-white px-3 text-[10px] text-[#202824] outline-none transition placeholder:text-[#9AA39D] focus:border-[#287A50] focus:ring-2 focus:ring-[#65B98A]/20 disabled:cursor-not-allowed disabled:bg-[#F5F7F5]";

const LABEL_CLASS =
  "mb-1.5 block text-[9px] font-semibold leading-4 text-[#202824]";

const HELPER_CLASS =
  "mt-1 text-[9px] leading-4 text-[#78827C]";

export default function BeritaAcaraModal({
  kegiatan,
  monitoringData,
  onClose,
}: Props) {
  const [pembawaAcara, setPembawaAcara] = useState("");
  const [petugas, setPetugas] = useState("");
  const [jabatanPenandatangan, setJabatanPenandatangan] = useState("");
  const [namaPenandatangan, setNamaPenandatangan] = useState("");

  const [pemateriList, setPemateriList] = useState<PemateriRow[]>([
    { ...DEFAULT_PEMATERI_ROW },
  ]);

  const [infaqAmplop, setInfaqAmplop] = useState(0);
  const [infaqPpg, setInfaqPpg] = useState(0);
  const [infaqPresensi, setInfaqPresensi] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalInfaq = useMemo(() => {
    const amplop =
      Number.isFinite(infaqAmplop) && infaqAmplop >= 0 ? infaqAmplop : 0;
    const ppg = Number.isFinite(infaqPpg) && infaqPpg >= 0 ? infaqPpg : 0;
    const presensi =
      Number.isFinite(infaqPresensi) && infaqPresensi >= 0
        ? infaqPresensi
        : 0;

    return amplop + ppg + presensi;
  }, [infaqAmplop, infaqPpg, infaqPresensi]);

  function handleAddPemateriRow() {
    setPemateriList((prev) => [...prev, { ...DEFAULT_PEMATERI_ROW }]);
  }

  function handleRemovePemateriRow(index: number) {
    setPemateriList((prev) => {
      if (prev.length <= 1) {
        return [{ ...DEFAULT_PEMATERI_ROW }];
      }

      return prev.filter((_, i) => i !== index);
    });
  }

  function handlePemateriChange(
    index: number,
    field: keyof PemateriRow,
    value: string,
  ) {
    setPemateriList((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function parseNumberInput(value: string): number {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) return 0;

    const number = parseInt(cleaned, 10);
    return Number.isFinite(number) && number >= 0 ? number : 0;
  }

  async function handleDownload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (!pembawaAcara.trim()) {
      setError("Nama Pembawa Acara wajib diisi.");
      return;
    }

    if (!petugas.trim()) {
      setError("Nama Petugas wajib diisi.");
      return;
    }

    if (!jabatanPenandatangan.trim()) {
      setError("Jabatan Penandatangan wajib diisi.");
      return;
    }

    if (!namaPenandatangan.trim()) {
      setError("Nama Penandatangan wajib diisi.");
      return;
    }

    if (!monitoringData) {
      setError("Data presensi kegiatan belum tersedia.");
      return;
    }

    setLoading(true);

    try {
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
          kyaiDesa: namaPenandatangan.trim(),
          jabatanKyai: jabatanPenandatangan.trim(),
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
    <ModalWrapper onClose={onClose} size="lg">
      <form
        onSubmit={handleDownload}
        className="flex max-h-[90dvh] min-h-0 w-full flex-col overflow-hidden bg-white"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
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
              <h2 className="text-[11px] font-semibold leading-5 text-[#202824]">
                Unduh Berita Acara Kegiatan
              </h2>
              <p className="mt-0.5 truncate text-[9px] leading-4 text-[#78827C]">
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
            aria-label="Tutup"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[#78827C] transition hover:bg-[#F0F4F1] hover:text-[#202824] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3.5 sm:space-y-4 sm:px-5 sm:py-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4M12 16h.01"
                />
              </svg>
              <p className="text-[10px] leading-4 text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg border border-[#65B98A]/30 bg-[#E6F2EA]/60 px-3 py-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="mt-0.5 h-4 w-4 shrink-0 text-[#287A50]"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5m0-8h.01" />
            </svg>
            <p className="text-[10px] leading-4 text-[#206440]">
              Dokumen Berita Acara dibuat dalam format Word (.docx) portrait
              dan dapat diedit kembali sebelum dicetak atau ditandatangani.
            </p>
          </div>

          <section>
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <h3 className="text-[10px] font-semibold text-[#202824]">
                Petugas Acara & Penandatangan
              </h3>
              <span className="text-[9px] text-rose-500">* Wajib diisi</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                  placeholder="Masukkan nama pembawa acara"
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
                  placeholder="Masukkan nama petugas"
                  disabled={loading}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="jabatan-penandatangan"
                  className={LABEL_CLASS}
                >
                  Jabatan Penandatangan{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="jabatan-penandatangan"
                  type="text"
                  required
                  value={jabatanPenandatangan}
                  onChange={(e) =>
                    setJabatanPenandatangan(e.target.value)
                  }
                  placeholder="Contoh: Kyai Desa"
                  disabled={loading}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="nama-penandatangan"
                  className={LABEL_CLASS}
                >
                  Nama Penandatangan{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="nama-penandatangan"
                  type="text"
                  required
                  value={namaPenandatangan}
                  onChange={(e) => setNamaPenandatangan(e.target.value)}
                  placeholder="Masukkan nama penandatangan"
                  disabled={loading}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </section>

          <section className="border-t border-[#E5EAE6] pt-3">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-[10px] font-semibold text-[#202824]">
                  Daftar Pemateri
                </h3>
                <p className={HELPER_CLASS}>
                  Isi sesi materi atau biarkan kosong jika akan diisi manual.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddPemateriRow}
                disabled={loading}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-[#65B98A]/30 bg-[#E6F2EA] px-2.5 text-[9px] font-semibold text-[#206440] transition hover:bg-[#DCEEE2] disabled:opacity-50"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Tambah Baris
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E5EAE6]">
              <table className="w-full min-w-[500px] border-collapse text-left text-[10px]">
                <thead>
                  <tr className="border-b border-[#E5EAE6] bg-[#F5F7F5] text-[9px] font-semibold text-[#78827C]">
                    <th className="w-8 px-2.5 py-2 text-center">No</th>
                    <th className="w-24 px-2 py-2">Waktu</th>
                    <th className="px-2 py-2">Materi</th>
                    <th className="w-32 px-2 py-2">Petugas</th>
                    <th className="w-24 px-2 py-2">Keterangan</th>
                    <th className="w-8 px-2 py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAE6] bg-white">
                  {pemateriList.map((row, index) => (
                    <tr key={index} className="hover:bg-[#F5F7F5]/50">
                      <td className="px-2.5 py-1.5 text-center font-medium text-[#78827C]">
                        {index + 1}
                      </td>
                      <td className="px-1.5 py-1.5">
                        <input
                          type="text"
                          value={row.waktu}
                          onChange={(e) =>
                            handlePemateriChange(
                              index,
                              "waktu",
                              e.target.value,
                            )
                          }
                          placeholder="08:00 - 09:00"
                          disabled={loading}
                          className="h-8 w-full rounded-lg border border-[#E5EAE6] px-2 text-[10px] text-[#202824] outline-none focus:border-[#287A50]"
                        />
                      </td>
                      <td className="px-1.5 py-1.5">
                        <input
                          type="text"
                          value={row.materi}
                          onChange={(e) =>
                            handlePemateriChange(
                              index,
                              "materi",
                              e.target.value,
                            )
                          }
                          placeholder="Judul materi"
                          disabled={loading}
                          className="h-8 w-full rounded-lg border border-[#E5EAE6] px-2 text-[10px] text-[#202824] outline-none focus:border-[#287A50]"
                        />
                      </td>
                      <td className="px-1.5 py-1.5">
                        <input
                          type="text"
                          value={row.petugas}
                          onChange={(e) =>
                            handlePemateriChange(
                              index,
                              "petugas",
                              e.target.value,
                            )
                          }
                          placeholder="Nama pemateri"
                          disabled={loading}
                          className="h-8 w-full rounded-lg border border-[#E5EAE6] px-2 text-[10px] text-[#202824] outline-none focus:border-[#287A50]"
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
                          className="h-8 w-full rounded-lg border border-[#E5EAE6] px-2 text-[10px] text-[#202824] outline-none focus:border-[#287A50]"
                        />
                      </td>
                      <td className="px-1 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemovePemateriRow(index)}
                          disabled={loading}
                          title="Hapus baris"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#78827C] transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
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
          </section>

          <section className="border-t border-[#E5EAE6] pt-3">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <h3 className="text-[10px] font-semibold text-[#202824]">
                Rekapitulasi Infak
              </h3>
              <span className="text-[9px] text-[#78827C]">Opsional</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  id: "infaq-amplop",
                  label: "Infaq Amplop",
                  value: infaqAmplop,
                  onChange: setInfaqAmplop,
                },
                {
                  id: "infaq-ppg",
                  label: "Infaq PPG",
                  value: infaqPpg,
                  onChange: setInfaqPpg,
                },
                {
                  id: "infaq-presensi",
                  label: "Infaq Presensi",
                  value: infaqPresensi,
                  onChange: setInfaqPresensi,
                },
              ].map((item) => (
                <div key={item.id} className="min-w-0">
                  <label htmlFor={item.id} className={LABEL_CLASS}>
                    {item.label}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[10px] text-[#9AA39D]">
                      Rp
                    </span>
                    <input
                      id={item.id}
                      type="text"
                      inputMode="numeric"
                      value={
                        item.value ? item.value.toLocaleString("id-ID") : ""
                      }
                      onChange={(e) =>
                        item.onChange(parseNumberInput(e.target.value))
                      }
                      placeholder="0"
                      disabled={loading}
                      className={`${INPUT_CLASS} pl-8`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] px-3.5 py-3">
              <span className="text-[10px] font-semibold text-[#202824]">
                Jumlah Total Infak
              </span>
              <span className="text-xs font-bold text-[#287A50]">
                {formatRupiahIndonesia(totalInfaq)}
              </span>
            </div>
          </section>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex min-h-9 items-center justify-center rounded-xl border border-[#E5EAE6] bg-white px-3.5 py-2 text-[9px] font-semibold text-[#202824] transition hover:bg-[#F0F4F1] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-[#287A50] px-4 py-2 text-[9px] font-semibold text-white transition hover:bg-[#206440] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
                  strokeWidth="1.8"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3"
                  />
                </svg>
                Unduh Berita Acara
              </>
            )}
          </button>
        </footer>
      </form>
    </ModalWrapper>
  );
}
