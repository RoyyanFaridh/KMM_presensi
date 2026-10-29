"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Html5Qrcode } from "html5-qrcode";

import { scanMudamudiQR, getKegiatanById } from "../../backend/presensi/public";
import { formatRentangTanggal } from "../../backend/kegiatan/format";

import {
  CalendarIcon,
  ClockIcon,
  CreatorText,
  EmptyState,
  IconButton,
  LocationIcon,
  ScanButton,
  StatusBadge,
} from "../kegiatan/shared";

type Kegiatan = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  desa?: string[] | null;
};

type Mudamudi = {
  id: number;
  nama: string;
  desa: string;
  kelompok: string;
  kelas: string;
  jenis_kelamin: string | null;
  tahun_lahir: number | null;
};

type ScanResult =
  | {
      success: true;
      type: "success";
      message: string;
      presensiId: number;
      waktuCheckin: string;
      status: "hadir" | "terlambat" | "izin" | "sakit" | "alpa";
      metode: "qr" | "manual";
      kegiatan: Kegiatan;
      mudamudi: Mudamudi;
    }
  | {
      success: false;
      type:
        | "invalid_qr"
        | "mudamudi_not_found"
        | "kegiatan_not_found"
        | "kegiatan_inactive"
        | "already_present"
        | "not_target"
        | "database_error";
      message: string;
      mudamudi?: Mudamudi;
      kegiatan?: Kegiatan;
    };

type FailureType = Extract<ScanResult, { success: false }>["type"];
type SuccessStatus = Extract<ScanResult, { success: true }>["status"];
type Tone = "emerald" | "amber" | "rose";

type FailureMeta = {
  title: string;
  hint: string;
  tone: Tone;
};

type CheckinScannerProps = {
  kegiatanId: number;
};

const QR_REGION_ID = "sikema-mudamudi-qr-reader";

// Optimasi kecepatan scan
const SCAN_COOLDOWN = 1500;
const RESULT_DISPLAY_DURATION = 1500;
const FAILURE_DISPLAY_DURATION = 4000;

// Ukuran area scan
const MOBILE_QRBOX_SIZE = 200;
const DESKTOP_QRBOX_SIZE = 240;

// Frekuensi pemeriksaan QR per detik
const FPS = 15;

const MUDA_MUDI_QR_PREFIX = "SIKEMA:MUDA_MUDI:";

const TONES: Record<
  Tone,
  { bar: string; iconBg: string; icon: string; label: string }
> = {
  emerald: {
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-50",
    icon: "text-emerald-600",
    label: "text-emerald-600",
  },
  amber: {
    bar: "bg-amber-400",
    iconBg: "bg-amber-50",
    icon: "text-amber-600",
    label: "text-amber-600",
  },
  rose: {
    bar: "bg-rose-400",
    iconBg: "bg-rose-50",
    icon: "text-rose-600",
    label: "text-rose-600",
  },
};

const FAILURE_META: Record<FailureType, FailureMeta> = {
  already_present: {
    title: "Sudah presensi",
    hint: "Muda-Mudi ini sudah tercatat pada kegiatan ini. Tidak perlu scan ulang.",
    tone: "amber",
  },
  kegiatan_inactive: {
    title: "Di luar jam presensi",
    hint: "Presensi hanya bisa dicatat saat jendela presensi kegiatan sedang aktif. Cek jadwal kegiatan di bawah.",
    tone: "amber",
  },
  not_target: {
    title: "Bukan sasaran kegiatan",
    hint: "Muda-Mudi ini tidak termasuk peserta yang ditetapkan untuk kegiatan ini. Cek desa peserta dan sasaran kegiatan di bawah.",
    tone: "amber",
  },
  invalid_qr: {
    title: "QR tidak valid",
    hint: "QR rusak atau bukan QR Muda-Mudi. Minta peserta menampilkan QR personalnya lagi.",
    tone: "rose",
  },
  mudamudi_not_found: {
    title: "Muda-Mudi tidak ditemukan",
    hint: "QR terbaca, tetapi datanya tidak ada di sistem. QR mungkin sudah lama atau data anggota sudah dihapus. Cek di menu Muda-Mudi.",
    tone: "rose",
  },
  kegiatan_not_found: {
    title: "Kegiatan tidak ditemukan",
    hint: "Kegiatan ini mungkin sudah dihapus. Kembali ke daftar kegiatan dan pilih ulang.",
    tone: "rose",
  },
  database_error: {
    title: "Terjadi kesalahan",
    hint: "Ada gangguan saat menyimpan presensi. Coba scan ulang. Kalau berulang, hubungi admin.",
    tone: "rose",
  },
};

