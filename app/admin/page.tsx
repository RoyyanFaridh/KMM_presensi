import { getDashboardData } from "../../src/backend/admin/dashboard-actions";
import { formatRentangTanggal } from "../../src/backend/kegiatan/format";

function formatWaktu(waktu: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(waktu));
}

function SummaryCard({
  label,
  value,
  description,
  variant,
}: {
  label: string;
  value: number;
  description: string;
  variant: "orange" | "teal" | "blue" | "violet";
}) {
  const styles = {
    orange: {
      indicator: "bg-orange-400",
    },
    teal: {
      indicator: "bg-teal-400",
    },
    blue: {
      indicator: "bg-blue-400",
    },
    violet: {
      indicator: "bg-violet-400",
    },
  };

  const style = styles[variant];

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.indicator}`}
        />

        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
      </div>

      <p className="mt-1.5 text-xl font-semibold text-gray-900">{value}</p>

      <p className="mt-0.5 text-[10px] text-gray-400">{description}</p>
    </div>
  );
}

export default async function AdminPage() {
  const data = await getDashboardData();

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 md:px-7 lg:px-8">
        {/* HEADER */}
        <div className="mb-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
            Dashboard
          </p>

          <div className="mt-1 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                Ringkasan Dashboard
              </h1>

              <p className="mt-1 max-w-xs text-[10px] leading-4 text-gray-500 sm:max-w-none sm:text-xs">
                Ringkasan data dan aktivitas presensi.
              </p>
            </div>
          </div>
        </div>

        {data.error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-600">
            Gagal memuat sebagian data dashboard.
          </div>
        )}

        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Total Anggota"
            value={data.totalAnggota}
            description="Data peserta terdaftar"
            variant="orange"
          />

          <SummaryCard
            label="Total Kegiatan"
            value={data.totalKegiatan}
            description="Seluruh kegiatan"
            variant="teal"
          />

          <SummaryCard
            label="Total Presensi"
            value={data.totalPresensi}
            description="Presensi yang tercatat"
            variant="blue"
          />

          <SummaryCard
            label="Kegiatan Aktif"
            value={data.kegiatanAktif}
            description="Sedang berlangsung"
            variant="violet"
          />
        </div>

        {/* CONTENT */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* KEGIATAN TERDEKAT */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-[12px] font-semibold text-gray-800">
                Kegiatan Terdekat
              </h2>

              <p className="mt-0.5 text-[10px] text-gray-400">
                Kegiatan yang akan berlangsung.
              </p>
            </div>

            {data.kegiatanTerdekat.length === 0 ? (
              <div className="px-4 py-8 text-center text-[11px] text-gray-500">
                Belum ada kegiatan terdekat.
              </div>
            ) : (
              <div>
                {data.kegiatanTerdekat.map((kegiatan) => (
                  <div
                    key={kegiatan.id}
                    className="border-b border-gray-100 px-4 py-3 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-gray-800">
                          {kegiatan.nama}
                        </p>

                        <p className="mt-1 text-[10px] text-gray-500">
                          {formatRentangTanggal(
                            kegiatan.tanggal_mulai,
                            kegiatan.tanggal_selesai,
                          )}
                          {" · "}
                          {kegiatan.jam_mulai.slice(0, 5)}
                          {"–"}
                          {kegiatan.jam_selesai.slice(0, 5)}
                        </p>

                        {kegiatan.lokasi && (
                          <p className="mt-0.5 text-[10px] text-gray-400">
                            {kegiatan.lokasi}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-medium text-gray-500">
                        Kegiatan
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* PRESENSI TERBARU */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-[12px] font-semibold text-gray-800">
                Presensi Terbaru
              </h2>

              <p className="mt-0.5 text-[10px] text-gray-400">
                Lima presensi terakhir yang tercatat.
              </p>
            </div>

            {data.presensiTerbaru.length === 0 ? (
              <div className="px-4 py-8 text-center text-[11px] text-gray-500">
                Belum ada presensi.
              </div>
            ) : (
              <div>
                {data.presensiTerbaru.map((presensi: any) => (
                  <div
                    key={presensi.id}
                    className="border-b border-gray-100 px-4 py-3 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-gray-800">
                          {presensi.mudamudi?.nama ?? "Nama tidak tersedia"}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-gray-500">
                          {presensi.kegiatan?.nama ?? "Kegiatan tidak tersedia"}
                        </p>
                      </div>

                      <p className="shrink-0 text-[10px] text-gray-400">
                        {formatWaktu(presensi.waktu_checkin)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
