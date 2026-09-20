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
    className: "bg-emerald-50 text-emerald-700",
  },

  terlambat: {
    label: "Terlambat",
    className: "bg-violet-50 text-violet-700",
  },

  izin: {
    label: "Izin",
    className: "bg-yellow-50 text-yellow-700",
  },

  sakit: {
    label: "Sakit",
    className: "bg-blue-50 text-blue-700",
  },

  alpa: {
    label: "Alpa",
    className: "bg-red-50 text-red-700",
  },
};

export default function MonitoringStatusBadge({ status }: Props) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
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
