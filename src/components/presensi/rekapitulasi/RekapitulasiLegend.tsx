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
    className: "bg-violet-500",
  },
  {
    label: "Izin",
    className: "bg-yellow-400",
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
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-gray-500 sm:text-xs ${className}`}
    >
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${item.className}`}
            aria-hidden="true"
          />

          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}