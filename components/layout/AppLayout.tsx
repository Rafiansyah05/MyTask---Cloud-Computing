"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { name: "Dashboard", href: "/" },
  { name: "Mata Kuliah", href: "/courses" },
  { name: "Daftar Tugas", href: "/tasks" },
  { name: "Tenggat Waktu", href: "/deadlines" },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const getPageTitle = () => {
    if (pathname === "/") return "Ringkasan Akademik";
    if (pathname.startsWith("/courses")) return "Manajemen Mata Kuliah";
    if (pathname === "/tasks") return "Manajemen Tugas Perkuliahan";
    if (pathname.startsWith("/tasks/")) return "Detail Tugas & Subtugas";
    if (pathname.startsWith("/deadlines")) return "Tenggat Waktu & Jadwal";
    return "MyTask";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* TOP NAVBAR (NO SIDEBAR) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            {/* Left: Brand Logo */}
            <div className="flex items-center shrink-0 sm:w-48">
              <Link href="/" className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="MyTask Logo"
                  className="h-8 w-auto object-contain select-none"
                />
              </Link>
            </div>

            {/* Center: Desktop Nav Items (Perfect Center Alignment) */}
            <nav className="hidden md:flex items-center justify-center gap-1.5 absolute left-1/2 -translate-x-1/2">
              {navigationItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-all ${active
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                      }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Quick Action Button */}
            <div className="hidden sm:flex items-center justify-end gap-3 sm:w-48">
              <Link
                href="/tasks"
                className="px-3.5 py-1.5 rounded-[8px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
              >
                + Kelola Tugas
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-[8px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                aria-label="Menu Navigasi"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span
                    className={`h-0.5 w-full bg-current transition-all ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                      }`}
                  />
                  <span
                    className={`h-0.5 w-full bg-current transition-all ${mobileMenuOpen ? "opacity-0" : ""
                      }`}
                  />
                  <span
                    className={`h-0.5 w-full bg-current transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                      }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-1 animate-in fade-in duration-150">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-[8px] text-sm font-medium ${active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Status: In-Memory Storage</span>
              <span className="font-medium text-blue-600">Semester 5</span>
            </div>
          </div>
        )}
      </header>

      {/* SUB-HEADER / BANNER */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-white border-b border-slate-200/80 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-blue-700 mb-1">
              <span>MyTask</span>
              <span>/</span>
              <span className="text-slate-500">{getPageTitle()}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

    </div>
  );
};
