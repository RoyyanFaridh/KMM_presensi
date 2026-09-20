import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Verifikasi Data",
    description: "Masukkan nama dan tanggal lahir untuk memverifikasi data.",
  },
  {
    number: "02",
    title: "Scan QR Kegiatan",
    description: "Buka kamera dan scan QR Code kegiatan yang tersedia.",
  },
  {
    number: "03",
    title: "Konfirmasi Presensi",
    description: "Periksa detail kegiatan dan konfirmasi kehadiran.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen w-full max-w-8xl flex-col px-5 sm:px-8 lg:px-10">
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
              href="/presensi"
              className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-teal-600 px-5 text-[11px] font-medium text-white transition hover:bg-teal-700"
            >
              Mulai Presensi
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

        <section className="border-t border-gray-200 py-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3.5"
              >
                <span className="text-[10px] font-semibold text-amber-600">
                  {step.number}
                </span>

                <h2 className="mt-1 text-[11px] font-semibold text-gray-800">
                  {step.title}
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="flex h-12 items-center">
          <p className="text-[9px] text-gray-400">SIKEMA</p>
        </footer>
      </div>
    </main>
  );
}
