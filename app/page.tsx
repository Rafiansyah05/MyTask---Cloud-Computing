"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, Calendar, ArrowRight, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api-client";
import { DashboardSummary } from "@/types";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "all" | "deadlines">("active");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingState message="Menyiapkan ringkasan dashboard mahasiswa..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert type="error" title="Gagal Memuat" message={error} />
        <button
          onClick={fetchDashboard}
          className="px-4 py-2.5 rounded-xl bg-[#0066FF] text-white font-semibold text-xs hover:bg-[#0052CC] transition-all"
        >
          Coba Muat Ulang
        </button>
      </div>
    );
  }

  if (!data) return null;

  const query = searchQuery.trim().toLowerCase();

  const filteredTasks = data.taskProgressList.filter((task) => {
    if (activeTab === "active" && task.status === "Done") return false;
    if (!query) return true;
    return (
      task.title.toLowerCase().includes(query) ||
      task.courseCode.toLowerCase().includes(query)
    );
  });

  const filteredDeadlines = data.upcomingDeadlines.filter((item) => {
    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query) ||
      item.courseCode.toLowerCase().includes(query) ||
      item.courseName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-7 animate-fade-up">
      {/* 4 KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          href="/tasks"
          label="Belum Selesai"
          value={data.pendingTasks}
          description="Menunggu diselesaikan"
          tone="blue"
        />
        <StatCard
          href="/courses"
          label="Mata Kuliah"
          value={data.totalCourses}
          description="Mata kuliah terdaftar"
          tone="yellow"
        />
        <StatCard
          href="/tasks"
          label="Total Tugas"
          value={data.totalTasks}
          description="Seluruh tugas tercatat"
          tone="blue"
        />
        <StatCard
          href="/tasks?status=Done"
          label="Selesai"
          value={data.completedTasks}
          description="Sudah dituntaskan"
          tone="yellow"
        />
      </div>

      {/* TABS, SEARCH & PRIMARY CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6 border-b border-slate-200/70 md:border-b-0 pb-2 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`text-sm font-bold transition-colors ${
              activeTab === "active"
                ? "text-[#0066FF]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Progres Tugas & Subtugas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`text-sm font-bold transition-colors ${
              activeTab === "all"
                ? "text-[#0066FF]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua Tugas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("deadlines")}
            className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === "deadlines"
                ? "text-[#0066FF]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Tenggat Terdekat</span>
            {data.upcomingDeadlines.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#EEF4FF] text-[#0066FF]">
                {data.upcomingDeadlines.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas atau mata kuliah..."
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
            />
          </div>

          <Link
            href="/tasks"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold transition-all shrink-0"
          >
            <Plus className="w-4 h-4" strokeWidth={2.2} />
            <span>Buat Tugas Baru</span>
          </Link>
        </div>
      </div>

      {/* CONTENT GRID */}
      {activeTab === "deadlines" ? (
        filteredDeadlines.length === 0 ? (
          <EmptyState
            title="Tidak ada tenggat waktu aktif"
            description="Semua tugas sudah diselesaikan atau belum ada tugas yang cocok dengan pencarian."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredDeadlines.map((item) => (
              <Link
                key={item.id}
                href={`/tasks/${item.id}`}
                className="group rounded-2xl bg-white p-5 border border-slate-200/70 hover:border-blue-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {item.isOverdue ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[11px] font-semibold shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        Terlambat
                      </span>
                    ) : item.isDueSoon ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF08A] text-amber-900 text-[11px] font-semibold shrink-0">
                        <Clock className="w-3 h-3" />
                        Mendesak
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EEF4FF] text-[#0066FF] text-[11px] font-semibold shrink-0">
                        <Calendar className="w-3 h-3" />
                        {item.daysRemaining}h lagi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">
                    {item.courseName}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-[#EEF4FF] text-[#0066FF] text-[11px] font-semibold font-mono">
                    {item.courseCode}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {item.deadline}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="Belum ada tugas ditemukan"
          description="Coba ubah kata kunci pencarian atau tambahkan tugas baru di halaman Daftar Tugas."
          actionText="Buka Daftar Tugas"
          onAction={() => {
            window.location.href = "/tasks";
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTasks.map((task) => {
            const pct = task.progressPercentage ?? (task.status === "Done" ? 100 : 0);
            const isDone = task.status === "Done";
            return (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="group rounded-2xl bg-white p-5 border border-slate-200/70 hover:border-blue-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors line-clamp-1">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {task.totalSubtasks > 0
                      ? `${task.completedSubtasks} dari ${task.totalSubtasks} subtugas selesai`
                      : "Belum ada subtugas"}
                  </p>

                  {/* Progress Bar Row */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDone ? "bg-emerald-500" : "bg-[#0066FF]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-9 text-right tabular-nums">
                      {pct}%
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#EEF4FF] text-[#0066FF] text-[11px] font-semibold font-mono">
                      {task.courseCode}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 ${
                        task.status === "Done"
                          ? "bg-emerald-50 text-emerald-700"
                          : task.status === "In Progress"
                          ? "bg-blue-50 text-[#0066FF]"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {task.status === "Done" && <CheckCircle2 className="w-3 h-3" />}
                      {task.status}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-400 group-hover:text-[#0066FF] inline-flex items-center gap-1 transition-colors">
                    Detail
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
