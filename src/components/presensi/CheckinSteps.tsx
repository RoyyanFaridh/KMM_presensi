"use client";

import CheckinIdentity from "./CheckinIdentity";
import CheckinKnownDevice from "./CheckinKnownDevice";
import CheckinScanner from "./CheckinScanner";
import CheckinSuccess from "./CheckinSuccess";

import { CheckinStepsProps } from "./CheckinTypes";

export type { ScannedKegiatan, Step } from "./CheckinTypes";

export default function CheckinSteps({
  step,
  nama,
  tanggalLahir,
  kegiatan,
  hasil,
  namaDevice,
  error,
  loading,
  onNamaChange,
  onTanggalLahirChange,
  onSubmitIdentity,
  onPresensi,
  onGunakanAkunLain,
  onScan,
  onBack,
  onReset,
}: CheckinStepsProps) {
  if (step.name === "scan") {
    return <CheckinScanner error={error} loading={loading} onScan={onScan} />;
  }

  if (step.name === "akun-dikenal") {
    return (
      <CheckinKnownDevice
        nama={namaDevice}
        kegiatan={kegiatan}
        error={error}
        loading={loading}
        onPresensi={onPresensi}
        onGunakanAkunLain={onGunakanAkunLain}
      />
    );
  }

  if (step.name === "identitas") {
    return (
      <CheckinIdentity
        nama={nama}
        tanggalLahir={tanggalLahir}
        error={error}
        loading={loading}
        onNamaChange={onNamaChange}
        onTanggalLahirChange={onTanggalLahirChange}
        onSubmit={onSubmitIdentity}
        onBack={onBack}
      />
    );
  }

  return <CheckinSuccess hasil={hasil} onReset={onReset} />;
}
