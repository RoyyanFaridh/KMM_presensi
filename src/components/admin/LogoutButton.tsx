"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../backend/supabase/client";

type Props = {
  onCloseMenu?: () => void;
};

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M8 3.5H4.5A1.5 1.5 0 0 0 3 5v10a1.5 1.5 0 0 0 1.5 1.5H8"
        strokeLinecap="round"
      />

      <path
        d="M11 6.5 14.5 10 11 13.5M7.5 10h7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LogoutButton({ onCloseMenu }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openConfirmation() {
    setError("");
    setIsOpen(true);
  }

  function closeConfirmation() {
    if (loading) {
      return;
    }

    setIsOpen(false);
    setError("");
  }

  async function handleLogout() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError("Gagal keluar. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    onCloseMenu?.();

    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={openConfirmation}
        className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-medium text-[#CAD3CE] transition-colors hover:bg-[#181C1B] hover:text-white"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#181C1B] text-[#78827C] transition-colors group-hover:text-red-400">
          <LogoutIcon />
        </span>

        <span>Keluar</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
          onClick={closeConfirmation}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 pb-4 pt-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M10 3.5 17 16.5H3L10 3.5Z"
                      strokeLinejoin="round"
                    />

                    <path d="M10 7.5v4M10 13.8h.01" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <h2 className="text-[13px] font-bold text-[#202824]">
                    Keluar dari akun?
                  </h2>

                  <p className="mt-1 text-[11px] leading-4 text-[#78827C]">
                    Anda akan keluar dari panel administrasi GENARA.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[10px] leading-4 text-red-600">
                  {error}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#E5EAE6] bg-[#F5F7F5] px-5 py-3.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeConfirmation}
                disabled={loading}
                className="h-9 w-full rounded-xl border border-[#E5EAE6] bg-white px-4 text-[11px] font-medium text-[#78827C] transition-colors hover:bg-gray-50 hover:text-[#202824] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="h-9 w-full rounded-xl bg-red-600 px-4 text-[11px] font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? "Keluar..." : "Ya, Keluar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
