"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import LogoutButton from "./LogoutButton";
import { createClient } from "../../backend/supabase/client";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="5" height="5" rx="1" />
        <rect x="12" y="3" width="5" height="5" rx="1" />
        <rect x="3" y="12" width="5" height="5" rx="1" />
        <rect x="12" y="12" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    label: "Generus",
    href: "/admin/mudamudi",
    icon: (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <circle cx="10" cy="6" r="3" />

        <path
          d="M4.5 17c.5-3 2.4-4.5 5.5-4.5s5 1.5 5.5 4.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Kegiatan",
    href: "/admin/kegiatan",
    icon: (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <rect x="3" y="4.5" width="14" height="12" rx="1.5" />

        <path d="M6.5 3v3M13.5 3v3M3 8h14" strokeLinecap="round" />
      </svg>
    ),
  },
];

const presensiSubmenu = [
  {
    label: "Monitoring",
    href: "/admin/presensi/monitoring",
  },
  {
    label: "Rekapitulasi",
    href: "/admin/presensi/rekapitulasi",
  },
];

type Account = {
  nama: string;
  email: string;
  desa: string | null;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={[
        "h-4 w-4 shrink-0 text-[#78827C]",
        "transition-transform duration-200",
        open ? "rotate-180 text-[#65B98A]" : "",
      ].join(" ")}
      aria-hidden="true"
    >
      <path
        d="m5.5 7.5 4.5 4.5 4.5-4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PresensiIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 3.5h7l3 3v10H5z" strokeLinejoin="round" />

      <path d="M12 3.5V7h3M7.5 10h5M7.5 13h5" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="10" cy="6.5" r="2.75" />

      <path
        d="M4.5 17c.55-3.05 2.4-4.75 5.5-4.75s4.95 1.7 5.5 4.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

function MenuLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const presensiActive = pathname.startsWith("/admin/presensi");

  const [presensiOpen, setPresensiOpen] = useState(presensiActive);

  useEffect(() => {
    if (presensiActive) {
      setPresensiOpen(true);
    }
  }, [presensiActive]);

  function isActive(href: string) {
    return href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);
  }

  return (
    <div className="space-y-1">
      {menuItems.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={[
              "group flex items-center gap-3 rounded-xl px-3 py-2.5",
              "text-[12px] font-medium transition-all duration-150",
              active
                ? "bg-[#287A50] text-white shadow-xs"
                : "text-[#A0ABA5] hover:bg-[#262D29] hover:text-white",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                "transition-colors",
                active
                  ? "bg-white/15 text-white"
                  : "text-[#78827C] group-hover:text-white",
              ].join(" ")}
            >
              {item.icon}
            </span>

            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* PRESENSI */}
      <div>
        <button
          type="button"
          onClick={() => setPresensiOpen((current) => !current)}
          aria-expanded={presensiOpen}
          className={[
            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
            "text-[12px] font-medium transition-all duration-150",
            presensiActive
              ? "bg-[#287A50] text-white shadow-xs"
              : "text-[#A0ABA5] hover:bg-[#262D29] hover:text-white",
          ].join(" ")}
        >
          <span
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
              "transition-colors",
              presensiActive
                ? "bg-white/15 text-white"
                : "text-[#78827C] group-hover:text-white",
            ].join(" ")}
          >
            <PresensiIcon />
          </span>

          <span className="flex-1 text-left">Presensi</span>

          <ChevronIcon open={presensiOpen} />
        </button>

        {presensiOpen && (
          <div className="ml-5 mt-1.5 space-y-1 border-l border-[#262D29] pl-3">
            {presensiSubmenu.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={[
                    "block rounded-lg px-3 py-2 text-[11px] font-medium",
                    "transition-colors",
                    active
                      ? "bg-[#262D29] text-[#65B98A] font-semibold"
                      : "text-[#8E9892] hover:bg-[#262D29] hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#287A50] text-[11px] font-bold tracking-tight text-white shadow-sm ring-1 ring-white/10">
        GN
      </div>

      <div className="min-w-0">
        <h1 className="truncate text-[14px] font-bold tracking-tight text-white">
          GENARA
        </h1>

        <p className="truncate text-[9px] font-medium leading-4 text-[#8E9892]">
          Generus Administrasi
        </p>

        <p className="truncate text-[9px] font-medium leading-3 text-[#8E9892]">
          dan Presensi
        </p>
      </div>
    </div>
  );
}

function AccountSection({
  account,
  onNavigate,
}: {
  account: Account;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const [accountOpen, setAccountOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  const profileActive = pathname.startsWith("/admin/profil");

  const accountLabel =
    account.nama.trim() ||
    (account.desa === null ? "Admin Daerah" : `Admin ${account.desa}`);

  const initials =
    accountLabel
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  useEffect(() => {
    if (!accountOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accountOpen]);

  function handleNavigate() {
    setAccountOpen(false);
    onNavigate?.();
  }

  return (
    <div ref={accountRef} className="relative border-t border-[#262D29] p-3">
      <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6B7570]">
        Akun
      </p>

      {/* ACCOUNT POPOVER */}
      {accountOpen && (
        <div
          className={[
            "absolute z-60",
            "bottom-3 left-full ml-2",
            "w-48",
            "md:bottom-3 md:left-full md:ml-2",
            "max-md:bottom-full max-md:left-3 max-md:right-3 max-md:mb-2 max-md:w-auto max-md:ml-0",
          ].join(" ")}
        >
          <div className="overflow-hidden rounded-xl border border-[#333C37] bg-[#262D29] p-1.5 shadow-2xl shadow-black/40">
            <Link
              href="/admin/profil"
              onClick={handleNavigate}
              className={[
                "group flex w-full items-center gap-2.5 rounded-lg",
                "px-2.5 py-2",
                "text-[11px] font-medium transition-colors",
                profileActive
                  ? "bg-[#287A50] text-white"
                  : "text-[#CAD3CE] hover:bg-[#181C1B] hover:text-white",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                  profileActive
                    ? "bg-white/20 text-white"
                    : "bg-[#181C1B] text-[#78827C] group-hover:text-white",
                ].join(" ")}
              >
                <ProfileIcon />
              </span>

              <span>Profil</span>
            </Link>

            <LogoutButton
              onCloseMenu={() => {
                setAccountOpen(false);
                onNavigate?.();
              }}
            />
          </div>
        </div>
      )}

      {/* ACCOUNT BUTTON */}
      <button
        type="button"
        onClick={() => setAccountOpen((current) => !current)}
        aria-expanded={accountOpen}
        aria-haspopup="menu"
        className={[
          "group flex w-full items-center gap-3 rounded-xl",
          "px-2.5 py-2.5 text-left transition-colors",
          accountOpen ? "bg-[#262D29]" : "hover:bg-[#262D29]",
        ].join(" ")}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#287A50] text-[10px] font-bold text-white shadow-xs">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-white">
            {accountLabel}
          </p>

          <p className="mt-0.5 truncate text-[9px] text-[#8E9892]">
            {account.email || "Akun administrator"}
          </p>
        </div>

        <ChevronIcon open={accountOpen} />
      </button>
    </div>
  );
}

function SidebarContent({
  account,
  onNavigate,
}: {
  account: Account;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[#181C1B]">
      <div className="border-b border-[#262D29] px-4 py-4">
        <Brand />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6B7570]">
          Menu Utama
        </p>

        <MenuLinks onNavigate={onNavigate} />
      </nav>

      <AccountSection account={account} onNavigate={onNavigate} />
    </div>
  );
}

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const [account, setAccount] = useState<Account>({
    nama: "",
    email: "",
    desa: null,
  });

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) {
        return;
      }

      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("nama, desa")
        .eq("id", user.id)
        .single();

      if (!mounted) {
        return;
      }

      setAccount({
        nama: profile?.nama ?? "",
        email: user.email ?? "",
        desa: profile?.desa ?? null,
      });
    }

    loadAccount();

    return () => {
      mounted = false;
    };
  }, []);

  function closeMobileMenu() {
    setIsOpen(false);
  }

  return (
    <>
      {/* MOBILE TOP BAR */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-[#262D29] bg-[#181C1B] px-4 md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Buka menu"
          className="relative z-50 flex h-8 w-8 items-center justify-center rounded-lg text-white transition hover:bg-[#262D29] active:bg-[#2D3530]"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13" strokeLinecap="round" />
          </svg>
        </button>

        <div className="ml-2.5 min-w-0">
          <p className="truncate text-[12px] font-bold text-white">
            GENARA
          </p>

          <p className="truncate text-[9px] text-[#8E9892]">
            Generus Administrasi & Presensi
          </p>
        </div>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-[#262D29] bg-[#181C1B] md:flex">
        <SidebarContent account={account} />
      </aside>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          <aside className="relative flex h-full w-72 flex-col bg-[#181C1B] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262D29] px-4 py-4">
              <Brand />

              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Tutup menu"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8E9892] transition hover:bg-[#262D29] hover:text-white"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5">
              <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6B7570]">
                Menu Utama
              </p>

              <MenuLinks onNavigate={closeMobileMenu} />
            </nav>

            <AccountSection account={account} onNavigate={closeMobileMenu} />
          </aside>
        </div>
      )}
    </>
  );
}
