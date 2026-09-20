"use client";

import { useCallback, useState } from "react";

import {
  getDeviceStatus,
  getKegiatanById,
  submitPresensi,
  verifyIdentity,
  changeDeviceAccount,
} from "../../backend/presensi/actions";

import type { SubmitPresensiResult } from "../../backend/presensi/types";

import CheckinSteps from "./CheckinSteps";

import type { ScannedKegiatan, Step } from "./CheckinTypes";

const DEVICE_TOKEN_KEY = "sikema_device_token";

export default function CheckinFlow() {
  const [step, setStep] = useState<Step>({
    name: "scan",
  });

  const [nama, setNama] = useState("");

  const [tanggalLahir, setTanggalLahir] = useState("");

  const [kegiatan, setKegiatan] = useState<ScannedKegiatan | null>(null);

  const [hasil, setHasil] = useState<SubmitPresensiResult | null>(null);

  const [namaDevice, setNamaDevice] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [identityMode, setIdentityMode] = useState<"baru" | "akun-lain">(
    "baru",
  );

  function getDeviceToken() {
    try {
      return localStorage.getItem(DEVICE_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  function saveDeviceToken(token: string) {
    try {
      localStorage.setItem(DEVICE_TOKEN_KEY, token);
    } catch {
      // Abaikan jika localStorage tidak tersedia.
    }
  }

  function reset() {
    setStep({
      name: "scan",
    });

    setNama("");
    setTanggalLahir("");
    setKegiatan(null);
    setHasil(null);
    setNamaDevice("");
    setError("");
    setLoading(false);
    setIdentityMode("baru");
  }

  function handleNamaChange(value: string) {
    setNama(value);
    setError("");
  }

  function handleTanggalLahirChange(value: string) {
    setTanggalLahir(value.replace(/\D/g, "").slice(0, 8));

    setError("");
  }

  /**
   * Memproses kegiatan setelah QR
   * berhasil dibaca.
   */
  const processKegiatan = useCallback(
    async (selectedKegiatan: ScannedKegiatan) => {
      const deviceToken = getDeviceToken();

      setKegiatan(selectedKegiatan);

      setError("");
      setLoading(true);

      try {
        /**
         * Jika device memiliki token,
         * cek akun yang terhubung.
         */
        if (deviceToken) {
          const deviceResult = await getDeviceStatus(deviceToken);

          if (deviceResult.status === "known") {
            setNamaDevice(deviceResult.mudamudi.nama);

            setStep({
              name: "akun-dikenal",
            });

            return;
          }
        }

        /**
         * Device belum dikenal.
         *
         * Coba submit tanpa identitas.
         * Backend akan mengembalikan
         * requiresIdentity.
         */
        const result = await submitPresensi(null, selectedKegiatan.id);

        if (result.success) {
          if (result.data.deviceToken) {
            saveDeviceToken(result.data.deviceToken);
          }

          setHasil(result.data);

          setStep({
            name: "berhasil",
          });

          return;
        }

        if (result.requiresIdentity) {
          setIdentityMode("baru");

          setStep({
            name: "identitas",
            mode: "baru",
          });

          return;
        }

        setError(result.error ?? "Presensi gagal disimpan.");
      } catch {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Dipanggil setelah QR scanner
   * mendapatkan ID kegiatan.
   */
  const handleScan = useCallback(
    async (kegiatanId: number) => {
      setError("");
      setLoading(true);

      try {
        const result = await getKegiatanById(kegiatanId);

        if (result.error) {
          setError(result.error);

          return;
        }

        if (!result.data) {
          setError("Kegiatan tidak ditemukan.");

          return;
        }

        await processKegiatan(result.data);
      } catch {
        setError("Gagal memproses QR Code.");
      } finally {
        setLoading(false);
      }
    },
    [processKegiatan],
  );

  /**
   * Submit identitas.
   */
  async function handleSubmitIdentity() {
    if (!kegiatan) {
      setError("Kegiatan belum dipilih.");

      return;
    }

    if (!nama.trim()) {
      setError("Nama wajib diisi.");

      return;
    }

    if (!/^\d{8}$/.test(tanggalLahir)) {
      setError("Masukkan tanggal lahir dengan format DDMMYYYY.");

      return;
    }

    const formattedTanggalLahir = `${tanggalLahir.slice(4)}-${tanggalLahir.slice(2, 4)}-${tanggalLahir.slice(0, 2)}`;

    setError("");
    setLoading(true);

    try {
      /**
       * ==========================================
       * MODE AKUN BARU
       * ==========================================
       *
       * Device belum memiliki akun.
       */
      if (identityMode === "baru") {
        const result = await submitPresensi(null, kegiatan.id, {
          nama,
          tanggalLahir: formattedTanggalLahir,
        });

        if (!result.success) {
          setError(result.error ?? "Presensi gagal disimpan.");

          return;
        }

        if (result.data.deviceToken) {
          saveDeviceToken(result.data.deviceToken);
        }

        setHasil(result.data);

        setStep({
          name: "berhasil",
        });

        return;
      }

      /**
       * ==========================================
       * MODE GUNAKAN AKUN LAIN
       * ==========================================
       *
       * 1. Verifikasi nama + tanggal lahir.
       * 2. Ambil ID Muda-Mudi.
       * 3. Rebind device ke akun baru.
       * 4. Submit presensi.
       */
      const identityResult = await verifyIdentity({
        nama,
        tanggalLahir: formattedTanggalLahir,
      });

      if (!identityResult.success) {
        setError(identityResult.error);

        return;
      }

      const deviceToken = getDeviceToken();

      if (!deviceToken) {
        setError("Perangkat belum terdaftar. Silakan ulangi proses.");

        return;
      }

      const changeResult = await changeDeviceAccount(
        deviceToken,
        identityResult.mudamudi.id,
      );

      if (!changeResult.success) {
        setError(changeResult.error ?? "Gagal mengganti akun perangkat.");

        return;
      }

      /**
       * Setelah device berhasil
       * di-rebind, submit presensi
       * menggunakan token yang sama.
       */
      const result = await submitPresensi(deviceToken, kegiatan.id);

      if (!result.success) {
        setError(result.error ?? "Presensi gagal disimpan.");

        return;
      }

      if (result.data.deviceToken) {
        saveDeviceToken(result.data.deviceToken);
      }

      setHasil(result.data);

      setStep({
        name: "berhasil",
      });
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Presensi untuk device yang
   * sudah dikenal.
   */
  async function handlePresensi() {
    if (!kegiatan) {
      setError("Kegiatan belum dipilih.");

      return;
    }

    const deviceToken = getDeviceToken();

    if (!deviceToken) {
      setError("Device token tidak ditemukan. Silakan scan QR kembali.");

      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await submitPresensi(deviceToken, kegiatan.id);

      if (!result.success) {
        /**
         * Jika token ternyata tidak
         * valid lagi, minta identitas.
         */
        if (result.requiresIdentity) {
          setIdentityMode("baru");

          setStep({
            name: "identitas",
            mode: "baru",
          });

          return;
        }

        setError(result.error ?? "Presensi gagal disimpan.");

        return;
      }

      if (result.data.deviceToken) {
        saveDeviceToken(result.data.deviceToken);
      }

      setHasil(result.data);

      setStep({
        name: "berhasil",
      });
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Masuk ke flow
   * "Gunakan akun lain".
   */
  function handleGunakanAkunLain() {
    setNama("");
    setTanggalLahir("");
    setError("");

    setIdentityMode("akun-lain");

    setStep({
      name: "identitas",
      mode: "akun-lain",
    });
  }

  function handleBack() {
    setError("");

    if (step.name === "identitas") {
      /**
       * Jika berasal dari
       * "Gunakan akun lain",
       * kembali ke akun yang dikenal.
       */
      if (step.mode === "akun-lain") {
        setNama("");
        setTanggalLahir("");

        setStep({
          name: "akun-dikenal",
        });

        return;
      }

      setStep({
        name: "scan",
      });

      return;
    }

    if (step.name === "akun-dikenal") {
      reset();

      return;
    }

    reset();
  }

  return (
    <CheckinSteps
      step={step}
      nama={nama}
      tanggalLahir={tanggalLahir}
      kegiatan={kegiatan}
      hasil={hasil}
      namaDevice={namaDevice}
      error={error}
      loading={loading}
      onNamaChange={handleNamaChange}
      onTanggalLahirChange={handleTanggalLahirChange}
      onSubmitIdentity={handleSubmitIdentity}
      onPresensi={handlePresensi}
      onGunakanAkunLain={handleGunakanAkunLain}
      onScan={handleScan}
      onBack={handleBack}
      onReset={reset}
    />
  );
}
