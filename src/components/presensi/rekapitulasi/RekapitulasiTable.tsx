"use client";

import type {
  PresensiStatus,
  RekapitulasiStatus,
  RekapitulasiKegiatan,
  RekapitulasiKehadiran,
  RekapitulasiMudaMudi,
} from "../../../backend/presensi/types";

import { formatRentangTanggal } from "../../../backend/kegiatan/format";
import Pagination from "./Pagination";
import RekapitulasiLegend from "./RekapitulasiLegend";

type RekapStatus = RekapitulasiStatus | "belum_hadir";

type Props = {
  loading: boolean;
  mudaMudi: RekapitulasiMudaMudi[];
  kegiatan: RekapitulasiKegiatan[];
  kehadiran: RekapitulasiKehadiran[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onItemsPerPageChange: (value: number) => void;
  onGoToPage: (page: number) => void;
};

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

const STATUS_STYLES: Record<
  RekapitulasiStatus,
  { className: string; label: string; textClassName: string }
> = {
  hadir: {
    className: "bg-emerald-500 ring-emerald-100",
    label: "Hadir",
    textClassName: "text-emerald-700",
  },
  terlambat: {
    className: "bg-violet-500 ring-violet-100",
    label: "Terlambat",
    textClassName: "text-violet-700",
  },
  izin: {
    className: "bg-amber-400 ring-amber-100",
    label: "Izin",
    textClassName: "text-amber-700",
  },
  sakit: {
    className: "bg-blue-500 ring-blue-100",
    label: "Sakit",
    textClassName: "text-blue-700",
  },
  alpa: {
    className: "bg-red-500 ring-red-100",
    label: "Alpa",
    textClassName: "text-red-700",
  },
  tidak_berlaku: {
    className: "bg-gray-300 ring-gray-100",
    label: "Tidak Berlaku",
    textClassName: "text-gray-500",
  },
};

const SUMMARY_COLUMNS = [
  {
    key: "hadir",
    label: "H",
    title: "Hadir",
    textClassName: "text-emerald-700",
    headerClassName: "text-emerald-800",
  },
  {
    key: "terlambat",
    label: "T",
    title: "Terlambat",
    textClassName: "text-amber-700",
    headerClassName: "text-amber-800",
  },
  {
    key: "izin",
    label: "I",
    title: "Izin",
    textClassName: "text-violet-700",
    headerClassName: "text-violet-800",
  },
  {
    key: "sakit",
    label: "S",
    title: "Sakit",
    textClassName: "text-blue-700",
    headerClassName: "text-blue-800",
  },
  {
    key: "alpa",
    label: "A",
    title: "Alpa",
    textClassName: "text-red-700",
    headerClassName: "text-red-800",
  },
  {
    key: "belumHadir",
    label: "BH",
    title: "Belum Hadir",
    textClassName: "text-gray-600",
    headerClassName: "text-gray-600",
  },
] as const;

/**
 * Menentukan apakah kegiatan sudah melewati tanggal dan jam selesai.
 * Tanggal dan jam diperlakukan sebagai waktu lokal perangkat.
 */
function isKegiatanSelesai(kegiatan: RekapitulasiKegiatan): boolean {
  const { tanggal_selesai, jam_selesai } = kegiatan;

  if (!tanggal_selesai || !jam_selesai) {
    return false;
  }

  const tanggalValid = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tanggal_selesai);

  const jamValid = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(jam_selesai);

  if (!tanggalValid || !jamValid) {
    return false;
  }

  const tahun = Number(tanggalValid[1]);
  const bulan = Number(tanggalValid[2]);
  const hari = Number(tanggalValid[3]);

  const jam = Number(jamValid[1]);
  const menit = Number(jamValid[2]);
  const detik = Number(jamValid[3] ?? "0");

  // Validasi nilai kalender dan jam untuk menghindari tanggal tidak valid.
  const tanggalPemeriksaan = new Date(tahun, bulan - 1, hari);

  const tanggalBenar =
    tanggalPemeriksaan.getFullYear() === tahun &&
    tanggalPemeriksaan.getMonth() === bulan - 1 &&
    tanggalPemeriksaan.getDate() === hari;

  const jamBenar =
    jam >= 0 &&
    jam <= 23 &&
    menit >= 0 &&
    menit <= 59 &&
    detik >= 0 &&
    detik <= 59;

  if (!tanggalBenar || !jamBenar) {
    return false;
  }

  const waktuSelesai = new Date(tahun, bulan - 1, hari, jam, menit, detik);

  return Date.now() >= waktuSelesai.getTime();
}

