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
import KegiatanTableView from "./KegiatanTableView";
import SearchFilterBar from "./SearchFilterBar";

type Props = {
  initialData: Kegiatan[];
};

export default function KegiatanTable({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [modal, setModal] = useState<ModalState>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
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
    if (loading) {
      return;
    }

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
    if (loading) {
      return;
    }

    setError("");
    setFieldErrors({});
    setModal({ type: "add" });
  }

  function openEdit(kegiatan: Kegiatan) {
    if (loading) {
      return;
    }

    setError("");
    setFieldErrors({});

    setModal({
      type: "edit",
      data: kegiatan,
    });
  }

  function openDelete(kegiatan: Kegiatan) {
    if (loading) {
      return;
    }

    setError("");
    setFieldErrors({});

    setModal({
      type: "delete",
      data: kegiatan,
    });
  }

  function handleScanQR(kegiatan: Kegiatan) {
    if (loading) {
      return;
    }

    window.location.href = `/admin/presensi/scan/${kegiatan.id}`;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);

    try {
      const result =
        modal?.type === "edit"
          ? await updateKegiatan(modal.data.id, formData)
          : await addKegiatan(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      const desa = formData
        .getAll("desa")
        .map((value) => String(value).trim())
        .filter(Boolean);

      const kelas = formData
        .getAll("kelas")
        .map((value) => String(value).trim())
        .filter(Boolean);

      const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();

      if (modal?.type === "edit") {
        setData((current) =>
          current.map((item) =>
            item.id === modal.data.id
              ? {
                  ...item,
                  nama: String(formData.get("nama") ?? "").trim(),
                  tanggal_mulai: String(formData.get("tanggal_mulai") ?? ""),
                  tanggal_selesai: String(
                    formData.get("tanggal_selesai") ?? "",
                  ),
                  jam_mulai: String(formData.get("jam_mulai") ?? ""),
                  jam_selesai: String(formData.get("jam_selesai") ?? ""),
                  lokasi: String(formData.get("lokasi") ?? "").trim(),
                  desa: desa.length > 0 ? desa : null,
                  kelas: kelas.length > 0 ? kelas : null,
                  jenis_kelamin: jenisKelamin || null,
                }
              : item,
          ),
        );

        setModal(null);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Gagal menyimpan kegiatan:", error);

      setError("Terjadi kesalahan saat menyimpan kegiatan.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (modal?.type !== "delete" || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await deleteKegiatan(modal.data.id);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setData((current) => current.filter((item) => item.id !== modal.data.id));

      setModal(null);
    } catch (error) {
      console.error("Gagal menghapus kegiatan:", error);

      setError("Terjadi kesalahan saat menghapus kegiatan.");
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
              aria-label="Tambah kegiatan"
              title="Tambah kegiatan"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-lg font-medium leading-none text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:w-auto sm:px-4 sm:text-[11px]"
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
          onScanQR={handleScanQR}
        />
      </div>

      {modal?.type === "add" && (
        <KegiatanFormModal
          mode="add"
          fieldErrors={fieldErrors}
          error={error}
          loading={loading}
          onSubmit={handleSubmit}
          onClose={() => {
            if (!loading) {
              setModal(null);
            }
          }}
        />
      )}

      {modal?.type === "edit" && (
        <KegiatanFormModal
          mode="edit"
          initialData={modal.data}
          fieldErrors={fieldErrors}
          error={error}
          loading={loading}
          onSubmit={handleSubmit}
          onClose={() => {
            if (!loading) {
              setModal(null);
            }
          }}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteConfirmModal
          data={modal.data}
          error={error}
          onConfirm={handleDelete}
          onClose={() => {
            if (!loading) {
              setModal(null);
            }
          }}
        />
      )}
    </>
  );
}
