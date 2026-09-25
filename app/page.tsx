import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Kelola Muda Mudi",
    description:
      "Kelola data Muda Mudi secara terpusat berdasarkan desa dan kelompok.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20"
          strokeLinecap="round"
        />
        <circle cx="10" cy="7.5" r="3.5" />
        <path
          d="M16 4.5a3.5 3.5 0 0 1 0 6.8M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Kelola Kegiatan",
    description:
      "Atur jadwal, lokasi, dan sasaran peserta untuk setiap kegiatan.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
        <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" strokeLinecap="round" />
        <path d="M8 13h3M13 13h3M8 16.5h3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Presensi QR",
    description:
      "Catat kehadiran dengan memindai QR personal Muda-Mudi melalui perangkat admin.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <path
          d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen w-full max-w-8xl flex-col px-5 sm:px-8 lg:px-10">
        {/* HEADER */}
        <header className="flex h-16 items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-tight text-teal-700">
              SIKEMA
            </p>

            <p className="text-[10px] text-gray-400">
              Sistem Informasi Kegiatan dan Muda Mudi
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex h-8 items-center rounded-lg border border-gray-200 bg-white px-3 text-[10px] font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
          >
            Login Admin
          </Link>
        </header>

        {/* HERO */}
        <section className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-xl text-center">
            <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M8 12h8M12 8v8" strokeLinecap="round" />

                <path
                  d="M5 4.5h14A1.5 1.5 0 0 1 20.5 6v12A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5Z"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-teal-600">
              Sistem Informasi
            </p>

            <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Kegiatan dan Muda Mudi
            </h1>

            <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-gray-500">
              Kelola kegiatan, data Muda Mudi, dan presensi dalam satu sistem.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-teal-600 px-5 text-[11px] font-medium text-white transition hover:bg-teal-700"
            >
              Masuk sebagai Admin
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="ml-1.5 h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  d="M4 10h11M11 6l4 4-4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </section>

        {/* FEATURES */}
        <section className="border-t border-gray-200 py-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                    {feature.icon}
                  </div>

                  <span className="text-[10px] font-semibold text-gray-300">
                    {feature.number}
                  </span>
                </div>

                <h2 className="mt-2 text-[11px] font-semibold text-gray-800">
                  {feature.title}
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
