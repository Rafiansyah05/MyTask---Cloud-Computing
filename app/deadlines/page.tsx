"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { UpcomingDeadlineTask } from "@/types";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState<UpcomingDeadlineTask[]>([]);
  const [filterType, setFilterType] = useState<"all" | "overdue" | "dueSoon">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboard = await api.getDashboard();
      setDeadlines(dashboard.upcomingDeadlines);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data deadline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const filteredDeadlines = deadlines.filter((d) => {
    if (filterType === "overdue") return d.isOverdue;
    if (filterType === "dueSoon") return d.isDueSoon;
    return true;
  });

  const overdueCount = deadlines.filter((d) => d.isOverdue).length;
  const dueSoonCount = deadlines.filter((d) => d.isDueSoon).length;

  return (
    <div className="space-y-6 animate-fade-up">
      {error && <Alert type="error" title="Gagal Memuat" message={error} />}

      {/* 3 CLICKABLE KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          label="Total Tugas Aktif"
          value={deadlines.length}
          description="Menunggu penyelesaian"
          tone="blue"
          isActive={filterType === "all"}
          onClick={() => setFilterType("all")}
        />
        <StatCard
          label="Mendesak (≤ 3 Hari)"
          value={dueSoonCount}
          description="Perlu diprioritaskan segera"
          tone="yellow"
          isActive={filterType === "dueSoon"}
          onClick={() => setFilterType("dueSoon")}
        />
        <StatCard
          label="Lewat Deadline"
          value={overdueCount}
          description="Melewati tanggal tenggat"
          tone="red"
          isActive={filterType === "overdue"}
          onClick={() => setFilterType("overdue")}
        />
      </div>

      {/* FILTER PILLS */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "all", label: `Semua (${deadlines.length})` },
          { key: "dueSoon", label: `Mendesak (${dueSoonCount})` },
          { key: "overdue", label: `Terlambat (${overdueCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() =>
              setFilterType(tab.key as "all" | "overdue" | "dueSoon")
            }
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterType === tab.key
                ? "bg-[#0066FF] text-white"
                : "bg-white text-slate-600 border border-slate-200/80 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DEADLINES LIST */}
      {loading ? (
        <LoadingState message="Memuat jadwal tenggat waktu..." />
      ) : filteredDeadlines.length === 0 ? (
        <EmptyState
          title="Tidak ada tenggat waktu"
          description="Tidak ada tugas aktif yang cocok dengan kategori tenggat ini."
          actionText="Lihat Daftar Tugas"
          onAction={() => {
            window.location.href = "/tasks";
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDeadlines.map((item) => (
            <Link
              key={item.id}
              href={`/tasks/${item.id}`}
              className="group bg-white rounded-2xl p-5 border border-slate-200/70 hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#EEF4FF] text-[#0066FF] text-[11px] font-bold font-mono">
                    {item.courseCode}
                  </span>

                  {item.isOverdue ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold">
                      <AlertTriangle className="w-3 h-3" />
                      Terlambat {Math.abs(item.daysRemaining)}h
                    </span>
                  ) : item.isDueSoon ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFE600] text-slate-900 text-[11px] font-semibold">
                      <Clock className="w-3 h-3" />
                      {item.daysRemaining === 0
                        ? "Hari Ini"
                        : `${item.daysRemaining} Hari Lagi`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      <Calendar className="w-3 h-3" />
                      {item.daysRemaining} Hari Lagi
                    </span>
                  )}
                </div>

                <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                  {item.courseName}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {item.deadline}
                </span>
                <span className="font-semibold text-[#0066FF] inline-flex items-center gap-1">
                  Buka Tugas
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
