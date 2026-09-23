import { Mudamudi, SortKey } from "../../backend/mudamudi/types";
import {
  toTitleCase,
  getInitials,
  getAvatarColor,
} from "../../backend/mudamudi/format";
import { getKelasBadgeClass } from "../../backend/mudamudi/kelasBadge";
import { DetailIcon, EditIcon, DeleteIcon } from "./icons";

type Props = {
  data: Mudamudi[];
  startIndex: number;
  sortIndicator: (key: SortKey) => string;
  toggleSort: (key: SortKey) => void;
  onDetail: (s: Mudamudi) => void;
  onEdit: (s: Mudamudi) => void;
  onDelete: (s: Mudamudi) => void;
  onShowQR: (s: Mudamudi) => void;
};

export default function DesktopTable({
  data,
  startIndex,
  sortIndicator,
  toggleSort,
  onDetail,
  onEdit,
  onDelete,
  onShowQR,
}: Props) {
  function SortIcon({ sortKey }: { sortKey: SortKey }) {
    const indicator = sortIndicator(sortKey);

    if (!indicator) {
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-3 w-3 text-gray-300"
          aria-hidden="true"
        >
          <path d="M5 6l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M5 10l3 3 3-3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-3 w-3 text-teal-700"
        aria-hidden="true"
      >
        {indicator === " ▲" ? (
          <path
            d="M4 10l4-4 4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    );
  }

  return (
    <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:block">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/60">
            <th className="w-12 px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-gray-500">
              NO
            </th>

            <th
              className="w-28 cursor-pointer select-none px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-gray-500 transition hover:text-gray-800"
              onClick={() => toggleSort("desa")}
            >
              <div className="flex items-center gap-1.5">
                <span>DESA</span>
                <SortIcon sortKey="desa" />
              </div>
            </th>

            <th
              className="w-40 cursor-pointer select-none px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-gray-500 transition hover:text-gray-800"
              onClick={() => toggleSort("kelompok")}
            >
              <div className="flex items-center gap-1.5">
                <span>KELOMPOK</span>
                <SortIcon sortKey="kelompok" />
              </div>
            </th>

            <th
              className="cursor-pointer select-none px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-gray-500 transition hover:text-gray-800"
              onClick={() => toggleSort("nama")}
            >
              <div className="flex items-center gap-1.5">
                <span>NAMA</span>
                <SortIcon sortKey="nama" />
              </div>
            </th>

            <th className="w-28 px-3 py-2.5 text-center text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Jenis Kelamin
            </th>

            <th
              className="w-32 cursor-pointer select-none px-3 py-2.5 text-center text-[10px] font-medium uppercase tracking-wide text-gray-500 transition hover:text-gray-800"
              onClick={() => toggleSort("kelas")}
            >
              <div className="flex items-center justify-center gap-1.5">
                <span>KELAS</span>
                <SortIcon sortKey="kelas" />
              </div>
            </th>

            <th className="w-44 px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-wide text-gray-500">
              AKSI
            </th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-8 text-center text-[12px] text-gray-500"
              >
                Tidak ada data yang cocok
              </td>
            </tr>
          ) : (
            data.map((s, i) => {
              const avatarColor = getAvatarColor(s.nama);

              return (
                <tr
                  key={s.id}
                  className="border-b border-gray-100 transition hover:bg-gray-50/50 last:border-b-0"
                >
                  <td className="px-3 py-2.5 text-[11px] text-gray-400">
                    {startIndex + i + 1}
                  </td>

                  <td className="px-3 py-2.5 text-[11px] text-gray-600">
                    {s.desa}
                  </td>

                  <td className="px-3 py-2.5 text-[11px] text-gray-600">
                    {s.kelompok}
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-medium text-white ring-2 ${avatarColor.ring}`}
                        style={{
                          backgroundColor: avatarColor.bg,
                        }}
                      >
                        {getInitials(s.nama)}
                      </div>

                      <span className="text-[11px] font-medium text-gray-800">
                        {toTitleCase(s.nama)}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-2.5 text-center text-[11px] text-gray-600">
                    {s.jenis_kelamin === "Laki-laki"
                      ? "L"
                      : s.jenis_kelamin === "Perempuan"
                        ? "P"
                        : "-"}
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${getKelasBadgeClass(
                        s.kelas,
                      )}`}
                    >
                      {s.kelas}
                    </span>
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => onShowQR(s)}
                        aria-label={`Tampilkan QR ${s.nama}`}
                        title="Tampilkan QR"
                        className="rounded-md bg-teal-50 px-2 py-1 text-[10px] font-semibold text-teal-700 transition-colors hover:bg-teal-100 active:bg-teal-200"
                      >
                        QR
                      </button>

                      <button
                        type="button"
                        onClick={() => onDetail(s)}
                        aria-label={`Detail ${s.nama}`}
                        title="Detail"
                        className="inline-flex items-center text-gray-500 transition hover:text-gray-900"
                      >
                        <DetailIcon className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(s)}
                        aria-label={`Edit ${s.nama}`}
                        title="Edit"
                        className="inline-flex items-center text-teal-700 transition hover:text-teal-900"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(s)}
                        aria-label={`Hapus ${s.nama}`}
                        title="Hapus"
                        className="inline-flex items-center text-red-500 transition hover:text-red-700"
                      >
                        <DeleteIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