const FAILURE_FALLBACK: FailureMeta = {
  title: "Presensi tidak diproses",
  hint: "Presensi tidak tercatat. Coba scan ulang atau hubungi admin kalau berulang.",
  tone: "amber",
};

const STATUS_META: Record<SuccessStatus, { label: string; chip: string }> = {
  hadir: { label: "Hadir", chip: "bg-teal-50 text-teal-700" },
  terlambat: { label: "Terlambat", chip: "bg-amber-50 text-amber-700" },
  izin: { label: "Izin", chip: "bg-blue-50 text-blue-700" },
  sakit: { label: "Sakit", chip: "bg-violet-50 text-violet-700" },
  alpa: { label: "Alpa", chip: "bg-rose-50 text-rose-700" },
};

function getFailureMeta(type: string | undefined): FailureMeta {
  const meta = type
    ? (FAILURE_META as Record<string, FailureMeta>)[type.trim().toLowerCase()]
    : undefined;

  if (!meta) {
    console.warn("[CheckinScanner] Jenis hasil scan tidak dikenal:", type);
    return FAILURE_FALLBACK;
  }

  return meta;
}

function getStatusMeta(status: string | undefined) {
  if (!status) {
    return null;
  }

  const meta = (STATUS_META as Record<string, { label: string; chip: string }>)[
    status.trim().toLowerCase()
  ];

  if (!meta) {
    console.warn("[CheckinScanner] Status presensi tidak dikenal:", status);
    return null;
  }

  return meta;
}

function getDisplayDuration(result: ScanResult) {
  return result.success ? RESULT_DISPLAY_DURATION : FAILURE_DISPLAY_DURATION;
}

const CARD_CLASS =
  "rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]";

function PageHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
          Presensi
        </p>

        <h1 className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
          Scan QR Muda-Mudi
        </h1>

        <p className="mt-1 max-w-xl text-[10px] leading-4 text-gray-500 sm:text-xs">
          Gunakan kamera untuk mencatat kehadiran Muda-Mudi pada kegiatan.
        </p>
      </div>

      {children}
    </header>
  );
}

function ResultTimer({
  barClass,
  duration,
}: {
  barClass: string;
  duration: number;
}) {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setRunning(true), 30);

    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="h-0.5 w-full bg-gray-100">
      <div
        className={`h-full ${barClass} transition-[width] ease-linear`}
        style={{
          width: running ? "0%" : "100%",
          transitionDuration: `${duration}ms`,
        }}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-[10px] text-gray-400">{label}</dt>
      <dd className="min-w-0 text-right text-[11px] font-medium text-gray-700">
        {value}
      </dd>
    </div>
  );
}

