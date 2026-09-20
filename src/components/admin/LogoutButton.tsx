'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '../../backend/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
        <path d="M8 3.5H4.5A1.5 1.5 0 0 0 3 5v10a1.5 1.5 0 0 0 1.5 1.5H8" strokeLinecap="round" />
        <path d="M11 6.5 14.5 10 11 13.5M7.5 10h7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <span>Keluar</span>
    </button>
  )
}
