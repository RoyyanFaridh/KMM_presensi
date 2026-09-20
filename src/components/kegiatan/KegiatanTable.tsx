"use client";

import { useMemo, useState } from "react";

import {
  addKegiatan,
  deleteKegiatan,
  updateKegiatan,
} from "../../backend/kegiatan/actions";

import { getKegiatanStatus } from "../../backend/kegiatan/format";

import {
  FieldErrors,
  Kegiatan,
  ModalState,
  SortConfig,
  SortKey,
} from "../../backend/kegiatan/types";

import DeleteConfirmModal from "./DeleteConfirmModal";
import KegiatanFormModal from "./KegiatanFormModal";
import KegiatanQRModal from "./KegiatanQRModal";
import KegiatanTableView from "./KegiatanTableView";
import SearchFilterBar from "./SearchFilterBar";

type Props = {
  initialData: Kegiatan[];
};

export default function KegiatanTable({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [modal, setModal] = useState<ModalState>(null);
  const [qrKegiatan, setQrKegiatan] = useState<Kegiatan | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const result = data.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.nama.toLowerCase().includes(keyword) ||
        item.lokasi.toLowerCase().includes(keyword);

      const matchesStatus =
        !filterStatus ||
        getKegiatanStatus(
          item.tanggal_mulai,
          item.tanggal_selesai,
          item.jam_mulai,
          item.jam_selesai,
        ) === filterStatus;

      return matchesSearch && matchesStatus;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        const comparison = String(aValue).localeCompare(String(bValue), "id", {
          numeric: true,
        });

        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, search, filterStatus, sortConfig]);

  const hasActiveFilters =
    Boolean(search.trim()) || Boolean(filterStatus) || Boolean(sortConfig);

  function handleReset() {
    setSearch("");
    setFilterStatus("");
    setSortConfig(null);
  }

  function handleSort(key: SortKey) {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return {
          key,
          direction: "asc",
        };
      }

      if (current.direction === "asc") {
        return {
          key,
          direction: "desc",
        };
      }

      return null;
    });
  }

  function openAdd() {
    setError("");
    setFieldErrors({});
    setModal({ type: "add" });
  }

  function openEdit(kegiatan: Kegiatan) {
    setError("");
    setFieldErrors({});

    setModal({
      type: "edit",
      data: kegiatan,
    });
  }

  function openDelete(kegiatan: Kegiatan) {
    setError("");
    setFieldErrors({});

    setModal({
      type: "delete",
      data: kegiatan,
    });
  }

  function handleShowQR(kegiatan: Kegiatan) {
    setQrKegiatan(kegiatan);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);

    const result =
      modal?.type === "edit"
        ? await updateKegiatan(modal.data.id, formData)
        : await addKegiatan(formData);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (modal?.type === "edit") {
      setData((current) =>
        current.map((item) =>
          item.id === modal.data.id
            ? {
                ...item,
                nama: String(formData.get("nama") ?? "").trim(),
                tanggal_mulai: String(formData.get("tanggal_mulai") ?? ""),
                tanggal_selesai: String(formData.get("tanggal_selesai") ?? ""),
                jam_mulai: String(formData.get("jam_mulai") ?? ""),
                jam_selesai: String(formData.get("jam_selesai") ?? ""),
                lokasi: String(formData.get("lokasi") ?? "").trim(),
              }
            : item,
        ),
      );

      setModal(null);
      return;
    }

    window.location.reload();
  }

  async function handleDelete() {
    if (modal?.type !== "delete") {
      return;
    }

    setError("");

    const result = await deleteKegiatan(modal.data.id);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setData((current) => current.filter((item) => item.id !== modal.data.id));

    setModal(null);
  }

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
            Kegiatan
          </p>

          <div className="mt-1 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                Data Kegiatan
              </h1>

              <p className="mt-1 max-w-xs text-[10px] leading-4 text-gray-500 sm:max-w-none sm:text-xs">
                Kelola kegiatan yang digunakan untuk presensi.
              </p>
            </div>

            <button
              type="button"
              onClick={openAdd}
              aria-label="Tambah kegiatan"
              title="Tambah kegiatan"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-lg font-medium leading-none text-white transition-colors hover:bg-teal-700 sm:h-9 sm:w-auto sm:px-4 sm:text-[11px]"
            >
              <span className="sm:hidden">+</span>

              <span className="hidden sm:inline">+ Tambah Kegiatan</span>
            </button>
          </div>
        </div>

        <SearchFilterBar
          search={search}
          setSearch={setSearch}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          hasActiveFilters={hasActiveFilters}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          onReset={handleReset}
        />

        <KegiatanTableView
          data={filteredData}
          sort={sortConfig}
          onSort={handleSort}
          onEdit={openEdit}
          onDelete={openDelete}
          onShowQR={handleShowQR}
        />
      </div>

      {modal?.type === "add" && (
        <KegiatanFormModal
          mode="add"
          fieldErrors={fieldErrors}
          error={error}
          onSubmit={handleSubmit}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "edit" && (
        <KegiatanFormModal
          mode="edit"
          initialData={modal.data}
          fieldErrors={fieldErrors}
          error={error}
          onSubmit={handleSubmit}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteConfirmModal
          data={modal.data}
          error={error}
          onConfirm={handleDelete}
          onClose={() => setModal(null)}
        />
      )}

      <KegiatanQRModal
        kegiatan={qrKegiatan}
        onClose={() => setQrKegiatan(null)}
      />
    </>
  );
}
