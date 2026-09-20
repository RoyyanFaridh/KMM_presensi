import { Mudamudi } from "../../backend/mudamudi/types";
import {
  toTitleCase,
  getInitials,
  getAvatarColor,
} from "../../backend/mudamudi/format";
import { getKelasBadgeClass } from "../../backend/mudamudi/kelasBadge";
import ModalWrapper from "./ModalWrapper";

type Props = {
  data: Mudamudi;
  onClose: () => void;
};

export default function DetailModal({ data, onClose }: Props) {
  const avatarColor = getAvatarColor(data.nama);

  function formatTanggal(tanggal: string | null) {
    if (!tanggal) {
      return "-";
    }

    const [year, month, day] = tanggal.split("-");

    return `${day}-${month}-${year}`;
  }

  function DetailItem({
    label,
    value,
  }: {
    label: string;
    value: string | number | null;
  }) {
    return (
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="mt-1 text-[11px] leading-4 text-gray-700">
          {value ?? "-"}
        </p>
      </div>
    );
  }

  return (
    <ModalWrapper onClose={onClose}>
      <div className="max-h-[90vh] w-full max-w-150 overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white ring-2 ${avatarColor.ring}`}
              style={{ backgroundColor: avatarColor.bg }}
            >
              {getInitials(data.nama)}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-semibold text-gray-800">
                {toTitleCase(data.nama)}
              </h2>

              <p className="mt-0.5 text-[10px] text-gray-500">
                Detail Data Mudamudi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-130px)] overflow-y-auto px-5 py-5">
          <section>
            <h3 className="text-[11px] font-semibold text-gray-800">
              Informasi Utama
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <DetailItem label="Desa" value={data.desa} />

              <DetailItem label="Kelompok" value={data.kelompok} />

              <DetailItem label="Jenis Kelamin" value={data.jenis_kelamin} />

              <DetailItem label="Kelas" value={data.kelas} />
            </div>
          </section>

          <div className="my-5 border-t border-gray-100" />

          <section>
            <h3 className="text-[11px] font-semibold text-gray-800">
              Data Pribadi
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <DetailItem label="Nama" value={toTitleCase(data.nama)} />

              <DetailItem label="Tempat Lahir" value={data.tempat_lahir} />

              <DetailItem
                label="Tanggal Lahir"
                value={formatTanggal(data.tanggal_lahir)}
              />

              <DetailItem
                label="Umur"
                value={data.umur !== null ? `${data.umur} tahun` : null}
              />

              <DetailItem label="No. HP" value={data.no_hp} />

              <DetailItem label="Pekerjaan" value={data.pekerjaan} />

              <div className="col-span-2 sm:col-span-3">
                <DetailItem label="Alamat" value={data.alamat} />
              </div>
            </div>
          </section>

          <div className="my-5 border-t border-gray-100" />

          <section>
            <h3 className="text-[11px] font-semibold text-gray-800">
              Data Orang Tua
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <DetailItem label="Nama Ayah" value={data.nama_ayah} />

              <DetailItem label="Nama Ibu" value={data.nama_ibu} />

              <DetailItem label="No. HP Orang Tua" value={data.no_hp_ortu} />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 bg-gray-50/50 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
