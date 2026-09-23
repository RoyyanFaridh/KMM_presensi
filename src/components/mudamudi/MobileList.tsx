import { Mudamudi } from "../../backend/mudamudi/types";
import {
  toTitleCase,
  getInitials,
  getAvatarColor,
} from "../../backend/mudamudi/format";
import { getKelasBadgeClass } from "../../backend/mudamudi/kelasBadge";
import { DetailIcon, EditIcon, DeleteIcon } from "./icons";

type Props = {
  data: Mudamudi[];
  onDetail: (s: Mudamudi) => void;
  onEdit: (s: Mudamudi) => void;
  onDelete: (s: Mudamudi) => void;
  onShowQR: (s: Mudamudi) => void;
  startIndex: number;
};

export default function MobileList({
  data,
  onDetail,
  onEdit,
  onDelete,
  onShowQR,
  startIndex,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-[12px] text-gray-500 md:hidden">
        Tidak ada data yang cocok
      </div>
    );
  }

  return (
    <div className="space-y-2.5 md:hidden">
      {data.map((s, index) => {
        const avatarColor = getAvatarColor(s.nama);

        return (
          <div
            key={s.id}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-stretch justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="w-4 shrink-0 text-center text-[10px] font-medium text-gray-400">
                  {startIndex + index + 1}
                </span>

                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white ring-2 ${avatarColor.ring}`}
                  style={{
                    backgroundColor: avatarColor.bg,
                  }}
                >
                  {getInitials(s.nama)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium text-gray-800">
                    {toTitleCase(s.nama)}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-gray-400">
                    {s.desa} · {s.kelompok}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-gray-400">
                    {s.jenis_kelamin ?? "-"}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end justify-between gap-4">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getKelasBadgeClass(
                    s.kelas,
                  )}`}
                >
                  {s.kelas}
                </span>

                <div className="flex items-center gap-2">
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
                    className="inline-flex items-center text-gray-600 transition hover:text-gray-900"
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
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