function isMudamudiTargeted(
  kegiatan: RekapitulasiKegiatan,
  mudamudi: RekapitulasiMudaMudi,
): boolean {
  const matchesDesa =
    !kegiatan.desa ||
    kegiatan.desa.length === 0 ||
    kegiatan.desa.includes(mudamudi.desa);

  const matchesKelompok =
    !kegiatan.kelompok ||
    kegiatan.kelompok.length === 0 ||
    kegiatan.kelompok.includes(mudamudi.kelompok);

  const matchesKelas =
    !kegiatan.kelas ||
    kegiatan.kelas.length === 0 ||
    kegiatan.kelas.includes(mudamudi.kelas);

  const matchesJenisKelamin =
    !kegiatan.jenis_kelamin ||
    kegiatan.jenis_kelamin === mudamudi.jenis_kelamin;

  return matchesDesa && matchesKelompok && matchesKelas && matchesJenisKelamin;
}

function getStatusStyle(status: RekapitulasiStatus) {
  return STATUS_STYLES[status];
}

function formatStatusCount(value: number): string {
  return value.toLocaleString("id-ID");
}

export default function RekapitulasiTable({
  loading,
  mudaMudi,
  kegiatan,
  kehadiran,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
  onGoToPage,
}: Props) {
  const displayStart =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

  const displayEnd =
    totalItems === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalItems);

  const attendanceMap = new Map<string, RekapitulasiStatus>();

  kehadiran.forEach((item) => {
    attendanceMap.set(`${item.mudamudi_id}-${item.kegiatan_id}`, item.status);
  });

  function getStatus(
    mudamudi: RekapitulasiMudaMudi,
    kegiatanItem: RekapitulasiKegiatan,
  ): RekapStatus {
    const key = `${mudamudi.id}-${kegiatanItem.id}`;
    const statusPresensi = attendanceMap.get(key);
    const kegiatanSelesai = isKegiatanSelesai(kegiatanItem);

    // Peserta di luar sasaran kegiatan tidak memiliki kewajiban presensi.
    if (
      statusPresensi === "tidak_berlaku" ||
      !isMudamudiTargeted(kegiatanItem, mudamudi)
    ) {
      return "tidak_berlaku";
    }

    /*
     * Jika backend mengirim Alpa untuk peserta yang belum memiliki
     * presensi, jangan tampilkan Alpa sebelum kegiatan selesai.
     *
     * Catatan: ini merupakan pengaman tampilan. Sumber data backend
     * tetap perlu dipastikan agar tidak membuat Alpa secara prematur.
     */
    if (statusPresensi === "alpa" && !kegiatanSelesai) {
      return "belum_hadir";
    }

    // Status presensi yang sudah tercatat tetap menjadi sumber utama.
    if (statusPresensi) {
      return statusPresensi;
    }

    // Peserta sasaran yang belum tercatat: tentukan dari waktu selesai.
    return kegiatanSelesai ? "alpa" : "belum_hadir";
  }

  function getStatusTotals(mudamudi: RekapitulasiMudaMudi) {
    const totals: Record<PresensiStatus, number> = {
      hadir: 0,
      terlambat: 0,
      izin: 0,
      sakit: 0,
      alpa: 0,
    };

    let belumHadir = 0;

    kegiatan.forEach((kegiatanItem) => {
      const status = getStatus(mudamudi, kegiatanItem);

      if (status === "belum_hadir") {
        belumHadir++;
      } else if (status !== "tidak_berlaku") {
        totals[status]++;
      }
    });

    return { ...totals, belumHadir };
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) {
      return;
    }

    onGoToPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (loading) {
    return (
      <div className="px-5 py-12 text-center">
        <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600" />
        <p className="mt-3 text-[11px] text-gray-500">
          Memuat rekapitulasi presensi...
        </p>
      </div>
    );
  }

  if (mudaMudi.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h4m-7 4h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
            />
          </svg>
        </div>
        <p className="mt-3 text-[11px] font-semibold text-gray-700">
          Data Muda-Mudi tidak ditemukan
        </p>
        <p className="mt-1 text-[10px] text-gray-500">
          Coba ubah kata kunci atau filter yang digunakan.
        </p>
      </div>
    );
  }

  if (kegiatan.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <p className="text-[11px] font-semibold text-gray-700">
          Tidak ada kegiatan pada filter yang dipilih
        </p>
        <p className="mt-1 text-[10px] text-gray-500">
          Coba pilih bulan atau kegiatan lainnya.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col bg-white">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
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
                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
              />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-800">
              Rekapitulasi Kehadiran
            </p>
            <p className="mt-0.5 text-[10px] text-gray-400">
              Ringkasan status setiap kegiatan
            </p>
          </div>
        </div>

        <p className="text-[10px] text-gray-500">
          Menampilkan{" "}
          <span className="font-semibold tabular-nums text-gray-700">
            {displayStart}–{displayEnd}
          </span>{" "}
          dari{" "}
          <span className="font-semibold tabular-nums text-gray-700">
            {totalItems}
          </span>{" "}
          peserta
        </p>
      </div>

      <div className="shrink-0 border-b border-gray-100 bg-gray-50/70 px-4 py-2.5 sm:px-5">
        <RekapitulasiLegend />
      </div>

      <div className="hidden min-h-0 overflow-auto lg:block">
        <table className="min-w-max border-separate border-spacing-0 text-[13px]">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="sticky left-0 z-40 min-w-64 border-b border-r border-gray-200 bg-gray-50 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Muda-Mudi
              </th>

              {kegiatan.map((item) => (
                <th
                  key={item.id}
                  className="min-w-36 border-b border-gray-200 bg-gray-50 px-3 py-3 text-center"
                >
                  <div
                    className="mx-auto max-w-36 truncate text-[11px] font-semibold normal-case tracking-normal text-gray-800"
                    title={item.nama}
                  >
                    {item.nama}
                  </div>
                  <div
                    className="mx-auto mt-1 max-w-36 truncate whitespace-nowrap text-[10px] font-medium text-gray-500"
                    title={formatRentangTanggal(
                      item.tanggal_mulai,
                      item.tanggal_selesai,
                    )}
                  >
                    {formatRentangTanggal(
                      item.tanggal_mulai,
                      item.tanggal_selesai,
                    )}
                  </div>
                  <div
                    className="mx-auto mt-0.5 max-w-36 truncate text-[9px] font-normal text-gray-400"
                    title={item.lokasi}
                  >
                    {item.lokasi}
                  </div>
                </th>
              ))}

              {SUMMARY_COLUMNS.map((column, index) => {
                const rightOffset = (SUMMARY_COLUMNS.length - index - 1) * 40;

                return (
                  <th
                    key={column.key}
                    title={column.title}
                    className={`sticky z-40 w-10 min-w-10 border-b border-gray-200 bg-gray-50 px-1 py-3 text-center text-[10px] font-semibold ${
                      column.key === "belumHadir" ? "border-l" : ""
                    } ${column.headerClassName}`}
                    style={{ right: `${rightOffset}px` }}
                  >
                    {column.label}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {mudaMudi.map((item) => {
              const totals = getStatusTotals(item);

              return (
                <tr
                  key={item.id}
                  className="group transition-colors hover:bg-teal-50/40"
                >
                  <td className="sticky left-0 z-30 min-w-64 border-b border-r border-gray-100 bg-white px-4 py-2.5 transition-colors group-hover:bg-teal-50/40">
                    <div className="whitespace-nowrap text-[11px] font-semibold text-gray-800">
                      {item.nama}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-[9px] text-gray-400">
                      <span>{item.desa}</span>
                      <span className="text-gray-300">•</span>
                      <span>{item.kelompok}</span>
                    </div>
                  </td>

                  {kegiatan.map((kegiatanItem) => {
                    const status = getStatus(item, kegiatanItem);

                    if (status === "tidak_berlaku") {
                      return (
                        <td
                          key={kegiatanItem.id}
                          className="border-b border-gray-100 px-3 py-2.5 text-center"
                        >
                          <span
                            className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-[9px] font-medium text-gray-500"
                            title="Tidak Berlaku"
                            aria-label="Tidak Berlaku"
                          >
                            -
                          </span>
                        </td>
                      );
                    }

                    const belumHadir = status === "belum_hadir";
                    const statusStyle = belumHadir
                      ? undefined
                      : getStatusStyle(status);

                    return (
                      <td
                        key={kegiatanItem.id}
                        className="border-b border-gray-100 px-3 py-2.5 text-center"
                      >
                        <span
                          className={`mx-auto block h-2.5 w-2.5 rounded-full ring-2 ring-offset-1 ring-offset-white ${
                            belumHadir
                              ? "border border-gray-300 bg-white ring-gray-100"
                              : (statusStyle?.className ?? "")
                          }`}
                          title={
                            belumHadir
                              ? "Belum Hadir"
                              : (statusStyle?.label ?? "Status tidak diketahui")
                          }
                          aria-label={
                            belumHadir
                              ? "Belum Hadir"
                              : (statusStyle?.label ?? "Status tidak diketahui")
                          }
                        />
                      </td>
                    );
                  })}

                  {SUMMARY_COLUMNS.map((column, index) => {
                    const rightOffset =
                      (SUMMARY_COLUMNS.length - index - 1) * 40;
                    const value = totals[column.key];

                    return (
                      <td
                        key={column.key}
                        className={`sticky z-30 w-10 min-w-10 border-b border-gray-100 bg-white px-1 py-2.5 text-center transition-colors group-hover:bg-teal-50/40 ${
                          column.key === "belumHadir" ? "border-l" : ""
                        }`}
                        style={{ right: `${rightOffset}px` }}
                      >
                        <span
                          className={`text-[11px] font-semibold tabular-nums ${column.textClassName}`}
                          title={`${column.title}: ${value}`}
                        >
                          {formatStatusCount(value)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="min-h-0 overflow-auto lg:hidden">
        <table className="w-full border-separate border-spacing-0 text-[13px]">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="min-w-0 border-b border-gray-200 bg-gray-50 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Peserta
              </th>

              {SUMMARY_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  title={column.title}
                  className={`w-9 border-b border-gray-200 bg-gray-50 px-0.5 py-3 text-center text-[10px] font-semibold ${column.headerClassName} ${
                    column.key === "belumHadir" ? "border-l" : ""
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {mudaMudi.map((item) => {
              const totals = getStatusTotals(item);

              return (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="max-w-0 border-b border-gray-100 px-3 py-3">
                    <div className="truncate text-[11px] font-semibold text-gray-800">
                      {item.nama}
                    </div>
                    <div className="mt-1 flex min-w-0 items-center gap-1 truncate text-[9px] text-gray-400">
                      <span className="truncate">{item.desa}</span>
                      <span className="shrink-0 text-gray-300">•</span>
                      <span className="truncate">{item.kelompok}</span>
                    </div>
                  </td>

                  {SUMMARY_COLUMNS.map((column) => (
                    <td
                      key={column.key}
                      className={`w-9 border-b border-gray-100 px-0.5 py-3 text-center ${
                        column.key === "belumHadir" ? "border-l" : ""
                      }`}
                    >
                      <span
                        className={`text-[10px] font-semibold tabular-nums ${column.textClassName}`}
                      >
                        {formatStatusCount(totals[column.key])}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="shrink-0 border-t border-gray-100 bg-white">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          perPageOptions={PER_PAGE_OPTIONS}
          onItemsPerPageChange={onItemsPerPageChange}
          onGoToPage={goToPage}
        />
      </div>
    </div>
  );
}
