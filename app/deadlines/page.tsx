"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { UpcomingDeadlineTask } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState<UpcomingDeadlineTask[]>([]);
  const [filterType, setFilterType] = useState<"all" | "overdue" | "dueSoon">("all");
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header Card */}
      <div className="rounded-[8px] border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Jadwal & Waktu
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tenggat Waktu (Upcoming Deadlines)</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Daftar seluruh tugas perkuliahan aktif yang belum selesai, diprioritaskan berdasarkan deadline terdekat
        </p>
      </div>

      {error && <Alert type="error" title="Gagal Memuat" message={error} />}

      {/* QUICK STATUS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterType("all")}
          className={`cursor-pointer p-5 rounded-[8px] border transition-all ${
            filterType === "all"
              ? "border-blue-300 bg-blue-50/50 shadow-xs"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Tugas Aktif
          </div>
          <div className="text-2xl font-bold text-slate-900 my-1">{deadlines.length}</div>
          <div className="text-xs text-slate-500">Menunggu penyelesaian</div>
        </div>

        <div
          onClick={() => setFilterType("dueSoon")}
          className={`cursor-pointer p-5 rounded-[8px] border transition-all ${
            filterType === "dueSoon"
              ? "border-amber-300 bg-amber-50/70 shadow-xs"
              : "border-amber-200/80 bg-amber-50/30 hover:border-amber-300"
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
            Mendesak (&le; 3 Hari)
          </div>
          <div className="text-2xl font-bold text-amber-900 my-1">{dueSoonCount}</div>
          <div className="text-xs text-amber-700/80">Perlu diprioritaskan segera</div>
        </div>

        <div
          onClick={() => setFilterType("overdue")}
          className={`cursor-pointer p-5 rounded-[8px] border transition-all ${
            filterType === "overdue"
              ? "border-rose-300 bg-rose-50/70 shadow-xs"
              : "border-rose-200/80 bg-rose-50/30 hover:border-rose-300"
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-800">
            Lewat Deadline (Terlambat)
          </div>
          <div className="text-2xl font-bold text-rose-900 my-1">{overdueCount}</div>
          <div className="text-xs text-rose-700/80">Melewati tanggal tenggat</div>
        </div>
      </div>

      {/* SEGMENTED FILTER PILLS */}
      <div className="flex flex-wrap items-center gap-2 rounded-[8px] border border-slate-200 bg-white p-2">
        <span className="text-xs font-semibold text-slate-500 px-2">Tampilkan:</span>
        <button
          type="button"
          onClick={() => setFilterType("all")}
          className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-all ${
            filterType === "all"
              ? "bg-blue-600 text-white shadow-xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          Semua ({deadlines.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("dueSoon")}
          className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-all ${
            filterType === "dueSoon"
              ? "bg-amber-600 text-white shadow-xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          Mendesak &le; 3 Hari ({dueSoonCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("overdue")}
          className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-all ${
            filterType === "overdue"
              ? "bg-rose-600 text-white shadow-xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          Lewat Deadline ({overdueCount})
        </button>
      </div>

      {/* DEADLINE LIST */}
      {loading ? (
        <LoadingState message="Memuat jadwal tenggat waktu..." />
      ) : filteredDeadlines.length === 0 ? (
        <EmptyState
          title="Tidak ada deadline pada kategori ini"
          description={
            filterType !== "all"
              ? "Tidak ada tugas dengan kriteria filter tersebut. Coba pilih 'Semua'."
              : "Selamat! Tidak ada tugas perkuliahan yang tertunda atau seluruh tugas telah selesai dikerjakan."
          }
          actionText={filterType !== "all" ? "Tampilkan Semua Deadline" : undefined}
          onAction={() => setFilterType("all")}
        />
      ) : (
        <div className="space-y-3">
          {filteredDeadlines.map((task) => (
            <div
              key={task.id}
              className={`p-5 rounded-[8px] border transition-all ${
                task.isOverdue
                  ? "border-rose-200 bg-rose-50/40 hover:bg-rose-50/60"
                  : task.isDueSoon
                  ? "border-amber-200 bg-amber-50/40 hover:bg-amber-50/60"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-[8px] border border-blue-100">
                      {task.courseCode} • {task.courseName}
                    </span>
                    {task.isOverdue ? (
                      <Badge variant="danger" size="md" dot>
                        Terlewat {Math.abs(task.daysRemaining)} Hari
                      </Badge>
                    ) : task.isDueSoon ? (
                      <Badge variant="warning" size="md" dot>
                        Mendesak ({task.daysRemaining} hari lagi)
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="md">
                        {task.daysRemaining} hari lagi
                      </Badge>
                    )}
                    <Badge
                      variant={
                        task.priority === "High"
                          ? "danger"
                          : task.priority === "Medium"
                          ? "warning"
                          : "neutral"
                      }
                      size="sm"
                    >
                      Prioritas {task.priority}
                    </Badge>
                    <Badge variant={task.status === "In Progress" ? "primary" : "neutral"} size="sm">
                      {task.status}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    <Link href={`/tasks/${task.id}`}>{task.title}</Link>
                  </h3>

                  {task.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                      Tanggal Tenggat
                    </div>
                    <div className="text-sm font-bold text-slate-800">{task.deadline}</div>
                  </div>

                  <Link
                    href={`/tasks/${task.id}`}
                    className="px-4 py-2 text-xs font-semibold rounded-[8px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
                  >
                    Buka Detail & Checklist &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
