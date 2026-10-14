import { getDashboardData } from "../../src/backend/admin/dashboard-actions";
import { formatRentangTanggal } from "../../src/backend/kegiatan/format";
import NestedBarChart from "./nested-bar-chart";

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
    orange: "bg-orange-400",
    teal: "bg-teal-400",
    blue: "bg-blue-400",
    violet: "bg-violet-400",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles[variant]}`}
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

function PanelHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="shrink-0 border-b border-gray-200 px-4 py-2.5">
      <h2 className="text-xs font-semibold text-gray-800">{title}</h2>
      <p className="mt-0.5 text-[10px] text-gray-400">{description}</p>
    </div>
  );
}

function AttendanceChart({
  data,
}: {
  data: { label: string; jumlah: number }[];
}) {
  const colors: Record<string, string> = {
    Hadir: "bg-teal-500",
    Terlambat: "bg-amber-400",
    Izin: "bg-blue-400",
    Sakit: "bg-violet-400",
    Alpa: "bg-rose-400",
  };

  const total = data.reduce((sum, item) => sum + item.jumlah, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] text-gray-500">Total presensi tercatat</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {total.toLocaleString("id-ID")}
          </p>
        </div>
        <p className="text-[10px] text-gray-400">Semua kegiatan</p>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
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
              <p className="text-[10px] text-gray-500">{item.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-800">
                {item.jumlah.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {total === 0 && (
        <p className="pt-1 text-[10px] text-gray-400">
          Belum ada presensi dengan status yang sudah ditetapkan.
        </p>
      )}
    </div>
  );
}

export default async function AdminPage() {
  const data = await getDashboardData();

  const judulAnggota = data.isSuperAdmin
    ? "Muda-Mudi per Desa dan Kelompok"
    : "Muda-Mudi per Kelompok";

  const deskripsiAnggota = data.isSuperAdmin
    ? "Total tiap desa (kotak putus-putus) membungkus bar tiap kelompok. Arahkan kursor atau ketuk bar untuk detail."
    : "Jumlah anggota di setiap kelompok pada desa Anda. Arahkan kursor atau ketuk bar untuk detail.";

  return (
    <main className="min-h-dvh bg-gray-50 lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <div className="mx-auto flex w-full flex-col px-4 py-5 sm:px-6 md:px-7 lg:h-full lg:min-h-0 lg:px-8 lg:py-5">
        <header className="mb-4 shrink-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
            Dashboard
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
            Ringkasan Dashboard
          </h1>

          <p className="mt-1 text-[10px] leading-4 text-gray-500 sm:text-xs">
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
            label="Total Anggota"
            value={data.totalAnggota}
            description="Muda-Mudi terdaftar"
            variant="orange"
          />

          <SummaryCard
            label="Total Kegiatan"
            value={data.totalKegiatan}
            description="Seluruh kegiatan terdaftar"
            variant="teal"
          />

          <SummaryCard
            label="Total Presensi"
            value={data.totalPresensi}
            description="Hadir, terlambat, izin, sakit, alpa"
            variant="blue"
          />

          <SummaryCard
            label="Kegiatan Aktif"
            value={data.kegiatanAktif}
            description="Jendela presensi aktif"
            variant="violet"
          />
        </div>

        <div className="mt-4 grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:grid-rows-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <PanelHeader
              title="Kegiatan Terdekat"
              description="Kegiatan yang belum melewati waktu selesai."
            />

            <div className="min-h-0 flex-1 overflow-y-auto">
              {data.kegiatanTerdekat.length === 0 ? (
                <div className="flex h-full min-h-20 items-center justify-center px-4 py-6 text-center text-[11px] text-gray-500">
                  Belum ada kegiatan terdekat.
                </div>
              ) : (
                data.kegiatanTerdekat.map((kegiatan) => (
                  <div
                    key={kegiatan.id}
                    className="border-b border-gray-100 px-4 py-2.5 last:border-b-0"
                  >
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
                      <p className="mt-0.5 truncate text-[10px] text-gray-400">
                        {kegiatan.lokasi}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <PanelHeader
              title="Distribusi Status Presensi"
              description="Jumlah catatan berdasarkan status pada seluruh kegiatan."
            />

            <div className="min-h-0 flex-1 overflow-hidden p-4">
              <AttendanceChart data={data.statusDistribusi} />
            </div>
          </section>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:col-span-2">
            <PanelHeader title={judulAnggota} description={deskripsiAnggota} />

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
