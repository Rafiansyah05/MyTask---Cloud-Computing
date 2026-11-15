"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { Course, TaskWithDetails, TaskPriority, TaskStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";

type TaskFormData = {
  courseId: string;
  title: string;
  description: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
};

const initialFormData: TaskFormData = {
  courseId: "",
  title: "",
  description: "",
  deadline: "",
  priority: "Medium",
  status: "Todo",
};

function TasksContent() {
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialPriority = searchParams.get("priority") || "";

  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters state
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedPriority, setSelectedPriority] = useState<string>(initialPriority);

  // Form Modal (Add / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithDetails | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirm Modal
  const [taskToDelete, setTaskToDelete] = useState<TaskWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [coursesData, tasksData] = await Promise.all([
        api.getCourses(),
        api.getTasks({
          courseId: selectedCourseId || undefined,
          status: selectedStatus || undefined,
          priority: selectedPriority || undefined,
        }),
      ]);
      setCourses(coursesData);
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data tugas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCourseId, selectedStatus, selectedPriority]);

  const openAddModal = () => {
    setEditingTask(null);
    setFormData({
      ...initialFormData,
      courseId: selectedCourseId || (courses.length > 0 ? courses[0].id : ""),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (task: TaskWithDetails) => {
    setEditingTask(task);
    setFormData({
      courseId: task.courseId,
      title: task.title,
      description: task.description || "",
      deadline: task.deadline,
      priority: task.priority,
      status: task.status,
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.courseId) {
      setFormError("Mata kuliah wajib dipilih");
      return;
    }
    if (!formData.title.trim()) {
      setFormError("Judul tugas wajib diisi");
      return;
    }
    if (!formData.deadline) {
      setFormError("Deadline tugas wajib diisi");
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingTask) {
        await api.updateTask(editingTask.id, formData);
        setSuccessMsg(`Tugas "${formData.title}" berhasil diperbarui.`);
      } else {
        await api.createTask(formData);
        setSuccessMsg(`Tugas "${formData.title}" berhasil ditambahkan.`);
      }
      setIsFormModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Gagal menyimpan tugas");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      setIsDeleting(true);
      setError(null);
      await api.deleteTask(taskToDelete.id);
      setSuccessMsg(`Tugas "${taskToDelete.title}" beserta seluruh subtugasnya berhasil dihapus.`);
      setTaskToDelete(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Gagal menghapus tugas");
      setTaskToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSelectedCourseId("");
    setSelectedStatus("");
    setSelectedPriority("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Card */}
      <div className="rounded-[8px] border border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Daftar Tugas
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Tugas Perkuliahan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola target, subtugas checklist, serta evaluasi progres pengerjaan
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          disabled={courses.length === 0}
          className="px-4 py-2.5 rounded-[8px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <span>+</span>
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {courses.length === 0 && !loading && (
        <Alert
          type="warning"
          title="Mata Kuliah Belum Tersedia"
          message="Silakan buat minimal satu mata kuliah terlebih dahulu sebelum menambahkan tugas perkuliahan."
        />
      )}

      {/* Global Alerts */}
      {successMsg && (
        <Alert
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}
      {error && (
        <Alert
          type="error"
          title="Perhatian"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* FILTER BAR CARD */}
      <div className="rounded-[8px] border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Filter & Pencarian</span>
          {(selectedCourseId || selectedStatus || selectedPriority) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-blue-600 hover:underline text-xs"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Filter Course */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Mata Kuliah
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-[8px] border border-slate-200 text-xs font-medium bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="">Semua Mata Kuliah ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Status Tugas
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-[8px] border border-slate-200 text-xs font-medium bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="">Semua Status</option>
              <option value="Todo">Todo (Belum Mulai)</option>
              <option value="In Progress">In Progress (Dikerjakan)</option>
              <option value="Done">Done (Selesai)</option>
            </select>
          </div>

          {/* Filter Priority */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Prioritas
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-[8px] border border-slate-200 text-xs font-medium bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="">Semua Prioritas</option>
              <option value="High">Tinggi (High)</option>
              <option value="Medium">Sedang (Medium)</option>
              <option value="Low">Rendah (Low)</option>
            </select>
          </div>

          {/* Reset Filters button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full py-2 px-3 rounded-[8px] border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-600 transition-colors"
            >
              Bersihkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* TASK LIST CARDS */}
      {loading ? (
        <LoadingState message="Memuat daftar tugas..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="Tidak ada tugas ditemukan"
          description={
            selectedCourseId || selectedStatus || selectedPriority
              ? "Tidak ada tugas dengan kriteria filter yang Anda pilih. Coba sesuaikan filter."
              : "Belum ada tugas perkuliahan. Buat tugas baru untuk mulai mencatat target belajar."
          }
          actionText={
            selectedCourseId || selectedStatus || selectedPriority
              ? "Reset Filter"
              : "Tambah Tugas Baru"
          }
          onAction={
            selectedCourseId || selectedStatus || selectedPriority
              ? resetFilters
              : openAddModal
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1 text-xs text-slate-500">
            <span>Ditemukan {tasks.length} tugas</span>
            <span>Diurutkan berdasarkan deadline terdekat</span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-[8px] border border-slate-200 bg-white p-5 hover:border-blue-200 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left: Task Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-[8px] border border-blue-100">
                      {task.course ? `${task.course.courseCode} • ${task.course.courseName}` : "Mata Kuliah"}
                    </span>
                    <Badge
                      variant={
                        task.status === "Done"
                          ? "success"
                          : task.status === "In Progress"
                          ? "primary"
                          : "neutral"
                      }
                      size="sm"
                      dot
                    >
                      {task.status}
                    </Badge>
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

                  <div>
                    <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      <Link href={`/tasks/${task.id}`}>{task.title}</Link>
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>
                      Tenggat: <strong className="text-slate-800 font-semibold">{task.deadline}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Subtugas: {task.completedSubtasks} / {task.totalSubtasks} Selesai
                    </span>
                  </div>
                </div>

                {/* Middle: Progress Bar */}
                <div className="lg:w-64 space-y-1.5 bg-slate-50/70 p-3.5 rounded-[8px] border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-600 flex justify-between">
                    <span>Progres Pengerjaan</span>
                    {task.progressPercentage !== null && (
                      <span className="font-semibold text-blue-600">{task.progressPercentage}%</span>
                    )}
                  </div>
                  <ProgressBar
                    percentage={task.progressPercentage}
                    totalSubtasks={task.totalSubtasks}
                    completedSubtasks={task.completedSubtasks}
                    showText={false}
                  />
                  <div className="text-[11px] text-slate-400">
                    {task.totalSubtasks === 0
                      ? "Belum ada subtugas"
                      : `${task.completedSubtasks} dari ${task.totalSubtasks} checklist selesai`}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-[8px] bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                  >
                    Detail & Checklist
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEditModal(task)}
                    className="px-3 py-1.5 text-xs font-medium rounded-[8px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskToDelete(task)}
                    className="px-3 py-1.5 text-xs font-medium rounded-[8px] border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FORM MODAL: ADD / EDIT TASK */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingTask ? "Ubah Data Tugas" : "Tambah Tugas Baru"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mata Kuliah Terkait <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm font-medium bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Implementasi Route Handlers Next.js"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Tugas (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Rincian instruksi atau catatan pengerjaan tugas..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tenggat Waktu <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioritas
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as TaskPriority })
                }
                className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="Low">Low (Rendah)</option>
                <option value="Medium">Medium (Sedang)</option>
                <option value="High">High (Tinggi)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Tugas
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as TaskStatus })
                }
                className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="Todo">Todo (Belum Mulai)</option>
                <option value="In Progress">In Progress (Sedang Dikerjakan)</option>
                <option value="Done">Done (Selesai)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              disabled={formSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-[8px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-[8px] bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {formSubmitting ? "Menyimpan..." : editingTask ? "Simpan Perubahan" : "Tambah Tugas"}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        title="Hapus Tugas"
        message={`Apakah Anda yakin ingin menghapus tugas "${taskToDelete?.title}"? Seluruh subtugas yang ada pada tugas ini akan ikut terhapus secara permanen.`}
        confirmLabel="Ya, Hapus Tugas & Subtugas"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<LoadingState message="Memuat halaman tugas..." />}>
      <TasksContent />
    </Suspense>
  );
}
