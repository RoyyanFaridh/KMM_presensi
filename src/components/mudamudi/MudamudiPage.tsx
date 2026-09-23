"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  addMudamudi,
  updateMudamudi,
  deleteMudamudi,
} from "../../backend/mudamudi/actions";

import {
  Mudamudi,
  ModalState,
  FieldErrors,
} from "../../backend/mudamudi/types";

import { validateClient } from "../../backend/mudamudi/validation";
import { useMudamudiFilter } from "./useMudamudiFilter";

import SearchFilterBar from "./SearchFilterBar";
import MudamudiTableView from "./MudamudiTableView";
import MudamudiFormModal from "./MudamudiFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import DetailModal from "./DetailModal";
import ExportModal from "./ExportModal";
import ImportModal from "./ImportModal";
import MudamudiQRModal from "./MudamudiQRModal";

type Props = {
  initialData: Mudamudi[];
  adminDesa: string | null;
};

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m7 9 5-5 5 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 20h14" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m7 10 5 5 5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 21h14" />
    </svg>
  );
}

export default function MudamudiPage({ initialData, adminDesa }: Props) {
  const router = useRouter();

  const [modal, setModal] = useState<ModalState | null>(null);

  const [detailData, setDetailData] = useState<Mudamudi | null>(null);

  const [qrData, setQrData] = useState<Mudamudi | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const filter = useMudamudiFilter(initialData, adminDesa);

  function closeModal() {
    setModal(null);
    setFieldErrors({});
    setError("");
  }

  function openAddModal() {
    setError("");
    setFieldErrors({});

    setModal({
      type: "add",
    });
  }

  function openDetailModal(data: Mudamudi) {
    setError("");
    setFieldErrors({});
    setDetailData(data);
  }

  function closeDetailModal() {
    setDetailData(null);
  }

  function openQRModal(data: Mudamudi) {
    setQrData(data);
  }

  function closeQRModal() {
    setQrData(null);
  }

  function openEditModal(data: Mudamudi) {
    setError("");
    setFieldErrors({});

    setModal({
      type: "edit",
      data,
    });
  }

  function openDeleteModal(data: Mudamudi) {
    setError("");
    setFieldErrors({});

    setModal({
      type: "delete",
      data,
    });
  }

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const nama = String(formData.get("nama") ?? "");
    const desa = String(formData.get("desa") ?? "");
    const kelas = String(formData.get("kelas") ?? "");
    const kelompok = String(formData.get("kelompok") ?? "");
    const jenisKelamin = String(formData.get("jenis_kelamin") ?? "");
    const tanggalLahir = String(formData.get("tanggal_lahir") ?? "");

    const errors = validateClient(
      nama,
      desa,
      kelas,
      kelompok,
      jenisKelamin,
      tanggalLahir,
    );

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setError("");

    const result = await addMudamudi(formData);

    if (result?.error) {
      setError(result.error);
      return;
    }

    closeModal();
    router.refresh();
  }

  async function handleEditSubmit(
    e: React.FormEvent<HTMLFormElement>,
    id: number,
  ) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const nama = String(formData.get("nama") ?? "");
    const desa = String(formData.get("desa") ?? "");
    const kelas = String(formData.get("kelas") ?? "");
    const kelompok = String(formData.get("kelompok") ?? "");
    const jenisKelamin = String(formData.get("jenis_kelamin") ?? "");
    const tanggalLahir = String(formData.get("tanggal_lahir") ?? "");

    const errors = validateClient(
      nama,
      desa,
      kelas,
      kelompok,
      jenisKelamin,
      tanggalLahir,
    );

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setError("");

    const result = await updateMudamudi(id, formData);

    if (result?.error) {
      setError(result.error);
      return;
    }

    closeModal();
    router.refresh();
  }

  async function handleDelete(id: number) {
    setError("");

    const result = await deleteMudamudi(id);

    if (result?.error) {
      setError(result.error);
      return;
    }

    closeModal();
    router.refresh();
  }

  function handleImportSuccess() {
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 md:px-7 lg:px-8">
        <header className="border-b border-gray-200 pb-5">
          <div className="mb-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
              Muda Mudi
            </p>

            <div className="mt-1 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                  Data Muda Mudi
                </h1>

                <p className="mt-1 max-w-xs text-[10px] leading-4 text-gray-500 sm:max-w-none sm:text-xs">
                  Kelola data anggota muda mudi yang digunakan untuk presensi.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  aria-label="Import data"
                  title="Import data"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 transition-colors hover:bg-amber-100 active:bg-amber-200 md:h-9 md:w-auto md:gap-1.5 md:px-3.5 md:text-[11px] md:font-medium"
                >
                  <UploadIcon />

                  <span className="hidden md:inline">Import</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  aria-label="Export data"
                  title="Export data"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-sky-700 transition-colors hover:bg-sky-100 active:bg-sky-200 md:h-9 md:w-auto md:gap-1.5 md:px-3.5 md:text-[11px] md:font-medium"
                >
                  <DownloadIcon />

                  <span className="hidden md:inline">Export</span>
                </button>

                <button
                  type="button"
                  onClick={openAddModal}
                  aria-label="Tambah data"
                  title="Tambah data"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-lg font-medium leading-none text-white transition-colors hover:bg-teal-700 active:bg-teal-800 md:h-9 md:w-auto md:px-4 md:text-[11px]"
                >
                  <span className="md:hidden">+</span>

                  <span className="hidden md:inline">+ Tambah Data</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="pt-1">
          <SearchFilterBar
            search={filter.search}
            setSearch={filter.setSearch}
            filterDesa={filter.filterDesa}
            setFilterDesa={filter.setFilterDesa}
            filterkelas={filter.filterkelas}
            setFilterkelas={filter.setFilterkelas}
            filterKelompok={filter.filterKelompok}
            setFilterKelompok={filter.setFilterKelompok}
            filterJenisKelamin={filter.filterJenisKelamin}
            setFilterJenisKelamin={filter.setFilterJenisKelamin}
            sortConfig={filter.sortConfig}
            setSortConfig={filter.setSortConfig}
            hasActiveFilters={filter.hasActiveFilters}
            onReset={filter.resetAll}
            adminDesa={adminDesa}
          />

          <MudamudiTableView
            data={filter.displayedData}
            totalCount={initialData.length}
            sortIndicator={filter.sortIndicator}
            toggleSort={filter.toggleSort}
            filterKey={filter.filterKey}
            onDetail={openDetailModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onShowQR={openQRModal}
          />
        </section>
      </div>

      {detailData && (
        <DetailModal data={detailData} onClose={closeDetailModal} />
      )}

      {qrData && <MudamudiQRModal data={qrData} onClose={closeQRModal} />}

      {modal?.type === "add" && (
        <MudamudiFormModal
          mode="add"
          adminDesa={adminDesa}
          fieldErrors={fieldErrors}
          error={error}
          onSubmit={handleAddSubmit}
          onClose={closeModal}
        />
      )}

      {modal?.type === "edit" && (
        <MudamudiFormModal
          mode="edit"
          initialData={modal.data}
          adminDesa={adminDesa}
          fieldErrors={fieldErrors}
          error={error}
          onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
            handleEditSubmit(e, modal.data.id)
          }
          onClose={closeModal}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteConfirmModal
          data={modal.data}
          error={error}
          onConfirm={() => handleDelete(modal.data.id)}
          onClose={closeModal}
        />
      )}

      {showExportModal && (
        <ExportModal
          allData={initialData}
          adminDesa={adminDesa}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </main>
  );
}
