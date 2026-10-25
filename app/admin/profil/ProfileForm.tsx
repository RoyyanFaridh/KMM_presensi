"use client";

import { useState } from "react";
import { createClient } from "../../../src/backend/supabase/client";

type Profile = {
  id: string;
  nama: string;
  desa: string | null;
};

type Props = {
  user: {
    email: string;
  };
  profile: Profile;
};

export default function ProfileForm({ user, profile }: Props) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const [showPasswordLama, setShowPasswordLama] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const supabase = createClient();

  function openPasswordModal() {
    setPasswordError("");
    setPasswordMessage("");
    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasiPassword("");

    setShowPasswordLama(false);
    setShowPasswordBaru(false);
    setShowKonfirmasi(false);

    setShowPasswordModal(true);
  }

  function closePasswordModal() {
    if (passwordLoading) return;

    setShowPasswordModal(false);
    setPasswordError("");
    setPasswordMessage("");
    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasiPassword("");
  }

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");

    if (!passwordLama) {
      setPasswordError("Password lama wajib diisi.");
      return;
    }

    if (passwordBaru.length < 6) {
      setPasswordError("Password baru minimal 6 karakter.");
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      setPasswordError("Konfirmasi password tidak sesuai.");
      return;
    }

    if (passwordLama === passwordBaru) {
      setPasswordError("Password baru harus berbeda dari password lama.");
      return;
    }

    setPasswordLoading(true);

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser?.email) {
      setPasswordLoading(false);
      setPasswordError("Data akun tidak ditemukan.");
      return;
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: passwordLama,
    });

    if (verifyError) {
      setPasswordLoading(false);
      setPasswordError("Password lama tidak benar.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    setPasswordLoading(false);

    if (updateError) {
      setPasswordError("Password gagal diperbarui. Silakan coba lagi.");
      return;
    }

    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasiPassword("");

    setPasswordMessage("Password berhasil diperbarui.");

    setShowPasswordModal(false);
  }

  function PasswordToggle({
    visible,
    onClick,
    label,
  }: {
    visible: boolean;
    onClick: () => void;
    label: string;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 transition hover:text-gray-600"
        aria-label={label}
      >
        {visible ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 3 18 18" />
            <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
            <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 8.5 4 10 8a15.8 15.8 0 0 1-3.17 4.35" />
            <path d="M6.61 6.61C4.62 7.97 3.24 10 2 12c1.5 4 5 8 10 8a10.94 10.94 0 0 0 3.38-.54" />
          </svg>
        )}
      </button>
    );
  }

  function AccountRow({ label, value }: { label: string; value: string }) {
    return (
      <div className="flex items-start justify-between gap-6 border-b border-gray-100 py-4 last:border-0">
        <p className="w-28 shrink-0 text-[11px] font-medium text-gray-500">
          {label}
        </p>

        <p className="min-w-0 flex-1 wrap-break-word text-right text-[12px] font-medium text-gray-900">
          {value || "-"}
        </p>
      </div>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-0px)] items-start bg-gray-50 px-4 py-6 md:h-screen md:overflow-hidden md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
            Pengaturan
          </p>

          <h1 className="mt-1 text-lg font-semibold tracking-tight text-gray-900">
            Profil Admin
          </h1>

          <p className="mt-1 text-[11px] leading-5 text-gray-500">
            Kelola informasi akun dan password admin.
          </p>
        </div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Informasi Akun
                </h2>

                <p className="mt-1 text-[10px] text-gray-400">
                  Informasi akun yang terdaftar pada sistem SIKEMA.
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </div>
            </div>
          </div>

          <div className="px-5 py-2">
            <AccountRow label="Nama" value={profile.nama} />

            <AccountRow label="Email" value={user.email} />

            <AccountRow label="Wilayah" value={profile.desa ?? "Daerah"} />
          </div>

          <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-700">
                  Keamanan Akun
                </p>

                <p className="mt-0.5 text-[10px] text-gray-400">
                  Perbarui password secara berkala untuk menjaga keamanan akun.
                </p>
              </div>

              <button
                type="button"
                onClick={openPasswordModal}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-[11px] font-semibold text-white transition hover:bg-teal-700 active:bg-teal-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Ganti Password
              </button>
            </div>
          </div>

          {passwordMessage && (
            <div className="border-t border-gray-100 px-5 py-3">
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-[10px] font-medium text-green-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>

                {passwordMessage}
              </div>
            </div>
          )}
        </section>
      </div>

      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closePasswordModal}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Ganti Password
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-gray-400">
                  Masukkan password lama sebelum membuat password baru.
                </p>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                disabled={passwordLoading}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Tutup"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="space-y-4 px-5 py-5"
            >
              {passwordError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-[10px] leading-4 text-red-600">
                  {passwordError}
                </div>
              )}

              <div>
                <label
                  htmlFor="passwordLama"
                  className="mb-1.5 block text-[11px] font-medium text-gray-700"
                >
                  Password Lama
                </label>

                <div className="relative">
                  <input
                    id="passwordLama"
                    type={showPasswordLama ? "text" : "password"}
                    value={passwordLama}
                    onChange={(event) => setPasswordLama(event.target.value)}
                    disabled={passwordLoading}
                    autoComplete="current-password"
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 pr-10 text-[11px] text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 disabled:bg-gray-50"
                    placeholder="Masukkan password lama"
                  />

                  <PasswordToggle
                    visible={showPasswordLama}
                    onClick={() => setShowPasswordLama((value) => !value)}
                    label={
                      showPasswordLama
                        ? "Sembunyikan password lama"
                        : "Tampilkan password lama"
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="passwordBaru"
                  className="mb-1.5 block text-[11px] font-medium text-gray-700"
                >
                  Password Baru
                </label>

                <div className="relative">
                  <input
                    id="passwordBaru"
                    type={showPasswordBaru ? "text" : "password"}
                    value={passwordBaru}
                    onChange={(event) => setPasswordBaru(event.target.value)}
                    disabled={passwordLoading}
                    autoComplete="new-password"
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 pr-10 text-[11px] text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 disabled:bg-gray-50"
                    placeholder="Masukkan password baru"
                  />

                  <PasswordToggle
                    visible={showPasswordBaru}
                    onClick={() => setShowPasswordBaru((value) => !value)}
                    label={
                      showPasswordBaru
                        ? "Sembunyikan password baru"
                        : "Tampilkan password baru"
                    }
                  />
                </div>

                <p className="mt-1.5 text-[9px] text-gray-400">
                  Minimal 6 karakter.
                </p>
              </div>

              <div>
                <label
                  htmlFor="konfirmasiPassword"
                  className="mb-1.5 block text-[11px] font-medium text-gray-700"
                >
                  Konfirmasi Password Baru
                </label>

                <div className="relative">
                  <input
                    id="konfirmasiPassword"
                    type={showKonfirmasi ? "text" : "password"}
                    value={konfirmasiPassword}
                    onChange={(event) =>
                      setKonfirmasiPassword(event.target.value)
                    }
                    disabled={passwordLoading}
                    autoComplete="new-password"
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 pr-10 text-[11px] text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 disabled:bg-gray-50"
                    placeholder="Ulangi password baru"
                  />

                  <PasswordToggle
                    visible={showKonfirmasi}
                    onClick={() => setShowKonfirmasi((value) => !value)}
                    label={
                      showKonfirmasi
                        ? "Sembunyikan konfirmasi password"
                        : "Tampilkan konfirmasi password"
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={passwordLoading}
                  className="h-9 rounded-lg border border-gray-200 px-4 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="h-9 rounded-lg bg-teal-600 px-4 text-[11px] font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordLoading ? "Memproses..." : "Simpan Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
