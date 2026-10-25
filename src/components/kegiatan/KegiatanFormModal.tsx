"use client";

import { useMemo, useRef, useState } from "react";

import type { Kegiatan, FieldErrors } from "../../backend/kegiatan/types";

import {
  DESA_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
  KELAS_OPTIONS,
  KELOMPOK_BY_DESA,
} from "../../backend/mudamudi/constants";

import ModalWrapper from "../mudamudi/ModalWrapper";

type Props = {
  mode: "add" | "edit";
  initialData?: Kegiatan;
  desaAdmin: string | null;
  isSuperAdmin: boolean;
  fieldErrors: FieldErrors;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onClose: () => void;
};

type GroupMode = "all" | "specific";

type ActivityForm = {
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
};

type ClientErrors = Partial<Record<keyof ActivityForm, string>>;

const styles = {
  sectionTitle: "text-[11px] font-semibold tracking-tight text-gray-900",
  description: "text-[9px] leading-4 text-gray-500",
  label: "mb-1.5 block text-[9px] font-semibold leading-4 text-gray-700",
  input:
    "h-9 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-[9px] text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-50 disabled:cursor-not-allowed disabled:bg-gray-50",
  option:
    "flex min-h-8 min-w-0 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 transition",
  optionText: "min-w-0 wrap-break-word text-[9px] leading-4 text-gray-700",
  subheading: "text-[9px] font-semibold text-gray-800",
  action:
    "shrink-0 text-[9px] font-semibold text-teal-700 transition hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-50",
  button:
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[9px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
};

const STEPS = [
  { number: 1, title: "Informasi Kegiatan", description: "Informasi dasar" },
  { number: 2, title: "Sasaran Kegiatan", description: "Kriteria peserta" },
  { number: 3, title: "Konfirmasi", description: "Periksa kembali" },
];

function getKelompokByDesa(desa: string[]): string[] {
  const result = new Set<string>();

  for (const namaDesa of desa) {
    const daftar = KELOMPOK_BY_DESA[namaDesa as keyof typeof KELOMPOK_BY_DESA];

    daftar?.forEach((kelompok) => result.add(kelompok));
  }

  return [...result];
}

function getInitialGroupMode(initialData: Kegiatan | undefined): GroupMode {
  return initialData?.kelompok == null ? "all" : "specific";
}

function formatDate(value: string): string {
  if (!value) return "Belum diisi";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string): string {
  if (!value) return "Belum diisi";

  return value.slice(0, 5);
}

function validateActivity(activity: ActivityForm): ClientErrors {
  const errors: ClientErrors = {};

  if (!activity.nama.trim()) {
    errors.nama = "Nama kegiatan wajib diisi.";
  }

  if (!activity.tanggal_mulai) {
    errors.tanggal_mulai = "Tanggal mulai wajib diisi.";
  }

  if (!activity.tanggal_selesai) {
    errors.tanggal_selesai = "Tanggal selesai wajib diisi.";
  }

  if (
    activity.tanggal_mulai &&
    activity.tanggal_selesai &&
    activity.tanggal_selesai < activity.tanggal_mulai
  ) {
    errors.tanggal_selesai =
      "Tanggal selesai harus setelah atau sama dengan tanggal mulai.";
  }

  if (!activity.jam_mulai) {
    errors.jam_mulai = "Jam mulai wajib diisi.";
  }

  if (!activity.jam_selesai) {
    errors.jam_selesai = "Jam selesai wajib diisi.";
  }

  if (
    activity.tanggal_mulai &&
    activity.tanggal_selesai &&
    activity.tanggal_mulai === activity.tanggal_selesai &&
    activity.jam_mulai &&
    activity.jam_selesai &&
    activity.jam_selesai <= activity.jam_mulai
  ) {
    errors.jam_selesai =
      "Jika tanggalnya sama, jam selesai harus setelah jam mulai.";
  }

  if (!activity.lokasi.trim()) {
    errors.lokasi = "Lokasi wajib diisi.";
  }

  return errors;
}

export default function KegiatanFormModal({
  mode,
  initialData,
  desaAdmin,
  isSuperAdmin,
  fieldErrors,
  error,
  loading,
  onSubmit,
  onClose,
}: Props) {
  const navigationLockRef = useRef(false);
  const submitLockRef = useRef(false);

  const initialDesa = useMemo<string[]>(() => {
    if (isSuperAdmin) {
      return (initialData?.desa ?? []).filter((desa) =>
        DESA_OPTIONS.includes(desa as (typeof DESA_OPTIONS)[number]),
      );
    }

    return desaAdmin ? [desaAdmin] : [];
  }, [isSuperAdmin, initialData?.desa, desaAdmin]);

  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});

  const [activity, setActivity] = useState<ActivityForm>({
    nama: initialData?.nama ?? "",
    tanggal_mulai: initialData?.tanggal_mulai ?? "",
    tanggal_selesai: initialData?.tanggal_selesai ?? "",
    jam_mulai: initialData?.jam_mulai?.slice(0, 5) ?? "",
    jam_selesai: initialData?.jam_selesai?.slice(0, 5) ?? "",
    lokasi: initialData?.lokasi ?? "",
  });

  const [selectedDesa, setSelectedDesa] = useState<string[]>(initialDesa);

  const [groupMode, setGroupMode] = useState<GroupMode>(() =>
    getInitialGroupMode(initialData),
  );

  const [selectedKelompok, setSelectedKelompok] = useState<string[]>(
    initialData?.kelompok ?? [],
  );

  const [selectedKelas, setSelectedKelas] = useState<string[]>(
    initialData?.kelas ?? [],
  );

  const [jenisKelamin, setJenisKelamin] = useState(
    initialData?.jenis_kelamin ?? "",
  );

  const availableKelompok = useMemo(
    () => getKelompokByDesa(selectedDesa),
    [selectedDesa],
  );

  const effectiveKelompok = selectedKelompok.filter((kelompok) =>
    availableKelompok.includes(kelompok),
  );

  const allKelompokSelected =
    availableKelompok.length > 0 &&
    availableKelompok.every((kelompok) => effectiveKelompok.includes(kelompok));

  const allKelasSelected =
    KELAS_OPTIONS.length > 0 &&
    KELAS_OPTIONS.every((kelas) => selectedKelas.includes(kelas));

  const kelasLabel =
    selectedKelas.length === 0 || allKelasSelected
      ? "Semua kelas"
      : `${selectedKelas.length} kelas`;

  const jenisKelaminLabel = jenisKelamin || "Semua peserta";

  const groupNamesByDesa = useMemo(
    () =>
      selectedDesa.map((desa) => ({
        desa,
        kelompok: (
          KELOMPOK_BY_DESA[desa as keyof typeof KELOMPOK_BY_DESA] ?? []
        ).filter((kelompok) => effectiveKelompok.includes(kelompok)),
      })),
    [selectedDesa, effectiveKelompok],
  );

  const selectedKelasForSummary =
    selectedKelas.length === 0 || allKelasSelected
      ? [...KELAS_OPTIONS]
      : KELAS_OPTIONS.filter((kelas) => selectedKelas.includes(kelas));

  function updateActivity(field: keyof ActivityForm, value: string) {
    const nextActivity = {
      ...activity,
      [field]: value,
    };

    setActivity(nextActivity);

    // Validasi hanya field yang sedang diedit, bukan semua field sekaligus.
    // Field lain baru menampilkan error setelah pengguna menekan "Lanjut".
    setClientErrors((current) => {
      const validation = validateActivity(nextActivity);
      const nextErrors: ClientErrors = {
        ...current,
        [field]: validation[field],
      };

      // Perbarui error tanggal selesai hanya jika sebelumnya sudah ditampilkan.
      if (
        (field === "tanggal_mulai" || field === "tanggal_selesai") &&
        current.tanggal_selesai
      ) {
        nextErrors.tanggal_selesai = validation.tanggal_selesai;
      }

      // Perbarui error jam selesai hanya jika sebelumnya sudah ditampilkan.
      if (
        (field === "jam_mulai" || field === "jam_selesai") &&
        current.jam_selesai
      ) {
        nextErrors.jam_selesai = validation.jam_selesai;
      }

      return nextErrors;
    });

    setStepError("");
  }

  function toggleDesa(desa: string) {
    const isSelected = selectedDesa.includes(desa);

    const nextDesa = isSelected
      ? selectedDesa.filter((item) => item !== desa)
      : [...selectedDesa, desa];

    const nextAvailable = getKelompokByDesa(nextDesa);
    const addedDesa = nextDesa.filter((item) => !selectedDesa.includes(item));

    setSelectedDesa(nextDesa);

    setSelectedKelompok((current) => {
      const retained = current.filter((item) => nextAvailable.includes(item));

      if (groupMode === "all") {
        return retained;
      }

      return [
        ...new Set([...retained, ...getKelompokByDesa(addedDesa)]),
      ].filter((item) => nextAvailable.includes(item));
    });

    setStepError("");
  }

  function changeGroupMode(nextMode: GroupMode) {
    if (loading || nextMode === groupMode) return;

    if (nextMode === "specific" && groupMode === "all") {
      setSelectedKelompok(availableKelompok);
    }

    setGroupMode(nextMode);
    setStepError("");
  }

  function toggleKelompok(kelompok: string) {
    setSelectedKelompok((current) =>
      current.includes(kelompok)
        ? current.filter((item) => item !== kelompok)
        : [...current, kelompok],
    );

    setStepError("");
  }

  function toggleAllKelompok() {
    setSelectedKelompok((current) =>
      allKelompokSelected
        ? current.filter((item) => !availableKelompok.includes(item))
        : [
            ...new Set([
              ...current.filter((item) => availableKelompok.includes(item)),
              ...availableKelompok,
            ]),
          ],
    );

    setStepError("");
  }

  function toggleKelas(kelas: string) {
    setSelectedKelas((current) =>
      current.includes(kelas)
        ? current.filter((item) => item !== kelas)
        : [...current, kelas],
    );
  }

  function toggleAllKelas() {
    setSelectedKelas((current) => (allKelasSelected ? [] : [...KELAS_OPTIONS]));
  }

  function renderError(message?: string) {
    if (!message) return null;

    return (
      <p role="alert" className="mt-1.5 text-[9px] leading-4 text-red-600">
        {message}
      </p>
    );
  }

  function getFieldError(field: keyof ActivityForm) {
    return clientErrors[field] || fieldErrors[field];
  }

  function optionClass(checked: boolean) {
    return `${styles.option} ${
      checked
        ? "border-teal-600 bg-teal-50/70"
        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
    } ${loading ? "cursor-not-allowed opacity-60" : ""}`;
  }

  function modeCardClass(checked: boolean) {
    return `flex min-h-[52px] min-w-0 cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-left transition ${
      checked
        ? "border-teal-600 bg-teal-50/60"
        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
    } ${loading ? "cursor-not-allowed opacity-60" : ""}`;
  }

  function validateCurrentStep(): boolean {
    setStepError("");

    if (currentStep === 1) {
      const errors = validateActivity(activity);
      setClientErrors(errors);

      if (Object.keys(errors).length > 0) {
        setStepError("Periksa kembali informasi kegiatan yang bertanda merah.");
        return false;
      }

      return true;
    }

    if (currentStep === 2) {
      if (selectedDesa.length === 0) {
        setStepError("Pilih setidaknya satu desa sebagai sasaran kegiatan.");
        return false;
      }

      if (groupMode === "specific" && effectiveKelompok.length === 0) {
        setStepError(
          "Pilih setidaknya satu kelompok atau pilih semua kelompok.",
        );
        return false;
      }

      return true;
    }

    return true;
  }

  function goToStep(nextStep: number) {
    if (loading || submitLockRef.current || navigationLockRef.current) {
      return;
    }

    if (nextStep < 1 || nextStep > 3 || nextStep === currentStep) {
      return;
    }

    navigationLockRef.current = true;
    setCurrentStep(nextStep);
    setStepError("");

    requestAnimationFrame(() => {
      navigationLockRef.current = false;
    });
  }

  function handleNext() {
    if (
      loading ||
      submitLockRef.current ||
      navigationLockRef.current ||
      currentStep >= 3
    ) {
      return;
    }

    if (!validateCurrentStep()) return;

    navigationLockRef.current = true;
    setCurrentStep(currentStep + 1);
    setStepError("");

    requestAnimationFrame(() => {
      navigationLockRef.current = false;
    });
  }

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      currentStep !== 3 ||
      loading ||
      submitLockRef.current ||
      navigationLockRef.current
    ) {
      return;
    }

    const errors = validateActivity(activity);
    setClientErrors(errors);

    if (Object.keys(errors).length > 0) {
      setStepError(
        "Informasi kegiatan belum lengkap atau belum valid. Silakan kembali ke langkah pertama.",
      );
      return;
    }

    if (selectedDesa.length === 0) {
      setStepError("Pilih setidaknya satu desa sebagai sasaran kegiatan.");
      return;
    }

    if (groupMode === "specific" && effectiveKelompok.length === 0) {
      setStepError("Pilih setidaknya satu kelompok atau pilih semua kelompok.");
      return;
    }

    setStepError("");
    submitLockRef.current = true;

    try {
      await onSubmit(event);
    } catch (submitError) {
      console.error("Gagal menyimpan kegiatan:", submitError);
      setStepError(
        "Terjadi kesalahan saat menyimpan kegiatan. Silakan coba kembali.",
      );
    } finally {
      submitLockRef.current = false;
    }
  }

  return (
    <ModalWrapper onClose={onClose} size="lg">
      <form
        onSubmit={handleFormSubmit}
        noValidate
        className="flex max-h-[90dvh] min-h-0 w-full flex-col overflow-hidden bg-white"
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                mode === "add"
                  ? "bg-teal-50 text-teal-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {mode === "add" ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14M5 12h14"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.5 3.5 4 4L8 20l-5 1 1-5Z"
                  />
                </svg>
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-[11px] font-semibold leading-5 text-gray-900">
                {mode === "add" ? "Tambah Kegiatan" : "Edit Kegiatan"}
              </h2>
              <p className="mt-0.5 text-[9px] leading-4 text-gray-500">
                Langkah {currentStep} dari 3
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup formulir"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6 6 12 12M18 6 6 18"
              />
            </svg>
          </button>
        </header>

        {/* Step indicator */}
        <div className="shrink-0 border-b border-gray-100 px-4 py-3 sm:px-5">
          <div className="grid grid-cols-3 gap-2">
            {STEPS.map((step) => {
              const active = currentStep === step.number;
              const completed = currentStep > step.number;
              const canVisit = step.number < currentStep;

              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => {
                    if (canVisit) goToStep(step.number);
                  }}
                  disabled={
                    loading ||
                    submitLockRef.current ||
                    navigationLockRef.current ||
                    !canVisit
                  }
                  aria-current={active ? "step" : undefined}
                  className="min-w-0 text-left disabled:cursor-default"
                >
                  <div
                    className={`mb-2 h-1 rounded-full transition ${
                      completed || active ? "bg-teal-700" : "bg-gray-200"
                    }`}
                  />

                  <div className="flex min-w-0 items-start gap-1.5">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-semibold ${
                        active || completed
                          ? "bg-teal-700 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {completed ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="h-3 w-3"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m5 12 4 4L19 6"
                          />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </span>

                    <span className="min-w-0">
                      <span
                        className={`block wrap-break-word text-[9px] font-semibold leading-4 ${
                          active ? "text-teal-800" : "text-gray-700"
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="mt-0.5 hidden text-[8px] leading-3.5 text-gray-500 sm:block">
                        {step.description}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-5 sm:py-4">
          {/* Step 1 */}
          <section hidden={currentStep !== 1} className="space-y-3">
            {/* Informasi utama */}
            <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm shadow-gray-900/2 sm:p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v5" />
                    <path d="M12 8h.01" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h3 className="text-[11px] font-bold leading-4 text-gray-900">
                    Informasi Utama
                  </h3>
                  <p className="text-[8px] leading-4 text-gray-500">
                    Tentukan nama yang menggambarkan kegiatan.
                  </p>
                </div>
              </div>
              <div>
                <label htmlFor="nama" className={styles.label}>
                  Nama kegiatan <span className="text-red-600">*</span>
                </label>
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  required
                  maxLength={150}
                  placeholder="Contoh: Pengajian Rutin"
                  value={activity.nama}
                  onChange={(event) =>
                    updateActivity("nama", event.target.value)
                  }
                  disabled={loading}
                  aria-invalid={Boolean(getFieldError("nama"))}
                  aria-describedby={
                    getFieldError("nama") ? "nama-error" : undefined
                  }
                  className={styles.input}
                />
                <div id="nama-error">{renderError(getFieldError("nama"))}</div>
              </div>
            </div>

            {/* Jadwal kegiatan */}
            <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm shadow-gray-900/2 sm:p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <rect x="3.5" y="5" width="17" height="15" rx="2" />
                    <path d="M7.5 3v4M16.5 3v4M3.5 9h17" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h3 className="text-[11px] font-bold leading-4 text-gray-900">
                    Jadwal Kegiatan
                  </h3>
                  <p className="text-[8px] leading-4 text-gray-500">
                    Atur rentang tanggal dan waktu pelaksanaan.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-2.5 gap-y-3 sm:gap-x-3">
                <div className="min-w-0">
                  <label htmlFor="tanggal_mulai" className={styles.label}>
                    Tanggal mulai <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="tanggal_mulai"
                    name="tanggal_mulai"
                    type="date"
                    required
                    value={activity.tanggal_mulai}
                    onChange={(event) =>
                      updateActivity("tanggal_mulai", event.target.value)
                    }
                    disabled={loading}
                    aria-invalid={Boolean(getFieldError("tanggal_mulai"))}
                    className={styles.input}
                  />
                  {renderError(getFieldError("tanggal_mulai"))}
                </div>
                <div className="min-w-0">
                  <label htmlFor="tanggal_selesai" className={styles.label}>
                    Tanggal selesai <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="tanggal_selesai"
                    name="tanggal_selesai"
                    type="date"
                    required
                    min={activity.tanggal_mulai || undefined}
                    value={activity.tanggal_selesai}
                    onChange={(event) =>
                      updateActivity("tanggal_selesai", event.target.value)
                    }
                    disabled={loading}
                    aria-invalid={Boolean(getFieldError("tanggal_selesai"))}
                    className={styles.input}
                  />
                  {renderError(getFieldError("tanggal_selesai"))}
                </div>
                <div className="min-w-0">
                  <label htmlFor="jam_mulai" className={styles.label}>
                    Jam mulai <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="jam_mulai"
                    name="jam_mulai"
                    type="time"
                    required
                    value={activity.jam_mulai}
                    onChange={(event) =>
                      updateActivity("jam_mulai", event.target.value)
                    }
                    disabled={loading}
                    aria-invalid={Boolean(getFieldError("jam_mulai"))}
                    className={styles.input}
                  />
                  {renderError(getFieldError("jam_mulai"))}
                </div>
                <div className="min-w-0">
                  <label htmlFor="jam_selesai" className={styles.label}>
                    Jam selesai <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="jam_selesai"
                    name="jam_selesai"
                    type="time"
                    required
                    value={activity.jam_selesai}
                    onChange={(event) =>
                      updateActivity("jam_selesai", event.target.value)
                    }
                    disabled={loading}
                    aria-invalid={Boolean(getFieldError("jam_selesai"))}
                    className={styles.input}
                  />
                  {renderError(getFieldError("jam_selesai"))}
                </div>
              </div>
            </div>

            {/* Lokasi pelaksanaan */}
            <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm shadow-gray-900/2 sm:p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h3 className="text-[11px] font-bold leading-4 text-gray-900">
                    Lokasi Pelaksanaan
                  </h3>
                  <p className="text-[8px] leading-4 text-gray-500">
                    Masukkan tempat kegiatan akan berlangsung.
                  </p>
                </div>
              </div>
              <div>
                <label htmlFor="lokasi" className={styles.label}>
                  Lokasi <span className="text-red-600">*</span>
                </label>
                <input
                  id="lokasi"
                  name="lokasi"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Contoh: Balai Desa Pandak"
                  value={activity.lokasi}
                  onChange={(event) =>
                    updateActivity("lokasi", event.target.value)
                  }
                  disabled={loading}
                  aria-invalid={Boolean(getFieldError("lokasi"))}
                  className={styles.input}
                />
                {renderError(getFieldError("lokasi"))}
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section hidden={currentStep !== 2} className="space-y-3">
            <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm shadow-gray-900/2 sm:p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M12 21s-7-4.5-7-11a7 7 0 1 1 14 0c0 6.5-7 11-7 11Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h3 className="text-[11px] font-bold leading-4 text-gray-900">
                    Sasaran Kegiatan
                  </h3>
                  <p className="text-[8px] leading-4 text-gray-500">
                    Tentukan wilayah dan kriteria peserta kegiatan.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {/* Desa */}
                <div className="rounded-lg border border-gray-100 bg-white p-3">
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                    <h4 className={styles.subheading}>
                      Desa <span className="text-red-600">*</span>
                    </h4>

                    {isSuperAdmin && (
                      <span className="text-[9px] tabular-nums text-gray-500">
                        {selectedDesa.length} dipilih
                      </span>
                    )}
                  </div>

                  {isSuperAdmin ? (
                    <div className="grid grid-cols-2 gap-2">
                      {DESA_OPTIONS.map((desa) => {
                        const checked = selectedDesa.includes(desa);

                        return (
                          <label key={desa} className={optionClass(checked)}>
                            <input
                              type="checkbox"
                              name="desa"
                              value={desa}
                              checked={checked}
                              onChange={() => toggleDesa(desa)}
                              disabled={loading}
                              className="h-3.5 w-3.5 shrink-0 accent-teal-700"
                            />
                            <span className={styles.optionText}>{desa}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex min-w-0 items-center gap-2.5 rounded-lg border border-teal-200 bg-teal-50/60 p-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
                          />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <p className="wrap-break-word text-[9px] font-semibold text-gray-900">
                          {desaAdmin || "Desa belum ditetapkan"}
                        </p>
                        <p className="mt-0.5 text-[9px] leading-4 text-gray-500">
                          Mengikuti wilayah pada profil admin.
                        </p>
                      </div>
                    </div>
                  )}

                  {renderError(fieldErrors.desa)}
                </div>

                {/* Kelompok */}
                <div className="rounded-lg border border-gray-100 bg-white p-3">
                  <div className="mb-2.5">
                    <h4 className={styles.subheading}>Kelompok</h4>
                    <p className={`mt-1 ${styles.description}`}>
                      Pilih semua kelompok atau tentukan kelompok tertentu.
                    </p>
                  </div>

                  {selectedDesa.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 px-3 py-5 text-center">
                      <p className="text-[9px] font-medium text-gray-600">
                        Pilih desa terlebih dahulu
                      </p>
                      <p className="mt-1 text-[9px] leading-4 text-gray-500">
                        Daftar kelompok akan muncul setelah desa dipilih.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            {
                              value: "all",
                              title: "Semua kelompok",
                              description: "Seluruh kelompok di desa terpilih.",
                            },
                            {
                              value: "specific",
                              title: "Kelompok tertentu",
                              description: "Pilih kelompok sesuai sasaran.",
                            },
                          ] as const
                        ).map((item) => {
                          const checked = groupMode === item.value;

                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => changeGroupMode(item.value)}
                              disabled={loading}
                              aria-pressed={checked}
                              className={modeCardClass(checked)}
                            >
                              <span
                                className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                                  checked
                                    ? "border-teal-700"
                                    : "border-gray-300"
                                }`}
                              >
                                {checked && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-teal-700" />
                                )}
                              </span>

                              <span className="min-w-0">
                                <span className="block wrap-break-word text-[9px] font-semibold text-gray-800">
                                  {item.title}
                                </span>
                                <span className="mt-1 block text-[9px] leading-4 text-gray-500">
                                  {item.description}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {groupMode === "specific" && (
                        <div className="mt-3 rounded-lg border border-gray-200 p-3">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[9px] font-semibold text-gray-800">
                                Pilih kelompok
                              </p>
                              <p className="mt-0.5 text-[9px] text-gray-500">
                                {effectiveKelompok.length} dari{" "}
                                {availableKelompok.length} dipilih
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={toggleAllKelompok}
                              disabled={loading}
                              className={styles.action}
                            >
                              {allKelompokSelected
                                ? "Hapus semua"
                                : "Pilih semua"}
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {selectedDesa.map((desa) => {
                              const kelompokDesa =
                                KELOMPOK_BY_DESA[
                                  desa as keyof typeof KELOMPOK_BY_DESA
                                ] ?? [];

                              const jumlahTerpilih = kelompokDesa.filter(
                                (item) => effectiveKelompok.includes(item),
                              ).length;

                              return (
                                <div
                                  key={desa}
                                  className="border-t border-gray-100 pt-3 first:border-0 first:pt-0"
                                >
                                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                                    <h5 className="text-[9px] font-semibold text-gray-800">
                                      {desa}
                                    </h5>
                                    <span className="text-[9px] tabular-nums text-gray-500">
                                      {jumlahTerpilih}/{kelompokDesa.length}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    {kelompokDesa.map((kelompok) => {
                                      const checked =
                                        effectiveKelompok.includes(kelompok);

                                      return (
                                        <label
                                          key={`${desa}-${kelompok}`}
                                          className={optionClass(checked)}
                                        >
                                          <input
                                            type="checkbox"
                                            name="kelompok"
                                            value={kelompok}
                                            checked={checked}
                                            onChange={() =>
                                              toggleKelompok(kelompok)
                                            }
                                            disabled={loading}
                                            className="h-3.5 w-3.5 shrink-0 accent-teal-700"
                                          />
                                          <span className={styles.optionText}>
                                            {kelompok}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {groupMode === "all" && (
                        <p className="mt-2.5 rounded-lg bg-gray-50 px-3 py-2 text-[9px] leading-4 text-gray-600">
                          Berlaku untuk seluruh kelompok di{" "}
                          {selectedDesa.length === 1
                            ? `Desa ${selectedDesa[0]}.`
                            : `${selectedDesa.length} desa terpilih.`}
                        </p>
                      )}
                    </>
                  )}

                  {renderError(fieldErrors.kelompok)}
                </div>

                {/* Kelas */}
                <div className="rounded-lg border border-gray-100 bg-white p-3">
                  <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className={styles.subheading}>Kelas peserta</h4>
                      <p className={`mt-1 ${styles.description}`}>
                        Kosongkan pilihan untuk menyertakan semua kelas.
                      </p>
                    </div>

                    <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-[8px] font-medium text-gray-600">
                      {kelasLabel}
                    </span>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm shadow-gray-900/2 sm:p-3.5">
                    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[9px] font-medium text-gray-700">
                        Pilih kelas
                      </p>
                      <button
                        type="button"
                        onClick={toggleAllKelas}
                        disabled={loading}
                        className={styles.action}
                      >
                        {allKelasSelected ? "Hapus semua" : "Pilih semua"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {KELAS_OPTIONS.map((kelas) => {
                        const checked = selectedKelas.includes(kelas);

                        return (
                          <label key={kelas} className={optionClass(checked)}>
                            <input
                              type="checkbox"
                              name="kelas"
                              value={kelas}
                              checked={checked}
                              onChange={() => toggleKelas(kelas)}
                              disabled={loading}
                              className="h-3.5 w-3.5 shrink-0 accent-teal-700"
                            />
                            <span className={styles.optionText}>{kelas}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {renderError(fieldErrors.kelas)}
                </div>

                {/* Jenis kelamin */}
                <div className="rounded-lg border border-gray-100 bg-white p-3">
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className={styles.subheading}>Jenis kelamin</h4>
                      <p className={`mt-1 ${styles.description}`}>
                        Tentukan peserta berdasarkan jenis kelamin.
                      </p>
                    </div>

                    <span className="shrink-0 text-[9px] text-gray-500">
                      {jenisKelaminLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {(["", ...JENIS_KELAMIN_OPTIONS] as string[]).map(
                      (option) => {
                        const checked = jenisKelamin === option;

                        return (
                          <label
                            key={option || "semua"}
                            className={`flex min-h-9 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 transition ${
                              checked
                                ? "border-teal-600 bg-teal-50/70 text-teal-900"
                                : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            } ${loading ? "cursor-not-allowed opacity-60" : ""}`}
                          >
                            <input
                              type="radio"
                              name="jenis_kelamin"
                              value={option}
                              checked={checked}
                              onChange={() => {
                                setJenisKelamin(option);
                                setStepError("");
                              }}
                              disabled={loading}
                              className="h-3.5 w-3.5 shrink-0 accent-teal-700"
                            />
                            <span className="wrap-break-word text-center text-[9px] font-medium">
                              {option || "Semua"}
                            </span>
                          </label>
                        );
                      },
                    )}
                  </div>

                  {renderError(fieldErrors.jenis_kelamin)}
                </div>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section hidden={currentStep !== 3} className="space-y-3">
            <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm shadow-gray-900/2 sm:p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m9 12 2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h3 className="text-[11px] font-bold leading-4 text-gray-900">
                    Ringkasan & Konfirmasi
                  </h3>
                  <p className="text-[8px] leading-4 text-gray-500">
                    Periksa kembali informasi dan sasaran sebelum menyimpan.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Ringkasan informasi kegiatan */}
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm shadow-gray-900/2 sm:p-3.5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h4 className={styles.subheading}>Informasi Kegiatan</h4>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    disabled={loading}
                    className={styles.action}
                  >
                    Ubah
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <p className="text-[9px] text-gray-500">Nama kegiatan</p>
                    <p className="mt-0.5 wrap-break-word text-[9px] font-semibold leading-4 text-gray-900">
                      {activity.nama.trim() || "Belum diisi"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-500">Tanggal mulai</p>
                      <p className="mt-0.5 wrap-break-word text-[9px] font-medium leading-4 text-gray-800">
                        {formatDate(activity.tanggal_mulai)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-500">
                        Tanggal selesai
                      </p>
                      <p className="mt-0.5 wrap-break-word text-[9px] font-medium leading-4 text-gray-800">
                        {formatDate(activity.tanggal_selesai)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-500">Jam mulai</p>
                      <p className="mt-0.5 text-[9px] font-medium text-gray-800">
                        {formatTime(activity.jam_mulai)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-500">Jam selesai</p>
                      <p className="mt-0.5 text-[9px] font-medium text-gray-800">
                        {formatTime(activity.jam_selesai)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-2.5">
                    <p className="text-[9px] text-gray-500">Lokasi</p>
                    <p className="mt-0.5 wrap-break-word text-[9px] font-medium leading-4 text-gray-800">
                      {activity.lokasi.trim() || "Belum diisi"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ringkasan sasaran peserta */}
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm shadow-gray-900/2 sm:p-3.5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h4 className={styles.subheading}>Sasaran Peserta</h4>
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    disabled={loading}
                    className={styles.action}
                  >
                    Ubah
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[9px] font-medium text-gray-700">
                        Desa
                      </p>
                      <span className="text-[9px] text-gray-500">
                        {selectedDesa.length} dipilih
                      </span>
                    </div>

                    {selectedDesa.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDesa.map((desa) => (
                          <span
                            key={desa}
                            className="max-w-full wrap-break-word rounded-md bg-teal-50 px-2 py-1 text-[9px] font-medium text-teal-800"
                          >
                            {desa}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[9px] text-red-600">
                        Belum ada desa yang dipilih.
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[9px] font-medium text-gray-700">
                        Kelompok
                      </p>
                      {groupMode === "specific" && (
                        <span className="text-[9px] text-gray-500">
                          {effectiveKelompok.length} dipilih
                        </span>
                      )}
                    </div>

                    {groupMode === "all" ? (
                      <p className="text-[9px] leading-4 text-gray-700">
                        Semua kelompok di desa terpilih
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {groupNamesByDesa.map(({ desa, kelompok }) => (
                          <div key={desa}>
                            <p className="mb-1 text-[9px] font-medium text-gray-500">
                              {desa}
                            </p>

                            {kelompok.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {kelompok.map((namaKelompok) => (
                                  <span
                                    key={`${desa}-${namaKelompok}`}
                                    className="max-w-full wrap-break-word rounded-md bg-gray-100 px-2 py-1 text-[9px] font-medium text-gray-700"
                                  >
                                    {namaKelompok}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[9px] text-gray-500">
                                Tidak ada kelompok yang dipilih.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[9px] font-medium text-gray-700">
                        Kelas peserta
                      </p>
                      <span className="text-[9px] text-gray-500">
                        {kelasLabel}
                      </span>
                    </div>

                    {selectedKelasForSummary.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedKelasForSummary.map((kelas) => (
                          <span
                            key={kelas}
                            className="max-w-full wrap-break-word rounded-md bg-gray-100 px-2 py-1 text-[9px] font-medium text-gray-700"
                          >
                            {kelas}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[9px] text-gray-500">
                        Tidak ada kelas yang tersedia.
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-[9px] font-medium text-gray-700">
                      Jenis kelamin
                    </p>
                    <p className="mt-0.5 text-[9px] text-gray-700">
                      {jenisKelaminLabel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Catatan konfirmasi */}
              <div className="flex items-start gap-2 rounded-lg bg-teal-50 px-3 py-2.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 4h.01M10.3 3.86 1.82 18.5A2 2 0 0 0 3.55 21h16.9a2 2 0 0 0 1.73-2.5L13.7 3.86a2 2 0 0 0-3.4 0Z"
                  />
                </svg>

                <p className="text-[9px] leading-4 text-teal-900">
                  Pastikan informasi dan sasaran sudah sesuai. Data hanya
                  dikirim setelah kamu menekan tombol simpan.
                </p>
              </div>
            </div>
          </section>

          {(stepError || error) && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[9px] leading-4 text-red-700"
            >
              {stepError || error}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 flex-col gap-2.5 border-t border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-[9px] leading-4 text-gray-500">
            {currentStep < 3 ? (
              <>
                <span className="text-red-600">*</span> Wajib diisi
              </>
            ) : (
              "Periksa ringkasan sebelum konfirmasi."
            )}
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`${styles.button} w-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 sm:w-auto`}
            >
              Batal
            </button>

            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => goToStep(currentStep - 1)}
                disabled={loading || navigationLockRef.current}
                className={`${styles.button} w-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 sm:w-auto`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 12H5m7 7-7-7 7-7"
                  />
                </svg>
                Kembali
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading || navigationLockRef.current}
                className={`${styles.button} w-full bg-teal-700 text-white hover:bg-teal-800 sm:w-auto`}
              >
                Lanjut
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14m-7-7 7 7-7 7"
                  />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={
                  loading ||
                  submitLockRef.current ||
                  selectedDesa.length === 0 ||
                  (groupMode === "specific" && effectiveKelompok.length === 0)
                }
                className={`${styles.button} w-full bg-teal-700 text-white hover:bg-teal-800 sm:min-w-36 sm:w-auto`}
              >
                {loading ? (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                        opacity=".25"
                      />
                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m5 12 4 4L19 6"
                      />
                    </svg>
                    {mode === "add" ? "Simpan Kegiatan" : "Simpan Perubahan"}
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
      </form>
    </ModalWrapper>
  );
}
