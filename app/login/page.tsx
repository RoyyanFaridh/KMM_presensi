'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../src/backend/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError('Email atau password tidak valid.')
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white/45 shadow-[0_12px_40px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
          <div className="px-5 pb-5 pt-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
              SIKEMA
            </p>

            <h1 className="mt-1 text-lg font-semibold tracking-tight text-gray-900">
              Login Admin
            </h1>

            <p className="mt-1 text-[10px] leading-4 text-gray-400">
              Masuk untuk mengelola kegiatan, Muda Mudi,
              dan presensi.
            </p>
          </div>

          <div className="border-t border-gray-200/70" />

          <form
            onSubmit={handleLogin}
            className="space-y-3.5 bg-white/10 px-5 py-5"
          >
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50/80 px-3 py-2.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    d="M12 8v4M12 16h.01"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <p className="text-[10px] leading-4 text-red-600">
                  {error}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[10px] font-medium text-gray-600"
              >
                Email
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-3.5 w-3.5 text-gray-400"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                    <path
                      d="m3 7 9 6 9-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <input
                  id="email"
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  className="h-9 w-full rounded-lg border border-white/80 bg-white/50 pl-9 pr-3 text-[11px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-teal-300 focus:bg-white/70 focus:ring-2 focus:ring-teal-500/10"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[10px] font-medium text-gray-600"
              >
                Password
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-3.5 w-3.5 text-gray-400"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                    />
                    <path
                      d="M8 10V7a4 4 0 0 1 8 0v3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  className="h-9 w-full rounded-lg border border-gray-200/80 bg-white/60 pl-9 pr-9 text-[11px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-teal-300 focus:bg-white/80 focus:ring-2 focus:ring-teal-500/10"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 transition hover:text-gray-600"
                  aria-label={
                    showPassword
                      ? 'Sembunyikan password'
                      : 'Tampilkan password'
                  }
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 3l18 18"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.9 5.1A10.7 10.7 0 0 1 12 5c5 0 8.5 4.5 9.5 7a15.8 15.8 0 0 1 3.1 4.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.2 6.2C4.5 7.5 3.3 9.3 2.5 12c1 2.5 4.5 7 9.5 7 1 0 2-.2 2.9-.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-teal-600 text-[11px] font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="m10 17 5-5-5-5M15 12H3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          <div className="border-t border-gray-200/70 bg-white/30 px-5 py-3">
            <p className="text-center text-[9px] text-gray-400">
              Sistem Informasi Kegiatan dan Muda Mudi
            </p>
          </div>
        </div>

        <p className="mt-3 text-center text-[9px] text-gray-400">
          SIKEMA
        </p>
      </div>
    </main>
  )
}