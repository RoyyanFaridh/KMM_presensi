"use client";

import { useState, type CSSProperties } from "react";

export type KelompokDistribusi = { label: string; jumlah: number };
export type DesaDistribusi = {
  label: string;
  jumlah: number;
  kelompok: KelompokDistribusi[];
};

// Hex supaya bisa dipakai untuk border, isi tipis, dan garis miring.
const KELOMPOK_COLORS = [
  "#14b8a6", // teal
  "#0ea5e9", // sky
  "#6366f1", // indigo
  "#d946ef", // fuchsia
  "#f59e0b", // amber
  "#10b981", // emerald
  "#f43f5e", // rose
  "#06b6d4", // cyan
];

function hatchStyle(color: string, active = false): CSSProperties {
  const fill = active ? "40" : "1A";
  const line = active ? "99" : "66";

  return {
    borderColor: color,
    backgroundColor: `${color}${fill}`,
    backgroundImage: `repeating-linear-gradient(135deg, ${color}${line} 0, ${color}${line} 1.5px, transparent 1.5px, transparent 6px)`,
  };
}

export default function NestedBarChart({
  data,
  emptyMessage,
  horizontalOnly = false,
}: {
  data: DesaDistribusi[];
  emptyMessage: string;
  /** true: selalu horizontal (admin Desa). false: vertikal di desktop, horizontal di HP. */
  horizontalOnly?: boolean;
}) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex min-h-24 items-center justify-center text-center text-[11px] text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  // Warna per nama kelompok, konsisten di semua desa.
  const kelompokLabels = Array.from(
    new Set(data.flatMap((desa) => desa.kelompok.map((k) => k.label))),
  ).sort((a, b) => a.localeCompare(b, "id", { numeric: true }));

  const colorOf = (label: string) =>
    KELOMPOK_COLORS[kelompokLabels.indexOf(label) % KELOMPOK_COLORS.length];

  const maxTotal = Math.max(...data.map((desa) => desa.jumlah), 1);
  // Kelipatan 4 dengan ruang tambahan untuk angka di ujung bar.
  const axisMax = Math.max(4, Math.ceil((maxTotal + 1) / 4) * 4);
  const ticks = [0, 1, 2, 3, 4].map((i) => (axisMax / 4) * i);

  const pointerHandlers = (key: string) => ({
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setActiveKey(key);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setActiveKey(null);
    },
    onFocus: () => setActiveKey(key),
    onBlur: () => setActiveKey(null),
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveKey(key);
    },
  });

  return (
    <>
      {/* ================= Desktop / tablet: vertikal (hanya admin Daerah) ================= */}
      {!horizontalOnly && (
        <div className="hidden h-full min-h-64 flex-col sm:flex">
          <div className="flex min-h-44 flex-1">
            {/* Sumbu Y */}
            <div className="flex w-8 shrink-0 flex-col">
              <div className="relative flex-1">
                {ticks.map((tick) => (
                  <span
                    key={tick}
                    className="absolute right-1.5 translate-y-1/2 text-[9px] tabular-nums text-gray-400"
                    style={{ bottom: `${(tick / axisMax) * 100}%` }}
                  >
                    {tick.toLocaleString("id-ID")}
                  </span>
                ))}
              </div>
              <div className="h-10 shrink-0" />
            </div>

            {/* Plot. Klik area kosong untuk menutup tooltip. */}
            <div
              className="flex min-w-0 flex-1 border-l border-gray-300"
              onClick={() => setActiveKey(null)}
            >
              {data.map((desa, desaIndex) => {
                // Separuh pertama: tooltip rata kiri. Sisanya: rata kanan.
                const tooltipAlign =
                  desaIndex < data.length / 2 ? "left-0" : "right-0";

                return (
                  <div
                    key={desa.label}
                    className="flex min-w-0 flex-1 flex-col"
                  >
                    <div className="relative flex-1 border-b border-gray-300 px-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="absolute inset-x-0 border-t border-dashed border-gray-100"
                          style={{ bottom: `${i * 25}%` }}
                        />
                      ))}

                      <div className="relative mx-auto flex h-full w-full max-w-64 items-end justify-center gap-2 px-3">
                        {desa.kelompok.map((kelompok) => {
                          const key = `${desa.label}|${kelompok.label}`;
                          const isActive = activeKey === key;

                          return (
                            <button
                              key={key}
                              type="button"
                              aria-label={`${kelompok.label}, ${desa.label}: ${kelompok.jumlah} muda-mudi`}
                              className="relative flex h-full min-w-1 max-w-10 flex-1 cursor-pointer items-end outline-none"
                              {...pointerHandlers(key)}
                            >
                              <span
                                className="relative block w-full rounded-t-md border border-b-0 transition-colors"
                                style={{
                                  ...hatchStyle(
                                    colorOf(kelompok.label),
                                    isActive,
                                  ),
                                  height: `${(kelompok.jumlah / axisMax) * 100}%`,
                                  minHeight: kelompok.jumlah > 0 ? 2 : 0,
                                }}
                              >
                                <span className="absolute bottom-full left-1/2 mb-0.5 -translate-x-1/2 text-[10px] font-semibold tabular-nums text-gray-700">
                                  {kelompok.jumlah.toLocaleString("id-ID")}
                                </span>
                              </span>

                              {isActive && (
                                <span
                                  role="tooltip"
                                  className={`pointer-events-none absolute top-0 z-20 block whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-left text-[10px] leading-4 text-white shadow-lg ${tooltipAlign}`}
                                >
                                  <span className="block font-semibold">
                                    {kelompok.label}
                                  </span>
                                  <span className="block text-gray-300">
                                    {desa.label}
                                  </span>
                                  <span className="block tabular-nums">
                                    {kelompok.jumlah.toLocaleString("id-ID")}{" "}
                                    muda-mudi
                                  </span>
                                </span>
                              )}
                            </button>
                          );
                        })}

                        {/* Bar desa (di depan, transparan) */}
                        <div
                          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 rounded-t-lg border border-b-0 border-dashed border-slate-400/70 bg-slate-400/10"
                          style={{
                            height: `${(desa.jumlah / axisMax) * 100}%`,
                            minHeight: desa.jumlah > 0 ? 2 : 0,
                          }}
                        />
                      </div>
                    </div>

                    <div
                      className="flex h-10 shrink-0 flex-col justify-center px-1"
                      title={`${desa.label}: ${desa.jumlah.toLocaleString("id-ID")} muda-mudi`}
                    >
                      <p className="truncate text-center text-[11px] font-medium text-gray-700">
                        {desa.label}
                      </p>
                      <p className="text-center text-[10px] tabular-nums text-gray-400">
                        Total {desa.jumlah.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= Horizontal: HP (admin Daerah) / semua ukuran (admin Desa) ================= */}
      <div
        className={`flex flex-col gap-4 ${horizontalOnly ? "" : "sm:hidden"}`}
        onClick={() => setActiveKey(null)}
      >
        {data.map((desa) => (
          <div key={desa.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-[11px] font-medium text-gray-700">
                {desa.label}
              </p>
              <p className="shrink-0 text-[10px] tabular-nums text-gray-400">
                Total {desa.jumlah.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="relative border-b border-l border-gray-300 pr-3">
              {/* Garis bantu vertikal */}
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="pointer-events-none absolute inset-y-0 border-l border-dashed border-gray-100"
                  style={{ left: `${i * 25}%` }}
                />
              ))}

              {/* Baris kelompok (di belakang), masing-masing mulai dari 0 */}
              <div className="relative flex flex-col gap-1.5 py-1.5 sm:gap-2 sm:py-2">
                {desa.kelompok.map((kelompok) => {
                  const key = `${desa.label}|${kelompok.label}`;
                  const isActive = activeKey === key;
                  const widthPct = (kelompok.jumlah / axisMax) * 100;
                  // Bar panjang: teks masuk ke dalam bar supaya tidak terpotong.
                  const labelInside = widthPct > 55;

                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={`${kelompok.label}, ${desa.label}: ${kelompok.jumlah} muda-mudi`}
                      className="relative block h-5 w-full cursor-pointer text-left outline-none sm:h-7"
                      {...pointerHandlers(key)}
                    >
                      <span
                        className="relative block h-full rounded-r-md border border-l-0 transition-colors"
                        style={{
                          ...hatchStyle(colorOf(kelompok.label), isActive),
                          width: `${widthPct}%`,
                          minWidth: kelompok.jumlah > 0 ? 2 : 0,
                        }}
                      >
                        <span
                          className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] tabular-nums text-gray-700 sm:text-[11px] ${
                            labelInside ? "right-1.5" : "left-full ml-1"
                          }`}
                        >
                          <span className="text-gray-500">{kelompok.label}</span>
                          <span className="text-gray-400"> · </span>
                          <span className="font-semibold">
                            {kelompok.jumlah.toLocaleString("id-ID")}
                          </span>
                        </span>
                      </span>

                      {isActive && (
                        <span
                          role="tooltip"
                          className="pointer-events-none absolute left-2 top-full z-20 mt-0.5 block whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-left text-[10px] leading-4 text-white shadow-lg"
                        >
                          <span className="block font-semibold">
                            {kelompok.label}
                          </span>
                          <span className="block text-gray-300">
                            {desa.label}
                          </span>
                          <span className="block tabular-nums">
                            {kelompok.jumlah.toLocaleString("id-ID")} muda-mudi
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Kotak desa (di depan, transparan) membungkus semua baris */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-10 rounded-r-lg border border-l-0 border-dashed border-slate-400/70 bg-slate-400/10"
                style={{
                  width: `${(desa.jumlah / axisMax) * 100}%`,
                  minWidth: desa.jumlah > 0 ? 2 : 0,
                }}
              />
            </div>
          </div>
        ))}

        {/* Sumbu X bersama */}
        <div className="relative -mt-2 h-4 border-l border-transparent pr-3">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute -translate-x-1/2 text-[9px] tabular-nums text-gray-400"
              style={{ left: `${(tick / axisMax) * 100}%` }}
            >
              {tick.toLocaleString("id-ID")}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}