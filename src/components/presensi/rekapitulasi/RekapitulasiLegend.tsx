type Props = {
  className?: string;
};

const LEGEND_ITEMS = [
  {
    label: "Hadir",
    className: "bg-emerald-500",
  },
  {
    label: "Terlambat",
    className: "bg-amber-400",
  },
  {
    label: "Izin",
    className: "bg-violet-500",
  },
  {
    label: "Sakit",
    className: "bg-blue-500",
  },
  {
    label: "Alpa",
    className: "bg-red-500",
  },
];

export default function RekapitulasiLegend({ className = "" }: Props) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] text-gray-600 ${className}`}
      aria-label="Keterangan status kehadiran"
    >
      {LEGEND_ITEMS.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${item.className}`}
            aria-hidden="true"
          />
          {item.label}
        </span>
      ))}

      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <span
          className="h-2 w-2 shrink-0 rounded-full border border-gray-300 bg-white"
          aria-hidden="true"
        />
        Belum Hadir
      </span>

      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-gray-400">
        <span className="inline-flex h-2 w-2 shrink-0 items-center justify-center text-[9px]">
          -
        </span>
        Tidak Berlaku
      </span>
    </div>
  );
}
