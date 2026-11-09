"use client";

import { useEffect, useRef, useState } from "react";
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
import ReminderModal from "./ReminderModal";

type Props = {
  initialData: Mudamudi[];
  adminDesa: string | null;
};

type ExportMode = "excel" | "qr";

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

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-3.5 w-3.5 ${className}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m7 10 5 5 5-5"
      />
    </svg>
  );
}

function ExcelIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 3v7h7M8 13l5 6m0-6-5 6"
      />
    </svg>
  );
}

function QRIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 14h3v3h-3zM20 14v2m-3 3h3v2m-6-3v3"
      />
    </svg>
  );
}

export default function MudamudiPage({ initialData, adminDesa }: Props) {
  const router = useRouter();

  const exportDropdownRef = useRef<HTMLDivElement>(null);

  const [modal, setModal] = useState<ModalState | null>(null);

  const [detailData, setDetailData] = useState<Mudamudi | null>(null);

  const [qrData, setQrData] = useState<Mudamudi | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);

  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [exportMode, setExportMode] = useState<ExportMode>("excel");

  const [showImportModal, setShowImportModal] = useState(false);

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const missingJenjangCount = initialData.filter(
    (item) => !item.jenjang?.trim(),
  ).length;

  const [showReminder, setShowReminder] = useState(
    () => missingJenjangCount > 0,
  );

  useEffect(() => {
    setShowReminder(missingJenjangCount > 0);
  }, [missingJenjangCount]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setShowExportDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

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

  function openExportModal(mode: ExportMode) {
    setExportMode(mode);
    setShowExportDropdown(false);
    setShowExportModal(true);
  }

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const nama = String(formData.get("nama") ?? "");
    const desa = String(formData.get("desa") ?? "");
    const kelas = String(formData.get("kelas") ?? "");
    const kelompok = String(formData.get("kelompok") ?? "");
    const jenisKelamin = String(formData.get("jenis_kelamin") ?? "");
    const tahunLahir = String(formData.get("tahun_lahir") ?? "");

    const errors = validateClient(
      nama,
      desa,
      kelas,
      kelompok,
      jenisKelamin,
      tahunLahir,
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
    const tahunLahir = String(formData.get("tahun_lahir") ?? "");

    const errors = validateClient(
      nama,
      desa,
      kelas,
      kelompok,
      jenisKelamin,
      tahunLahir,
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
    <main className="min-h-screen bg-[#F5F7F5]">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 md:px-7 lg:px-8">
        <header className="pb-5">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#287A50]">
              Generus
            </p>

            <div className="mt-1 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-[#202824]">
                  Data Generus
                </h1>

                <p className="mt-1 max-w-xs text-[12px] leading-4 text-[#78827C] sm:max-w-none sm:text-xs">
                  Kelola data anggota Generus yang digunakan untuk presensi.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  aria-label="Import data"
                  title="Import data"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5EAE6] bg-white text-[#202824] shadow-xs transition-colors hover:bg-[#F0F4F1] active:bg-[#E5EAE6] md:h-9 md:w-auto md:gap-1.5 md:px-3.5 md:text-[11px] md:font-medium"
                >
                  <UploadIcon />

                  <span className="hidden md:inline">Import</span>
                </button>

                <div ref={exportDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowExportDropdown((current) => !current)}
                    aria-label="Export data"
                    aria-expanded={showExportDropdown}
                    aria-haspopup="menu"
                    title="Export data"
                    className="inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-xl border border-[#E5EAE6] bg-white px-2.5 text-[#202824] shadow-xs transition-colors hover:border-[#D5EBDD] hover:bg-[#F0F4F1] active:bg-[#E5EAE6] md:h-9 md:min-w-[104px] md:gap-2 md:px-3.5"
                  >
                    <DownloadIcon />

                    <span className="hidden text-[11px] font-medium md:inline">
                      Export
                    </span>

                    <ChevronDownIcon
                      className={`hidden transition-transform duration-200 md:block ${showExportDropdown ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {showExportDropdown && (
                    <div
                      role="menu"
                      aria-label="Pilihan ekspor"
                      className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#E5EAE6] bg-white p-1.5 shadow-lg"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => openExportModal("excel")}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#F5F9F6]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F2EA] text-[#287A50]">
                          <ExcelIcon />
                        </span>

                        <span className="min-w-0">
                          <span className="block text-[11px] font-semibold text-[#202824]">
                            Export Data Excel
                          </span>

                          <span className="mt-0.5 block text-[9px] text-[#78827C]">
                            Unduh database dalam format XLSX
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => openExportModal("qr")}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#F5F9F6]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F2EA] text-[#287A50]">
                          <QRIcon />
                        </span>

                        <span className="min-w-0">
                          <span className="block text-[11px] font-semibold text-[#202824]">
                            Export/Download QR
                          </span>

                          <span className="mt-0.5 block text-[9px] text-[#78827C]">
                            Unduh kartu QR dalam satu file ZIP
                          </span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={openAddModal}
                  aria-label="Tambah Generus"
                  title="Tambah Generus"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#287A50] text-lg font-medium leading-none text-white shadow-xs transition-colors hover:bg-[#206440] active:bg-[#181C1B] md:h-9 md:w-auto md:px-4 md:text-[11px] md:font-semibold"
                >
                  <span className="md:hidden">+</span>

                  <span className="hidden md:inline">+ Tambah Generus</span>
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
            filterJenjang={filter.filterJenjang}
            setFilterJenjang={filter.setFilterJenjang}
            filterKelas={filter.filterKelas}
            setFilterKelas={filter.setFilterKelas}
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

      {showReminder && missingJenjangCount > 0 && (
        <ReminderModal
          title="Pembaruan Data Jenjang"
          description="Terdapat data Generus yang belum memiliki jenjang pendidikan. Silakan lengkapi data jenjang setiap Generus agar informasi anggota tetap sesuai dan dapat digunakan dalam pengelolaan data."
          count={missingJenjangCount}
          countLabel="Generus belum memiliki data jenjang."
          note="Pengingat ini akan muncul kembali saat menu Generus dibuka selama masih terdapat data jenjang yang belum dilengkapi."
          buttonLabel="Mengerti"
          onClose={() => setShowReminder(false)}
        />
      )}

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
          initialMode={exportMode}
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