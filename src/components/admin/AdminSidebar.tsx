"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

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
        <rect
          x="3"
          y="4.5"
          width="14"
          height="12"
          rx="1.5"
        />
        <path
          d="M6.5 3v3M13.5 3v3M3 8h14"
          strokeLinecap="round"
        />
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
      <path
        d="M5 3.5h7l3 3v10H5z"
        strokeLinejoin="round"
      />
      <path
        d="M12 3.5V7h3M7.5 10h5M7.5 13h5"
        strokeLinecap="round"
      />
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

function MenuLinks({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);
  }

  const presensiActive =
    pathname.startsWith("/admin/presensi");

  return (
    <div className="space-y-1">
      {menuItems.map((item) => {
        const active = isActive(item.href);

        const linkClassName = [
          "group flex items-center gap-3 rounded-lg px-3 py-2.5",
          "text-[11px] font-medium transition-colors",
          active
            ? "bg-teal-50 text-teal-700"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        ].join(" ");

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={linkClassName}
          >
            <span
              className={[
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
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

      <div>
        <Link
          href="/admin/presensi/monitoring"
          onClick={onNavigate}
          className={[
            "group flex items-center gap-3 rounded-lg px-3 py-2.5",
            "text-[11px] font-medium transition-colors",
            presensiActive
              ? "bg-teal-50 text-teal-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
          ].join(" ")}
        >
          <span
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
              presensiActive
                ? "bg-white text-teal-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                : "text-gray-400 group-hover:text-gray-600",
            ].join(" ")}
          >
            <PresensiIcon />
          </span>

          <span className="flex-1">Presensi</span>
        </Link>

        {presensiActive && (
          <div className="ml-5 mt-1 space-y-0.5 border-l border-gray-200 pl-3">
            {presensiSubmenu.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={[
                    "block rounded-md px-3 py-2 text-[11px] font-medium transition-colors",
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

function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const profileActive = pathname.startsWith("/admin/profil");

  return (
    <>
      <div className="border-b border-gray-200 px-4 py-4">
        <Brand />
      </div>

      <nav className="flex-1 px-3 py-5">
        <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
          Menu Utama
        </p>

        <MenuLinks onNavigate={onNavigate} />
      </nav>

      <div className="border-t border-gray-200 p-3">
        <div className="mb-2 px-2">
          <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-gray-400">
            Akun
          </p>
        </div>

        <Link
          href="/admin/profil"
          onClick={onNavigate}
          className={[
            "group mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5",
            "text-[11px] font-medium transition-colors",
            profileActive
              ? "bg-teal-50 text-teal-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
          ].join(" ")}
        >
          <span
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
              profileActive
                ? "bg-white text-teal-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                : "text-gray-400 group-hover:text-gray-600",
            ].join(" ")}
          >
            <ProfileIcon />
          </span>

          <span>Profil</span>
        </Link>

        <LogoutButton />
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
            <path
              d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13"
              strokeLinecap="round"
            />
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
        <SidebarContent />
      </aside>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/20"
          />

          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
              <Brand />

              <button
                type="button"
                onClick={() => setIsOpen(false)}
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
                  <path
                    d="m5 5 10 10M15 5 5 15"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-3 py-5">
              <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                Menu Utama
              </p>

              <MenuLinks
                onNavigate={() => setIsOpen(false)}
              />
            </nav>

            <div className="border-t border-gray-200 p-3">
              <div className="mb-2 px-2">
                <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-gray-400">
                  Akun
                </p>
              </div>

              <Link
                href="/admin/profil"
                onClick={() => setIsOpen(false)}
                className={[
                  "group mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5",
                  "text-[11px] font-medium transition-colors",
                  pathname.startsWith("/admin/profil")
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                    pathname.startsWith("/admin/profil")
                      ? "bg-white text-teal-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                      : "text-gray-400 group-hover:text-gray-600",
                  ].join(" ")}
                >
                  <ProfileIcon />
                </span>

                <span>Profil</span>
              </Link>

              <LogoutButton />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}