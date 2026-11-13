
"use client";

import { useState } from "react";

type PesertaSummary = {
  status: string | null;
  jenis_kelamin: string | null;
  jenjang?: string | null;
};

type Props = {
  totalPeserta: number;
  totalHadir: number;
  totalTerlambat: number;
  totalIzin: number;
  totalSakit: number;
  totalAlpa: number;
  totalBelumHadir: number;
  peserta: PesertaSummary[];
  jenjangSasaran: string[] | null;
};

type StatusKey =
  | "hadir"
  | "terlambat"
  | "izin"
  | "sakit"
  | "alpa"
  | "belum_hadir";

type StatusCardConfig = {
  key: StatusKey;
  label: string;
  color: string;
  dot: string;
};

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

function formatPercentage(value: number) {
  return `${value.toLocaleString("id-ID", {
    maximumFractionDigits: 1,
  })}%`;
}

function getPercentage(value: number, total: number) {
  return total > 0 ? (value / total) * 100 : 0;
}

function getStatusKey(status: string | null): StatusKey {
  switch (status) {
    case "hadir":
      return "hadir";
    case "terlambat":
      return "terlambat";
    case "izin":
      return "izin";
    case "sakit":
      return "sakit";
    case "alpa":
      return "alpa";
    default:
      return "belum_hadir";
  }
}

const STATUS_CONFIG: StatusCardConfig[] = [
  {
    key: "hadir",
    label: "Hadir",
    color: "text-[#287A50]",
    dot: "bg-[#287A50]",
  },
  {
    key: "terlambat",
    label: "Terlambat",
    color: "text-amber-700",
    dot: "bg-amber-500",
  },
  {
    key: "izin",
    label: "Izin",
    color: "text-blue-700",
    dot: "bg-blue-500",
  },
  {
    key: "sakit",
    label: "Sakit",
    color: "text-purple-700",
    dot: "bg-purple-500",
  },
  {
    key: "alpa",
    label: "Alpa",
    color: "text-red-700",
    dot: "bg-red-500",
  },
  {
    key: "belum_hadir",
    label: "Belum Hadir",
    color: "text-[#68736C]",
    dot: "bg-[#9AA39D]",
  },
];

function getJenjangList(
  peserta: PesertaSummary[],
  jenjangSasaran: string[] | null,
) {
  if (jenjangSasaran && jenjangSasaran.length > 0) {
    return [...new Set(jenjangSasaran)];
  }

  const jenjangSet = new Set<string>();

  for (const item of peserta) {
    jenjangSet.add(item.jenjang?.trim() || "Belum Diisi");
  }

  return Array.from(jenjangSet).sort((a, b) =>
    a.localeCompare(b, "id"),
  );
}

function BreakdownRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = getPercentage(value, total);

  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <span className="min-w-0 truncate text-xs text-[#68736C]">
        {label}
      </span>

      <span className={`shrink-0 text-xs font-semibold tabular-nums ${color}`}>
        {formatNumber(value)}
        <span className="ml-1 font-normal text-[#929B94]">
          ({formatPercentage(percentage)})
        </span>
      </span>
    </div>
  );
}

