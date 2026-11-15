"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { DashboardSummary } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          className="px-4 py-2 rounded-[8px] bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition-all"
        >
          Coba Muat Ulang
        </button>
      </div>
    );
  }

  if (!data) return null;

  const overdueCount = data.upcomingDeadlines.filter((t) => t.isOverdue).length;
  const dueSoonCount = data.upcomingDeadlines.filter((t) => t.isDueSoon).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* HERO BANNER CARD */}
      <div className="relative overflow-hidden rounded-[8px] border border-blue-100 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[8px] bg-blue-100/70 text-blue-700 text-xs font-semibold">
              Portal Akademik Mahasiswa
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Selamat Datang di Sistem MyTask
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pantau jadwal kuliah, target pengerjaan tugas, subtugas terperinci, dan tenggat waktu
              terdekat dalam satu ruang kerja yang terorganisir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/courses"
              className="px-4 py-2.5 rounded-[8px] bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
            >
              Kelola Mata Kuliah
            </Link>
            <Link
              href="/tasks"
              className="px-4 py-2.5 rounded-[8px] bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm"
            >
              + Tambah Tugas
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-blue-100/40 blur-2xl pointer-events-none" />
      </div>

      {/* METRIC STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Courses */}
        <div className="rounded-[8px] border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mata Kuliah
            </span>
            <span className="px-2 py-0.5 rounded-[8px] bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
              Aktif
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900">{data.totalCourses}</div>
            <div className="text-xs text-slate-500 mt-1">mata kuliah terdaftar</div>
          </div>
          <Link
            href="/courses"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
          >
            Lihat mata kuliah &rarr;
          </Link>
        </div>

        {/* Card 2: Total Tasks */}
        <div className="rounded-[8px] border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Tugas
            </span>
            <span className="px-2 py-0.5 rounded-[8px] bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200">
              Semua
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900">{data.totalTasks}</div>
            <div className="text-xs text-slate-500 mt-1">seluruh tugas tercatat</div>
          </div>
          <Link
            href="/tasks"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
          >
            Lihat seluruh tugas &rarr;
          </Link>
        </div>

        {/* Card 3: Pending Tasks */}
        <div className="rounded-[8px] border border-amber-200 bg-amber-50/30 p-5 flex flex-col justify-between hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Belum Selesai
            </span>
            <Badge variant="warning" size="sm" dot>
              {data.pendingTasks} Tugas
            </Badge>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-amber-900">{data.pendingTasks}</div>
            <div className="text-xs text-amber-700/80 mt-1">Todo / In Progress</div>
          </div>
          <Link
            href="/tasks?status=Todo"
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline inline-flex items-center gap-1"
          >
            Tinjau tugas pending &rarr;
          </Link>
        </div>

        {/* Card 4: Completed Tasks */}
        <div className="rounded-[8px] border border-emerald-200 bg-emerald-50/30 p-5 flex flex-col justify-between hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Selesai Dikerjakan
            </span>
            <Badge variant="success" size="sm" dot>
              Done
            </Badge>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-emerald-800">{data.completedTasks}</div>
            <div className="text-xs text-emerald-700/80 mt-1">tugas telah rampung</div>
          </div>
          <Link
            href="/tasks?status=Done"
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 hover:underline inline-flex items-center gap-1"
          >
            Tinjau riwayat selesai &rarr;
          </Link>
        </div>
      </div>

      {/* TWO COLUMN GRID: DEADLINES & PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COLUMN 1: UPCOMING DEADLINES */}
        <div className="rounded-[8px] border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Deadline Terdekat</h3>
                {(overdueCount > 0 || dueSoonCount > 0) && (
                  <span className="px-2 py-0.5 rounded-[8px] text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {overdueCount + dueSoonCount} Mendesak
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tugas aktif yang diurutkan berdasarkan tanggal tenggat terdekat
              </p>
            </div>
            <Link
              href="/deadlines"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Lihat Semua &rarr;
            </Link>
          </div>

          {data.upcomingDeadlines.length === 0 ? (
            <div className="p-8 rounded-[8px] text-center border border-dashed border-slate-200 text-xs text-slate-500">
              Tidak ada tugas yang menunggu deadline. Seluruh tugas telah selesai!
            </div>
          ) : (
            <div className="space-y-3">
              {data.upcomingDeadlines.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-[8px] border transition-all ${task.isOverdue
                      ? "border-rose-200 bg-rose-50/40 hover:bg-rose-50/60"
                      : task.isDueSoon
                        ? "border-amber-200 bg-amber-50/40 hover:bg-amber-50/60"
                        : "border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/80"
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-[8px] border border-blue-100">
                          {task.courseCode}
                        </span>
                        <span className="text-xs text-slate-500 truncate max-w-xs">
                          {task.courseName}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 hover:text-blue-600">
                        <Link href={`/tasks/${task.id}`}>{task.title}</Link>
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 self-start shrink-0">
                      {task.isOverdue ? (
                        <Badge variant="danger" size="sm" dot>
                          Terlewat {Math.abs(task.daysRemaining)} hari
                        </Badge>
                      ) : task.isDueSoon ? (
                        <Badge variant="warning" size="sm" dot>
                          {task.daysRemaining} hari lagi
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
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
                        {task.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span>Tenggat: {task.deadline}</span>
                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Buka Rincian &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMN 2: TASK PROGRESS OVERVIEW */}
        <div className="rounded-[8px] border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Progres Subtugas</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tingkat penyelesaian checklist per mata kuliah
              </p>
            </div>
            <Link
              href="/tasks"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Kelola Tugas &rarr;
            </Link>
          </div>

          {data.taskProgressList.length === 0 ? (
            <EmptyState
              title="Belum ada data tugas"
              description="Tambahkan tugas dan subtugas untuk mulai memantau persentase progres penyelesaian."
            />
          ) : (
            <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
              {data.taskProgressList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-[8px] border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/80 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-[8px] border border-blue-100">
                        {item.courseCode}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-800 hover:text-blue-600">
                        <Link href={`/tasks/${item.id}`}>{item.title}</Link>
                      </h4>
                    </div>
                    <Badge
                      variant={
                        item.status === "Done"
                          ? "success"
                          : item.status === "In Progress"
                            ? "primary"
                            : "neutral"
                      }
                      size="sm"
                      dot
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div className="pt-1">
                    <ProgressBar
                      percentage={item.progressPercentage}
                      totalSubtasks={item.totalSubtasks}
                      completedSubtasks={item.completedSubtasks}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
