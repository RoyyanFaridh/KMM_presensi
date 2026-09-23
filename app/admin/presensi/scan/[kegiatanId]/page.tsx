"use client";

import { useParams } from "next/navigation";
import CheckinScanner from "../../../../../src/components/presensi/CheckinScanner";

export default function Page() {
  const params = useParams();
  const kegiatanId = Number(params.kegiatanId);

  if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-xs font-medium text-red-700">
              ID kegiatan tidak valid.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return <CheckinScanner kegiatanId={kegiatanId} />;
}