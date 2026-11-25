"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  LayoutGrid,
  Calendar,
  Menu,
  X,
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Mata Kuliah", href: "/courses", icon: BookOpen },
  { name: "Daftar Tugas", href: "/tasks", icon: LayoutGrid },
  { name: "Tenggat Waktu", href: "/deadlines", icon: Calendar },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const getPageMeta = () => {
    if (pathname === "/") {
      return {
        title: "Ringkasan Akademik",
        subtitle: "Ringkasan mata kuliah, tugas aktif, dan progres pengerjaan",
      };
    }
    if (pathname.startsWith("/courses")) {
      return {
        title: "Manajemen Mata Kuliah",
        subtitle: "Kelola daftar mata kuliah dan dosen pengampu semester ini",
      };
    }
    if (pathname === "/tasks") {
      return {
        title: "Manajemen Tugas Perkuliahan",
        subtitle: "Kelola progres tugas dengan menggeser kartu antar status",
      };
    }
    if (pathname.startsWith("/tasks/")) {
      return {
        title: "Detail Tugas & Subtugas",
        subtitle: "Rincian tugas, subtugas, dan pembaruan status progres",
      };
    }
    if (pathname.startsWith("/deadlines")) {
      return {
        title: "Tenggat Waktu & Jadwal",
        subtitle: "Pantau jadwal pengumpulan dan prioritas deadline terdekat",
      };
    }
    return { title: "MyTask", subtitle: "Perencana Tugas Mahasiswa" };
  };

  const meta = getPageMeta();

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#040D1F] text-white select-none">
      {/* Brand Logo */}
      <div className="px-6 pt-7 pb-8 flex items-center justify-between">
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <img
              src="/icon-only.svg"
              alt=""
              aria-hidden="true"
              className="h-10 w-auto object-contain"
            />
            <span className="text-white font-bold text-[24px] tracking-tight leading-none">
              MyTask
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          aria-label="Tutup Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5">
        {navigationItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-[#0066FF] text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Workspace Info */}
      <div className="p-4 mt-auto">
        <div className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-xs font-bold shrink-0">
            RA
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              Mahasiswa Aktif
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Semester 5 • MyTask
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-900 flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 z-30">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-[#040D1F]/60 backdrop-blur-[3px] animate-backdrop-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 overflow-hidden rounded-r-3xl shadow-modal animate-drawer-in">
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-[#F5F7FB]/90 backdrop-blur-md">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50"
                aria-label="Buka Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                  {meta.title}
                </h1>
                <p className="hidden sm:block text-xs text-slate-500 truncate mt-0.5">
                  {meta.subtitle}
                </p>
              </div>
            </div>

            {/* Right User Avatar */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex w-10 h-10 rounded-full bg-[#0066FF] text-white items-center justify-center text-xs font-bold">
                RA
              </div>
            </div>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-8 pb-12 pt-2">
          {children}
        </main>
      </div>
    </div>
  );
};