function StatusCard({
  config,
  peserta,
  totalPeserta,
  jenjangList,
  isOpen,
  onToggle,
}: {
  config: StatusCardConfig;
  peserta: PesertaSummary[];
  totalPeserta: number;
  jenjangList: string[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const pesertaStatus = peserta.filter(
    (item) => getStatusKey(item.status) === config.key,
  );

  const totalStatus = pesertaStatus.length;

  const totalLakiLaki = pesertaStatus.filter(
    (item) => item.jenis_kelamin === "Laki-laki",
  ).length;

  const totalPerempuan = pesertaStatus.filter(
    (item) => item.jenis_kelamin === "Perempuan",
  ).length;

  const jenjangCounts = jenjangList.map((jenjang) => ({
    jenjang,
    jumlah: pesertaStatus.filter((item) => {
      const nilaiJenjang = item.jenjang?.trim() || "Belum Diisi";
      return nilaiJenjang === jenjang;
    }).length,
  }));

  const percentageTotal = getPercentage(totalStatus, totalPeserta);

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-[#E8EDE9] bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-[#FAFCFA]"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${config.dot}`} />

          <div className="min-w-0">
            <p className={`truncate text-xs font-semibold ${config.color}`}>
              {config.label}
            </p>
            <p className="mt-0.5 text-[10px] text-[#929B94]">
              {formatPercentage(percentageTotal)} dari sasaran
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <span className={`text-lg font-bold tabular-nums ${config.color}`}>
            {formatNumber(totalStatus)}
          </span>

          <svg
            viewBox="0 0 20 20"
            fill="none"
            className={`h-4 w-4 text-[#929B94] transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              }`}
            aria-hidden="true"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-[#E8EDE9] px-3 pb-3 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#929B94]">
                Jenis kelamin
              </p>

              <BreakdownRow
                label="Laki-laki"
                value={totalLakiLaki}
                total={totalPeserta}
                color="text-blue-700"
              />

              <BreakdownRow
                label="Perempuan"
                value={totalPerempuan}
                total={totalPeserta}
                color="text-pink-600"
              />
            </div>

            <div className="space-y-2 border-l border-[#E8EDE9] pl-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#929B94]">
                Jenjang sasaran
              </p>

              {jenjangCounts.length > 0 ? (
                jenjangCounts.map((item) => (
                  <BreakdownRow
                    key={item.jenjang}
                    label={item.jenjang}
                    value={item.jumlah}
                    total={totalPeserta}
                    color="text-[#287A50]"
                  />
                ))
              ) : (
                <p className="text-[11px] text-[#929B94]">
                  Tidak ada jenjang sasaran.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
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
  peserta,
  jenjangSasaran,
}: Props) {
  const [expandedStatus, setExpandedStatus] = useState<StatusKey | null>(null);

  const safeTotal = Math.max(0, totalPeserta);

  const jenjangList = getJenjangList(peserta, jenjangSasaran);

  const totalLakiLaki = peserta.filter(
    (item) => item.jenis_kelamin === "Laki-laki",
  ).length;

  const totalPerempuan = peserta.filter(
    (item) => item.jenis_kelamin === "Perempuan",
  ).length;

  return (
    <section aria-label="Ringkasan presensi" className="min-w-0 space-y-2.5">
      <div className="grid grid-cols-3 gap-2">
        <article className="rounded-xl border border-[#DCEBE1] bg-[#F5FAF6] px-3 py-2.5">
          <p className="text-[10px] font-medium text-[#64756A]">
            Total Generus
          </p>
          <p className="mt-1 text-xl font-bold leading-none text-[#246B46]">
            {formatNumber(safeTotal)}
          </p>
        </article>

        <article className="rounded-xl border border-[#E8EDE9] bg-white px-3 py-2.5">
          <p className="text-[10px] font-medium text-[#78827C]">
            Laki-laki
          </p>
          <p className="mt-1 text-xl font-bold leading-none text-blue-700">
            {formatNumber(totalLakiLaki)}
          </p>
          <p className="mt-1 text-[10px] text-[#929B94]">
            {formatPercentage(getPercentage(totalLakiLaki, safeTotal))}
          </p>
        </article>

        <article className="rounded-xl border border-[#E8EDE9] bg-white px-3 py-2.5">
          <p className="text-[10px] font-medium text-[#78827C]">
            Perempuan
          </p>
          <p className="mt-1 text-xl font-bold leading-none text-pink-600">
            {formatNumber(totalPerempuan)}
          </p>
          <p className="mt-1 text-[10px] text-[#929B94]">
            {formatPercentage(getPercentage(totalPerempuan, safeTotal))}
          </p>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {STATUS_CONFIG.map((config) => (
          <StatusCard
            key={config.key}
            config={config}
            peserta={peserta}
            totalPeserta={safeTotal}
            jenjangList={jenjangList}
            isOpen={expandedStatus === config.key}
            onToggle={() =>
              setExpandedStatus((current) =>
                current === config.key ? null : config.key,
              )
            }
          />
        ))}
      </div>
    </section>
  );
}
