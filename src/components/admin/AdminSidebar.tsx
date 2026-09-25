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
    label: "Muda Mudi",
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
        "h-4 w-4 shrink-0 text-gray-400",
        "transition-transform duration-200",
        open ? "rotate-180 text-gray-500" : "",
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
              "group flex items-center gap-3 rounded-lg px-3 py-2.5",
              "text-[11px] font-medium transition-colors",
              active
                ? "bg-teal-50 text-teal-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                "transition-colors",
                active
                  ? "bg-white text-teal-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  : "text-gray-400 group-hover:text-gray-600",
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
            "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
            "text-[11px] font-medium transition-colors",
            presensiActive
              ? "bg-teal-50 text-teal-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
          ].join(" ")}
        >
          <span
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
              "transition-colors",
              presensiActive
                ? "bg-white text-teal-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                : "text-gray-400 group-hover:text-gray-600",
            ].join(" ")}
          >
            <PresensiIcon />
          </span>

          <span className="flex-1 text-left">Presensi</span>

          <ChevronIcon open={presensiOpen} />
        </button>

        {presensiOpen && (
          <div className="ml-5 mt-1 space-y-0.5 border-l border-gray-200 pl-3">
            {presensiSubmenu.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={[
                    "block rounded-md px-3 py-2 text-[11px] font-medium",
                    "transition-colors",
                    active
                      ? "bg-teal-50 text-teal-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
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
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-[11px] font-bold tracking-tight text-white shadow-sm">
        SK
      </div>

      <div className="min-w-0">
        <h1 className="truncate text-[14px] font-semibold tracking-tight text-gray-900">
          SIKEMA
        </h1>

        <p className="truncate text-[9px] leading-4 text-gray-500">
          Sistem Informasi Kegiatan
        </p>

        <p className="truncate text-[9px] leading-3 text-gray-500">
          dan Muda Mudi
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
    <div ref={accountRef} className="relative border-t border-gray-200 p-3">
      <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
        Akun
      </p>

      {/* ACCOUNT POPOVER */}
      {accountOpen && (
        <div
          className={[
            "absolute z-60",
            "bottom-3 left-full ml-2",
            "w-44",
            "md:bottom-3 md:left-full md:ml-2",
            "max-md:bottom-full max-md:left-3 max-md:right-3 max-md:mb-2 max-md:w-auto max-md:ml-0",
          ].join(" ")}
        >
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-gray-900/10">
            <Link
              href="/admin/profil"
              onClick={handleNavigate}
              className={[
                "group flex w-full items-center gap-2.5 rounded-lg",
                "px-2.5 py-2",
                "text-[11px] font-medium transition-colors",
                profileActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                  profileActive
                    ? "bg-white text-teal-700"
                    : "bg-gray-50 text-gray-400 group-hover:text-gray-600",
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
          "group flex w-full items-center gap-3 rounded-lg",
          "px-2.5 py-2.5 text-left transition-colors",
          accountOpen ? "bg-gray-50" : "hover:bg-gray-50",
        ].join(" ")}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[10px] font-semibold text-teal-700">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-gray-800">
            {accountLabel}
          </p>

          <p className="mt-0.5 truncate text-[9px] text-gray-400">
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
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-4">
        <Brand />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
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
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-gray-200 bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Buka menu"
          className="relative z-50 flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
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
          <p className="truncate text-[12px] font-semibold text-gray-900">
            SIKEMA
          </p>

          <p className="truncate text-[9px] text-gray-500">
            Panel Administrasi
          </p>
        </div>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <SidebarContent account={account} />
      </aside>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/20"
          />

          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
              <Brand />

              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Tutup menu"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-700 active:bg-gray-100"
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
              <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
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
