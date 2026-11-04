import { getDashboardData } from "../../src/backend/admin/dashboard-actions";
import { formatRentangTanggal } from "../../src/backend/kegiatan/format";
import NestedBarChart from "./nested-bar-chart";

function SummaryCard({
  label,
  value,
  description,
  variant,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  variant: "orange" | "teal" | "blue" | "violet";
  icon: React.ReactNode;
}) {
  const styles = {
    orange: { dot: "bg-[#287A50]", box: "bg-[#E6F2EA] text-[#287A50] border-[#E5EAE6]" },
    teal: { dot: "bg-[#206440]", box: "bg-[#E6F2EA] text-[#206440] border-[#E5EAE6]" },
    blue: { dot: "bg-[#181C1B]", box: "bg-[#F0F4F1] text-[#202824] border-[#E5EAE6]" },
    violet: { dot: "bg-[#65B98A]", box: "bg-[#E6F2EA] text-[#287A50] border-[#E5EAE6]" },
  };

  const current = styles[variant];

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E5EAE6] bg-white p-4 shadow-xs transition-all hover:border-[#65B98A]/50 hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${current.dot}`} />
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-[#78827C]">
            {label}
          </p>
        </div>

        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${current.box}`}>
          {icon}
        </div>
      </div>

      <div className="mt-2.5">
        <p className="text-2xl font-bold tracking-tight text-[#202824]">
          {value.toLocaleString("id-ID")}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-[#78827C]">{description}</p>
      </div>
    </div>
  );
}

function PanelHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-[#E5EAE6] px-5 py-3.5">
      {icon && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#E5EAE6] bg-[#E6F2EA] text-[#287A50]">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <h2 className="text-[12px] font-bold tracking-tight text-[#202824]">{title}</h2>
        <p className="text-[10px] leading-4 text-[#78827C]">{description}</p>
      </div>
    </div>
  );
}

function AttendanceChart({
  data,
}: {
  data: { label: string; jumlah: number }[];
}) {
  const colors: Record<string, string> = {
    Hadir: "bg-[#287A50]",
    Terlambat: "bg-amber-500",
    Izin: "bg-blue-500",
    Sakit: "bg-purple-500",
    Alpa: "bg-rose-500",
  };

  const total = data.reduce((sum, item) => sum + item.jumlah, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium text-[#78827C]">Total presensi tercatat</p>
          <p className="mt-1 text-2xl font-bold text-[#202824]">
            {total.toLocaleString("id-ID")}
          </p>
        </div>
        <p className="text-[10px] text-[#78827C]">Semua kegiatan</p>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#E5EAE6]">
        {data.map((item) => (
          <div
            key={item.label}
            className={colors[item.label] ?? "bg-gray-400"}
            style={{
              width: total > 0 ? `${(item.jumlah / total) * 100}%` : "0%",
            }}
            title={`${item.label}: ${item.jumlah}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-5">
        {data.map((item) => (
          <div key={item.label} className="flex items-start gap-2">
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                colors[item.label] ?? "bg-gray-400"
              }`}
            />
            <div className="min-w-0">
              <p className="text-[10px] text-[#78827C]">{item.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-[#202824]">
                {item.jumlah.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {total === 0 && (
        <p className="pt-1 text-[10px] text-[#78827C]">
          Belum ada presensi dengan status yang sudah ditetapkan.
        </p>
      )}
    </div>
  );
}

export default async function AdminPage() {
  const data = await getDashboardData();

  const judulAnggota = data.isSuperAdmin
    ? "Generus per Desa dan Kelompok"
    : "Generus per Kelompok";

  const deskripsiAnggota = data.isSuperAdmin
    ? "Total tiap desa (kotak putus-putus) membungkus bar tiap kelompok. Arahkan kursor atau ketuk bar untuk detail."
    : "Jumlah Generus di setiap kelompok pada desa Anda. Arahkan kursor atau ketuk bar untuk detail.";

  return (
    <main className="min-h-dvh bg-[#F5F7F5] lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <div className="mx-auto flex w-full flex-col px-4 py-5 sm:px-6 md:px-7 lg:h-full lg:min-h-0 lg:px-8 lg:py-5">
        <header className="mb-4 shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#287A50]">
            Dashboard
          </p>

          <h1 className="mt-1 text-xl font-bold tracking-tight text-[#202824]">
            Ringkasan Dashboard
          </h1>

          <p className="mt-1 text-[11px] leading-4 text-[#78827C] sm:text-xs">
            Ringkasan data anggota, kegiatan, dan aktivitas presensi.
          </p>
        </header>

        {data.error && (
          <div className="mb-3 shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-600">
            Gagal memuat sebagian data dashboard. Periksa koneksi dan hak akses
            database.
          </div>
        )}

        <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Total Generus"
            value={data.totalAnggota}
            description="Generus terdaftar"
            variant="orange"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21c.5-4 3.5-6 6.5-6s6 2 6.5 6" />
              </svg>
            }
          />

          <SummaryCard
            label="Total Kegiatan"
            value={data.totalKegiatan}
            description="Seluruh kegiatan terdaftar"
            variant="teal"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            }
          />

          <SummaryCard
            label="Total Presensi"
            value={data.totalPresensi}
            description="Hadir, izin, sakit, alpa"
            variant="blue"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            }
          />

          <SummaryCard
            label="Kegiatan Aktif"
            value={data.kegiatanAktif}
            description="Jendela presensi aktif"
            variant="violet"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
        </div>

        <div className="mt-4 grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:grid-rows-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xs">
            <PanelHeader
              title="Kegiatan Terdekat"
              description="Kegiatan yang belum melewati waktu selesai."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              }
            />

            <div className="min-h-0 flex-1 overflow-y-auto">
              {data.kegiatanTerdekat.length === 0 ? (
                <div className="flex h-full min-h-20 items-center justify-center px-4 py-6 text-center text-[11px] text-[#78827C]">
                  Belum ada kegiatan terdekat.
                </div>
              ) : (
                data.kegiatanTerdekat.map((kegiatan) => (
                  <div
                    key={kegiatan.id}
                    className="border-b border-[#E5EAE6] px-5 py-3 transition-colors hover:bg-[#F5F7F5] last:border-b-0"
                  >
                    <p className="truncate text-[12px] font-semibold text-[#202824]">
                      {kegiatan.nama}
                    </p>

                    <p className="mt-1 text-[11px] text-[#78827C]">
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
                      <p className="mt-0.5 truncate text-[10px] text-[#78827C]/80">
                        {kegiatan.lokasi}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xs">
            <PanelHeader
              title="Distribusi Status Presensi"
              description="Jumlah catatan berdasarkan status pada seluruh kegiatan."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M12 20V10M18 20V4M6 20v-4" />
                </svg>
              }
            />

            <div className="min-h-0 flex-1 overflow-hidden p-4">
              <AttendanceChart data={data.statusDistribusi} />
            </div>
          </section>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xs lg:col-span-2">
            <PanelHeader
              title={judulAnggota}
              description={deskripsiAnggota}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <NestedBarChart
                data={data.anggotaDistribusi}
                emptyMessage="Belum ada data anggota untuk ditampilkan."
                horizontalOnly={!data.isSuperAdmin}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
