import { PresensiStatus } from "../../../backend/presensi/types";

type Props = {
  status: PresensiStatus | null;
};

const STATUS_CONFIG: Record<
  PresensiStatus,
  {
    label: string;
    className: string;
  }
> = {
  hadir: {
    label: "Hadir",
    className: "bg-[#E6F2EA] text-[#206440] border border-[#65B98A]/30",
  },

  terlambat: {
    label: "Terlambat",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },

  izin: {
    label: "Izin",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },

  sakit: {
    label: "Sakit",
    className: "bg-purple-50 text-purple-700 border border-purple-200",
  },

  alpa: {
    label: "Alpa",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

export default function MonitoringStatusBadge({ status }: Props) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full border border-[#E5EAE6] bg-[#F5F7F5] px-2 py-0.5 text-[10px] font-medium text-[#78827C]">
        Belum Hadir
      </span>
    );
  }

  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
