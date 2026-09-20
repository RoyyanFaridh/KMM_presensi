"use client";

import { useEffect, useRef, useState } from "react";

import CheckinStepIndicator from "./CheckinStepIndicator";

type Props = {
  error: string;
  loading: boolean;
  onScan: (kegiatanId: number) => void;
};

type Html5QrcodeInstance = import("html5-qrcode").Html5Qrcode;

let scannerTeardown: Promise<void> | null = null;

function QRScanner({ onScan }: { onScan: (kegiatanId: number) => void }) {
  const [scannerError, setScannerError] = useState("");

  const mountedRef = useRef(false);
  const handledRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    handledRef.current = false;

    let scanner: Html5QrcodeInstance | null = null;

    let startPromise: Promise<null> | null = null;

    let started = false;
    let cancelled = false;

    async function stopScanner() {
      if (!scanner) {
        return;
      }

      if (startPromise) {
        try {
          await startPromise;
        } catch {
          return;
        }
      }

      if (!started) {
        return;
      }

      try {
        await scanner.stop();
      } catch {}

      started = false;

      try {
        scanner.clear();
      } catch {}

      scanner = null;
      startPromise = null;
    }

    async function startScanner() {
      try {
        if (scannerTeardown) {
          await scannerTeardown;
        }

        if (cancelled || !mountedRef.current) {
          return;
        }

        const container = document.getElementById("sikema-qr-reader");

        if (!container) {
          return;
        }

        container.innerHTML = "";

        const { Html5Qrcode } = await import("html5-qrcode");

        if (cancelled || !mountedRef.current) {
          return;
        }

        scanner = new Html5Qrcode("sikema-qr-reader");

        startPromise = scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 10,
            qrbox: {
              width: 240,
              height: 240,
            },
          },
          async (decodedText) => {
            if (cancelled || !mountedRef.current || handledRef.current) {
              return;
            }

            const qrContent = decodedText.trim();

            console.log("QR Code terbaca:", qrContent);

            /*
             * Format QR yang valid:
             *
             * SIKEMA:PRESENSI:13
             */
            const match = qrContent.match(/^SIKEMA:PRESENSI:(\d+)$/);

            if (!match) {
              setScannerError(
                `QR Code tidak sesuai. Isi terbaca: "${qrContent}"`,
              );

              return;
            }

            const kegiatanId = Number(match[1]);

            if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
              setScannerError("ID kegiatan pada QR Code tidak valid.");

              return;
            }

            handledRef.current = true;

            setScannerError("");

            await stopScanner();

            if (cancelled || !mountedRef.current) {
              return;
            }

            onScan(kegiatanId);
          },
          () => {},
        );

        try {
          await startPromise;
        } catch {
          if (cancelled || !mountedRef.current) {
            return;
          }

          scanner = null;
          startPromise = null;

          setScannerError(
            "Kamera tidak dapat digunakan. Pastikan izin kamera telah diberikan.",
          );

          return;
        }

        if (cancelled || !mountedRef.current) {
          await stopScanner();
          return;
        }

        started = true;
      } catch {
        if (cancelled || !mountedRef.current) {
          return;
        }

        scanner = null;
        startPromise = null;

        setScannerError(
          "Kamera tidak dapat digunakan. Pastikan izin kamera telah diberikan.",
        );
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      handledRef.current = true;

      const teardown = stopScanner();

      scannerTeardown = teardown;

      teardown.finally(() => {
        if (scannerTeardown === teardown) {
          scannerTeardown = null;
        }
      });
    };
  }, [onScan]);

  return (
    <div>
      <div
        id="sikema-qr-reader"
        className="overflow-hidden rounded-xl border border-gray-200 bg-black"
      />

      {scannerError && (
        <p className="mt-3 text-center text-xs text-red-600">{scannerError}</p>
      )}
    </div>
  );
}

export default function CheckinScanner({ error, loading, onScan }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-teal-600">
            SIKEMA
          </p>

          <h1 className="mt-2 text-xl font-semibold text-gray-900">
            Presensi Kegiatan
          </h1>

          <p className="mt-2 text-xs leading-5 text-gray-500">
            Arahkan kamera ke QR Code yang ditampilkan pengurus.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <CheckinStepIndicator current={1} />

          <QRScanner onScan={onScan} />

          {loading && (
            <p className="mt-3 text-center text-[10px] text-gray-500">
              Memproses presensi...
            </p>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-[10px] text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
