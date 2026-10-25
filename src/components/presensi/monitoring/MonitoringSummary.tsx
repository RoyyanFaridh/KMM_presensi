"use client";

type Props = {
  totalPeserta: number;
  totalHadir: number;
  totalTerlambat: number;
  totalIzin: number;
  totalSakit: number;
  totalAlpa: number;
  totalBelumHadir: number;
};

type SummaryCardProps = {
  label: string;
  value: number;
  percentage: number;
  valueClass: string;
  dotClass: string;
};

function SummaryCard({
  label,
  value,
  percentage,
  valueClass,
  dotClass,
}: SummaryCardProps) {
  const safePercentage = Math.min(100, Math.max(0, percentage));

  return (
    <article className="min-w-0 rounded-xl border border-gray-200/80 bg-white px-2.5 py-2.5 shadow-sm transition-colors hover:border-gray-300 sm:px-3 sm:py-3">
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`}
          aria-hidden="true"
        />

        <p
          className="truncate text-[10px] font-medium leading-4 text-gray-500 sm:text-[11px]"
          title={label}
        >
          {label}
        </p>
      </div>

      <p
        className={`mt-2.5 text-lg font-bold leading-tight tracking-tight text-gray-900 ${valueClass}`}
      >
        {value.toLocaleString("id-ID")}
      </p>

      <div className="mt-2.5 flex items-center gap-2">
        <div
          className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-label={`${label}: ${safePercentage.toFixed(1)} persen`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={safePercentage}
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${dotClass}`}
            style={{ width: `${safePercentage}%` }}
          />
        </div>

        <span className="shrink-0 text-[10px] font-semibold tabular-nums text-gray-500">
          {percentage.toLocaleString("id-ID", {
            maximumFractionDigits: 1,
          })}
          %
        </span>
      </div>
    </article>
  );
}

export default function MonitoringSummary({
  totalPeserta,
  totalHadir,
  totalTerlambat,
  totalIzin,
  totalSakit,
  totalAlpa,
  totalBelumHadir,
}: Props) {
  const safeTotal = Math.max(0, totalPeserta);

  function getPercentage(value: number) {
    if (safeTotal === 0) return 0;
    return (value / safeTotal) * 100;
  }

  const cards: SummaryCardProps[] = [
    {
      label: "Total Peserta",
      value: totalPeserta,
      percentage: safeTotal > 0 ? 100 : 0,
      valueClass: "text-gray-900",
      dotClass: "bg-gray-400",
    },
    {
      label: "Hadir",
      value: totalHadir,
      percentage: getPercentage(totalHadir),
      valueClass: "text-emerald-600",
      dotClass: "bg-emerald-500",
    },
    {
      label: "Terlambat",
      value: totalTerlambat,
      percentage: getPercentage(totalTerlambat),
      valueClass: "text-violet-600",
      dotClass: "bg-violet-500",
    },
    {
      label: "Izin",
      value: totalIzin,
      percentage: getPercentage(totalIzin),
      valueClass: "text-amber-600",
      dotClass: "bg-amber-500",
    },
    {
      label: "Sakit",
      value: totalSakit,
      percentage: getPercentage(totalSakit),
      valueClass: "text-blue-600",
      dotClass: "bg-blue-500",
    },
    {
      label: "Alpa",
      value: totalAlpa,
      percentage: getPercentage(totalAlpa),
      valueClass: "text-red-600",
      dotClass: "bg-red-500",
    },
    {
      label: "Belum Hadir",
      value: totalBelumHadir,
      percentage: getPercentage(totalBelumHadir),
      valueClass: "text-slate-700",
      dotClass: "bg-slate-400",
    },
  ];

  return (
    <section aria-label="Ringkasan presensi" className="min-w-0">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-[13px] font-semibold tracking-tight text-gray-900 sm:text-sm">
            Statistik Kehadiran
          </h2>

          <p className="mt-0.5 text-[10px] text-gray-500 sm:text-[11px]">
            Rekap status presensi peserta.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-teal-50 px-2 py-1 text-[10px] font-semibold text-teal-700">
          <span
            className="h-1.5 w-1.5 rounded-full bg-teal-500"
            aria-hidden="true"
          />
          {safeTotal.toLocaleString("id-ID")} peserta
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 xl:grid-cols-7">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className={index === 0 ? "col-span-3 xl:col-span-1" : ""}
          >
            <SummaryCard {...card} />
          </div>
        ))}
      </div>
    </section>
  );
}
