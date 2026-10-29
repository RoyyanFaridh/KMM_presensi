
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
    <article className="min-w-0 rounded-xl border border-gray-200/80 bg-white px-2.5 py-2.5 shadow-xs transition-colors hover:border-gray-300 sm:px-3 sm:py-3">
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
        className={`mt-2 text-lg font-bold leading-tight tracking-tight text-gray-900 ${valueClass}`}
      >
        {value.toLocaleString("id-ID")}
      </p>

      <div className="mt-2 flex items-center gap-2">
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
          {safePercentage.toLocaleString("id-ID", {
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

  const statusCards: SummaryCardProps[] = [
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
  ];

  const belumHadirCard: SummaryCardProps = {
    label: "Belum Hadir",
    value: totalBelumHadir,
    percentage: getPercentage(totalBelumHadir),
    valueClass: "text-slate-700",
    dotClass: "bg-slate-400",
  };

  return (
    <section
      aria-label="Ringkasan presensi"
      className="min-w-0 space-y-2.5"
    >
      {/* Baris pertama: Total Muda-Mudi dan Belum Hadir */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <SummaryCard
          label="Total Muda-Mudi"
          value={totalPeserta}
          percentage={safeTotal > 0 ? 100 : 0}
          valueClass="text-gray-900"
          dotClass="bg-teal-600"
        />

        <div className="hidden sm:block">
          <SummaryCard {...belumHadirCard} />
        </div>
      </div>

      {/* Baris kedua: lima statistik dengan lebar sama */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {statusCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}

        {/* Belum Hadir tetap tampil di mobile */}
        <div className="sm:hidden">
          <SummaryCard {...belumHadirCard} />
        </div>
      </div>
    </section>
  );
}
