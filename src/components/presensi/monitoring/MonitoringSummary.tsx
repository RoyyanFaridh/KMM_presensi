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
  className: string;
};

function SummaryCard({
  label,
  value,
  className,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-500">{label}</p>

        <span
          className={`h-2 w-2 shrink-0 rounded-full ${className}`}
          aria-hidden="true"
        />
      </div>

      <p className="mt-1.5 text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
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
  return (
    <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-7">
      {/* Total */}
      <div className="col-span-3 lg:col-span-1">
        <SummaryCard
          label="Total"
          value={totalPeserta}
          className="bg-gray-500"
        />
      </div>

      {/* Status */}
      <SummaryCard
        label="Hadir"
        value={totalHadir}
        className="bg-emerald-500"
      />

      <SummaryCard
        label="Terlambat"
        value={totalTerlambat}
        className="bg-violet-500"
      />

      <SummaryCard
        label="Izin"
        value={totalIzin}
        className="bg-yellow-400"
      />

      <SummaryCard
        label="Sakit"
        value={totalSakit}
        className="bg-blue-500"
      />

      <SummaryCard
        label="Alpa"
        value={totalAlpa}
        className="bg-red-500"
      />

      <SummaryCard
        label="Belum Hadir"
        value={totalBelumHadir}
        className="bg-gray-400"
      />
    </div>
  );
}