export default function CheckinScanner({ kegiatanId }: CheckinScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const mountedRef = useRef(true);
  const scanningRef = useRef(false);
  const processingRef = useRef(false);

  const lastScannedQRRef = useRef<string | null>(null);
  const lastScannedAtRef = useRef(0);

  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const desktopModeRef = useRef<boolean | null>(null);
  const restartingRef = useRef(false);

  // Referensi audio agar AudioContext tidak dibuat berulang kali.
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(false);

  const [isStarting, setIsStarting] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  /**
   * Mengaktifkan suara melalui interaksi langsung pengguna.
   * Browser biasanya mengizinkan audio setelah tombol diklik.
   */
  const enableScanSound = async () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as Window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        console.warn("[CheckinScanner] Browser tidak mendukung Web Audio API.");
        return;
      }

      let audioContext = audioContextRef.current;

      if (!audioContext || audioContext.state === "closed") {
        audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;
      }

      await audioContext.resume();

      if (audioContext.state === "running") {
        soundEnabledRef.current = true;
        setSoundEnabled(true);
      }
    } catch (error) {
      console.warn("[CheckinScanner] Gagal mengaktifkan suara:", error);

      soundEnabledRef.current = false;
      setSoundEnabled(false);
    }
  };

  const disableScanSound = () => {
    soundEnabledRef.current = false;
    setSoundEnabled(false);
  };

  const playScanSound = (success: boolean) => {
    if (!soundEnabledRef.current) {
      return;
    }

    const audioContext = audioContextRef.current;

    if (!audioContext || audioContext.state !== "running") {
      return;
    }

    try {
      const playTone = (
        frequency: number,
        startAt: number,
        duration: number,
        volume: number,
      ) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        // Gelombang persegi menghasilkan beep lebih tajam.
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(frequency, startAt);

        // Volume dinaikkan, dengan envelope agar bunyi tetap bersih.
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.008);
        gain.gain.setValueAtTime(volume, startAt + duration * 0.65);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(startAt);
        oscillator.stop(startAt + duration);

        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
      };

      const now = audioContext.currentTime;

      if (success) {
        // TIIIT! — tinggi, nyaring, dan singkat.
        playTone(1800, now, 0.22, 0.65);
      } else {
        // Dua beep tinggi untuk menandakan kegagalan.
        playTone(950, now, 0.16, 0.4);
        playTone(700, now + 0.2, 0.2, 0.4);
      }
    } catch (error) {
      console.warn("[CheckinScanner] Gagal memainkan suara:", error);
    }
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      return;
    }

    scanningRef.current = false;
    setIsScanning(false);

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (error) {
      console.error("[CheckinScanner] Failed to stop scanner:", error);
    }

    try {
      scanner.clear();
    } catch (error) {
      console.error("[CheckinScanner] Failed to clear scanner:", error);
    }

    scannerRef.current = null;
  };

  const showResult = (scanResult: ScanResult) => {
    setResult(scanResult);

    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
    }

    resultTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) {
        return;
      }

      setResult(null);

      // QR yang sama tetap terkena cooldown.
      // QR berbeda dapat langsung diproses setelah hasil ditutup.
      lastScannedAtRef.current = Date.now();
      processingRef.current = false;
      resultTimeoutRef.current = null;
    }, getDisplayDuration(scanResult));
  };

  const handleScan = async (decodedText: string) => {
    if (!mountedRef.current || processingRef.current) {
      return;
    }

    const qrText = decodedText.trim();

    if (!qrText || !qrText.startsWith(MUDA_MUDI_QR_PREFIX)) {
      return;
    }

    const now = Date.now();

    // Cooldown hanya berlaku untuk QR yang sama.
    if (
      lastScannedQRRef.current === qrText &&
      now - lastScannedAtRef.current < SCAN_COOLDOWN
    ) {
      return;
    }

    // Kunci proses agar callback scan berulang
    // tidak mengirim permintaan presensi ganda.
    processingRef.current = true;
    lastScannedQRRef.current = qrText;
    lastScannedAtRef.current = now;

    setError(null);

    try {
      const scanResult = (await scanMudamudiQR(
        qrText,
        kegiatanId,
      )) as ScanResult;

      if (!mountedRef.current) {
        return;
      }

      // Bunyi dimainkan setelah hasil dari server diterima.
      playScanSound(scanResult.success);

      showResult(scanResult);
    } catch (error) {
      console.error("[CheckinScanner] Scan error:", error);

      if (!mountedRef.current) {
        return;
      }

      playScanSound(false);

      showResult({
        success: false,
        type: "database_error",
        message: "Terjadi kesalahan saat memproses presensi.",
      });
    }
  };

  const startScanner = async (force = false) => {
    if (!mountedRef.current) {
      return;
    }

    if (scanningRef.current && !force) {
      return;
    }

    if (restartingRef.current) {
      return;
    }

    restartingRef.current = true;

    setIsStarting(true);
    setError(null);

    try {
      const element = document.getElementById(QR_REGION_ID);

      if (!element) {
        throw new Error("Area scanner tidak ditemukan.");
      }

      if (scannerRef.current) {
        await stopScanner();
      }

      if (!mountedRef.current) {
        return;
      }

      const isDesktop = window.innerWidth >= 768;

      const qrboxSize = isDesktop
        ? DESKTOP_QRBOX_SIZE
        : Math.min(MOBILE_QRBOX_SIZE, Math.max(160, window.innerWidth - 64));

      const cameraConfig = {
        fps: FPS,
        qrbox: {
          width: qrboxSize,
          height: qrboxSize,
        },
        aspectRatio: isDesktop ? 16 / 9 : 1,
      };

      const scanner = new Html5Qrcode(QR_REGION_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        cameraConfig,
        (decodedText) => {
          void handleScan(decodedText);
        },
        () => {},
      );

      if (!mountedRef.current) {
        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }
        } catch {
          // Scanner akan dibersihkan saat cleanup.
        }

        try {
          scanner.clear();
        } catch {
          // Elemen mungkin sudah dibersihkan.
        }

        if (scannerRef.current === scanner) {
          scannerRef.current = null;
        }

        return;
      }

      desktopModeRef.current = isDesktop;

      scanningRef.current = true;

      setIsStarting(false);
      setIsScanning(true);
    } catch (error) {
      console.error("[CheckinScanner] Failed to start camera:", error);

      scanningRef.current = false;

      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
        } catch {
          // Kamera mungkin gagal dimulai.
        }

        try {
          scannerRef.current.clear();
        } catch {
          // Elemen mungkin sudah tidak tersedia.
        }

        scannerRef.current = null;
      }

      if (!mountedRef.current) {
        return;
      }

      setIsStarting(false);
      setIsScanning(false);

      if (error instanceof Error && error.message) {
        setError(error.message);
      } else {
        setError(
          "Kamera tidak dapat digunakan. Pastikan izin kamera sudah diberikan.",
        );
      }
    } finally {
      restartingRef.current = false;
    }
  };

  useEffect(() => {
    if (!kegiatan) {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleBreakpointChange = () => {
      if (!mountedRef.current) {
        return;
      }

      const isDesktop = mediaQuery.matches;

      if (desktopModeRef.current === isDesktop) {
        return;
      }

      window.setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }

        void startScanner(true);
      }, 150);
    };

    mediaQuery.addEventListener("change", handleBreakpointChange);

    return () => {
      mediaQuery.removeEventListener("change", handleBreakpointChange);
    };
  }, [kegiatan]);

  useEffect(() => {
    mountedRef.current = true;

    const loadKegiatan = async () => {
      try {
        const data = await getKegiatanById(kegiatanId);

        if (!mountedRef.current) {
          return;
        }

        if (!data) {
          setError("Kegiatan tidak ditemukan.");
          setIsStarting(false);
          return;
        }

        setKegiatan(data);
      } catch (error) {
        console.error("[CheckinScanner] Failed to load kegiatan:", error);

        if (!mountedRef.current) {
          return;
        }

        setError("Data kegiatan tidak dapat dimuat.");
        setIsStarting(false);
      }
    };

    void loadKegiatan();

    return () => {
      mountedRef.current = false;
      scanningRef.current = false;
      processingRef.current = false;

      desktopModeRef.current = null;
      restartingRef.current = false;
      soundEnabledRef.current = false;

      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
        resultTimeoutRef.current = null;
      }

      const cleanup = async () => {
        const scanner = scannerRef.current;

        if (scanner) {
          try {
            if (scanner.isScanning) {
              await scanner.stop();
            }
          } catch (error) {
            console.error("[CheckinScanner] Cleanup stop error:", error);
          }

          try {
            scanner.clear();
          } catch (error) {
            console.error("[CheckinScanner] Cleanup clear error:", error);
          }

          if (scannerRef.current === scanner) {
            scannerRef.current = null;
          }
        }

        const audioContext = audioContextRef.current;

        if (audioContext) {
          try {
            if (audioContext.state !== "closed") {
              await audioContext.close();
            }
          } catch (error) {
            console.warn("[CheckinScanner] Cleanup audio error:", error);
          }

          if (audioContextRef.current === audioContext) {
            audioContextRef.current = null;
          }
        }
      };

      void cleanup();
    };
  }, [kegiatanId]);

  useEffect(() => {
    if (!kegiatan) {
      return;
    }

    const timer = setTimeout(() => {
      void startScanner();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [kegiatan]);

  const formatWaktu = (value: string) => {
    try {
      return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  if (!kegiatan) {
    return (
      <main className="min-h-dvh bg-gray-50">
        <div className="mx-auto w-full px-4 py-5 sm:px-6 md:px-7 lg:px-8">
          <PageHeader />

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-600">
                  !
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-red-800 sm:text-xs">
                    Scanner tidak dapat digunakan
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-red-700 sm:text-xs sm:leading-5">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-center gap-3 px-4 py-16 text-gray-500 sm:py-20">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600" />

                <span className="text-[10px] sm:text-xs">
                  Memuat kegiatan...
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  const currentKegiatan = kegiatan;

  const jadwalKegiatan = `${formatRentangTanggal(
    currentKegiatan.tanggal_mulai,
    currentKegiatan.tanggal_selesai,
  )}, ${currentKegiatan.jam_mulai.slice(0, 5)}–${currentKegiatan.jam_selesai.slice(0, 5)}`;

  const sasaranKegiatan =
    Array.isArray(currentKegiatan.desa) && currentKegiatan.desa.length > 0
      ? currentKegiatan.desa.join(", ")
      : null;

  const successMeta =
    result && result.success ? getStatusMeta(result.status) : null;

  const failureMeta =
    result && !result.success ? getFailureMeta(result.type) : null;

  const resultTone: Tone | null = result
    ? result.success
      ? "emerald"
      : (failureMeta?.tone ?? FAILURE_FALLBACK.tone)
    : null;

  const toneClasses = resultTone ? TONES[resultTone] : null;

  const failureType = result && !result.success ? result.type : null;

  const showJadwal =
    failureType === "kegiatan_inactive" || failureType === "not_target";

  const showSasaran = failureType === "not_target" && sasaranKegiatan;

  return (
    <main className="min-h-dvh bg-gray-50">
      <div className="mx-auto w-full px-4 py-5 sm:px-6 md:px-7 lg:px-8">
        <PageHeader />

        <div className="space-y-4">
          {/* Ringkasan informasi kegiatan */}
          <section className={CARD_CLASS}>
            <div className="border-b border-gray-100 px-3.5 py-3 sm:px-4">
              <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
                Informasi Kegiatan
              </p>
              <h2 className="mt-1 wrap-break-word text-sm font-semibold leading-5 text-gray-900">
                {currentKegiatan.nama || "Belum ada nama kegiatan"}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-3.5 sm:p-4">
              {/* Jadwal kegiatan */}
              <div className="min-w-0">
                <p className="mb-2 text-[10px] font-semibold text-gray-700">
                  Jadwal Kegiatan
                </p>

                <div className="space-y-2">
                  <div>
                    <p className="text-[9px] text-gray-500">Tanggal kegiatan</p>
                    <p className="mt-0.5 wrap-break-word text-[10px] font-medium leading-4 text-gray-800">
                      {formatRentangTanggal(
                        currentKegiatan.tanggal_mulai,
                        currentKegiatan.tanggal_mulai,
                      )}{" "}
                      <span className="mx-0.5 text-gray-400">→</span>
                      {formatRentangTanggal(
                        currentKegiatan.tanggal_selesai,
                        currentKegiatan.tanggal_selesai,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-gray-500">Waktu</p>
                    <p className="mt-0.5 text-[10px] font-medium leading-4 text-gray-800">
                      {currentKegiatan.jam_mulai?.slice(0, 5) || "-"}–
                      {currentKegiatan.jam_selesai?.slice(0, 5) || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lokasi dan sasaran */}
              <div className="min-w-0 space-y-3 border-l border-gray-100 pl-3">
                <div>
                  <p className="mb-1 text-[10px] font-semibold text-gray-700">
                    Lokasi
                  </p>
                  <p className="wrap-break-word text-[10px] font-medium leading-4 text-gray-800">
                    {currentKegiatan.lokasi?.trim() || "Belum diisi"}
                  </p>
                </div>

                <div>
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
                    <p className="text-[10px] font-semibold text-gray-700">
                      Sasaran Peserta
                    </p>
                    <span className="text-[9px] text-gray-500">
                      {Array.isArray(currentKegiatan.desa)
                        ? `${currentKegiatan.desa.length} desa`
                        : "0 desa"}
                    </span>
                  </div>

                  {Array.isArray(currentKegiatan.desa) &&
                  currentKegiatan.desa.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {currentKegiatan.desa.map((desa) => (
                        <span
                          key={desa}
                          className="max-w-full wrap-break-word rounded-md bg-gray-100 px-2 py-1 text-[9px] font-medium text-gray-700"
                        >
                          {desa}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] leading-4 text-gray-500">
                      Tidak ada sasaran desa yang ditentukan.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className={`overflow-hidden ${CARD_CLASS}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5 sm:px-5">
              <div className="min-w-0">
                <h2 className="text-xs font-semibold text-gray-800">
                  Kamera Scanner
                </h2>

                <p className="mt-0.5 text-[10px] text-gray-400">
                  Arahkan QR personal Muda-Mudi ke kamera.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Tombol pengaturan suara */}
                <button
                  type="button"
                  onClick={() => {
                    if (soundEnabledRef.current) {
                      disableScanSound();
                    } else {
                      void enableScanSound();
                    }
                  }}
                  aria-pressed={soundEnabled}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
                    soundEnabled
                      ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                  title={
                    soundEnabled
                      ? "Matikan suara notifikasi"
                      : "Aktifkan suara notifikasi"
                  }
                >
                  {soundEnabled ? (
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
                        d="M11 5 6 9H3v6h3l5 4V5Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.5 8.5a5 5 0 0 1 0 7"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.5 5.5a9 9 0 0 1 0 13"
                      />
                    </svg>
                  ) : (
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
                        d="M11 5 6 9H3v6h3l5 4V5Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16 9 5 6m0-6-5 6"
                      />
                    </svg>
                  )}

                  {soundEnabled ? "Suara aktif" : "Aktifkan suara"}
                </button>

                <div className="flex shrink-0 items-center gap-1.5 text-[10px]">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isScanning
                        ? "animate-pulse bg-emerald-500"
                        : "bg-gray-300"
                    }`}
                  />

                  <span
                    className={
                      isScanning ? "text-emerald-600" : "text-gray-400"
                    }
                  >
                    {isScanning ? "Scanner aktif" : "Menyiapkan kamera"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-5">
              <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-lg bg-gray-950">
                <div id={QR_REGION_ID} className="w-full" />

                {isStarting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-950/90">
                    <div className="text-center text-white">
                      <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />

                      <p className="mt-3 text-[11px] font-medium sm:text-xs">
                        Menyiapkan kamera
                      </p>
                    </div>
                  </div>
                )}

                {result && toneClasses && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-gray-950/70 p-3 backdrop-blur-[2px] sm:p-4"
                  >
                    <div className="my-auto w-full max-w-sm overflow-hidden rounded-xl bg-white text-center shadow-lg">
                      <div className={`h-1 w-full ${toneClasses.bar}`} />

                      <div className="p-4 sm:p-5">
                        <div
                          className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${toneClasses.iconBg}`}
                        >
                          {result.success ? (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              className={`h-5 w-5 ${toneClasses.icon}`}
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className={`h-5 w-5 ${toneClasses.icon}`}
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.5M12 16h.01"
                              />

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.3 4.8 2.9 17.5a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z"
                              />
                            </svg>
                          )}
                        </div>

                        <p
                          className={`mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClasses.label}`}
                        >
                          {result.success
                            ? "Presensi berhasil"
                            : (failureMeta?.title ?? FAILURE_FALLBACK.title)}
                        </p>

                        {result.mudamudi && (
                          <h3 className="mt-1.5 text-base font-semibold text-gray-900">
                            {result.mudamudi.nama}
                          </h3>
                        )}

                        {result.success ? (
                          <>
                            {result.mudamudi && (
                              <p className="mt-1 text-[11px] text-gray-500">
                                {result.mudamudi.desa} ·{" "}
                                {result.mudamudi.kelompok}
                              </p>
                            )}

                            {successMeta && (
                              <div
                                className={`mt-3 inline-flex rounded-md px-2.5 py-1 text-[10px] font-semibold ${successMeta.chip}`}
                              >
                                {successMeta.label}
                              </div>
                            )}

                            {result.waktuCheckin && (
                              <p className="mt-2 text-[10px] tabular-nums text-gray-400">
                                {formatWaktu(result.waktuCheckin)}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            {result.message && (
                              <p className="mt-2 text-[11px] font-medium leading-5 text-gray-700">
                                {result.message}
                              </p>
                            )}

                            <p className="mt-1.5 text-[11px] leading-5 text-gray-500">
                              {failureMeta?.hint ?? FAILURE_FALLBACK.hint}
                            </p>

                            {(result.mudamudi || showJadwal || showSasaran) && (
                              <dl className="mt-3 space-y-1.5 rounded-lg bg-gray-50 px-3 py-2.5 text-left">
                                {result.mudamudi && (
                                  <DetailRow
                                    label="Desa peserta"
                                    value={result.mudamudi.desa || "-"}
                                  />
                                )}

                                {result.mudamudi && (
                                  <DetailRow
                                    label="Kelompok"
                                    value={result.mudamudi.kelompok || "-"}
                                  />
                                )}

                                {showSasaran && (
                                  <DetailRow
                                    label="Sasaran kegiatan"
                                    value={sasaranKegiatan ?? "-"}
                                  />
                                )}

                                {showJadwal && (
                                  <DetailRow
                                    label="Jadwal kegiatan"
                                    value={jadwalKegiatan}
                                  />
                                )}
                              </dl>
                            )}
                          </>
                        )}
                      </div>

                      <ResultTimer
                        barClass={toneClasses.bar}
                        duration={getDisplayDuration(result)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {!result && !error && (
                <p className="mx-auto mt-3 w-full max-w-3xl text-center text-[10px] leading-4 text-gray-400">
                  Posisikan QR di dalam kotak. Scanner tetap aktif untuk peserta
                  berikutnya.
                </p>
              )}

              {error && (
                <div className="mx-auto mt-3 w-full max-w-3xl rounded-lg border border-red-200 bg-red-50 p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-100 text-xs font-bold text-red-600">
                      !
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-red-800">
                        Kamera bermasalah
                      </p>

                      <p className="mt-0.5 text-[10px] leading-4 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void startScanner(true)}
                    className="mt-3 w-full rounded-lg bg-teal-600 px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-teal-700 active:bg-teal-800 sm:w-auto sm:px-4"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function UsersIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
