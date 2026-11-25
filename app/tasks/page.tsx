"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  CheckCircle2,
  Pencil,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Course, TaskWithDetails, TaskPriority, TaskStatus } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { ModalActions } from "@/components/ui/ModalActions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";
import { TaskBoard } from "@/components/tasks/TaskBoard";

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
  const router = useRouter();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";
  const initialPriority = searchParams.get("priority") || "";

  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);
  const [selectedPriority, setSelectedPriority] = useState<string>(initialPriority);
  const [searchQuery, setSearchQuery] = useState("");

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
  }, [selectedCourseId, selectedPriority]);

  const openAddModal = (defaultStatus: TaskStatus = "Todo") => {
    setEditingTask(null);
    setFormData({
      ...initialFormData,
      courseId: selectedCourseId || (courses.length > 0 ? courses[0].id : ""),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: defaultStatus,
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
      setFormError("Tanggal deadline wajib diisi");
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingTask) {
        await api.updateTask(editingTask.id, formData);
        showToast({ type: "success", message: "Tugas berhasil diperbarui." });
      } else {
        await api.createTask(formData);
        showToast({
          type: "success",
          message: "Tugas baru berhasil ditambahkan.",
        });
      }
      setIsFormModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan saat menyimpan tugas");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (
    task: TaskWithDetails,
    newStatus: TaskStatus
  ) => {
    if (task.status === newStatus) return;
    const prevStatus = task.status;

    // Optimistic update so drag-and-drop feels instant
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      await api.updateTask(task.id, { status: newStatus });
      showToast({
        type: "success",
        message: `Status "${task.title}" dipindahkan ke ${newStatus}.`,
      });
    } catch (err: any) {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: prevStatus } : t))
      );
      setError(err.message || "Gagal mengubah status tugas");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteTask(taskToDelete.id);
      showToast({
        type: "success",
        message: `Tugas "${taskToDelete.title}" berhasil dihapus.`,
      });
      setTaskToDelete(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Gagal menghapus tugas");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.course?.courseCode.toLowerCase().includes(q) ||
      t.course?.courseName.toLowerCase().includes(q)
    );
  });

  const getMenuItems = (task: TaskWithDetails): DropdownMenuItem[] => [
    {
      label: "Lihat Detail",
      icon: <ArrowRight className="w-3.5 h-3.5" />,
      onClick: () => router.push(`/tasks/${task.id}`),
    },
    {
      label: "Edit Tugas",
      icon: <Pencil className="w-3.5 h-3.5" />,
      onClick: () => openEditModal(task),
    },
    ...(["Todo", "In Progress", "Done"] as TaskStatus[])
      .filter((status) => status !== task.status)
      .map((status, index) => ({
        label: `Pindah ke ${status}`,
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        dividerBefore: index === 0,
        onClick: () => handleQuickStatusChange(task, status),
      })),
    {
      label: "Hapus Tugas",
      icon: <Trash2 className="w-3.5 h-3.5" />,
      variant: "danger",
      dividerBefore: true,
      onClick: () => setTaskToDelete(task),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* TOOLBAR / FILTER BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul tugas atau kode MK..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] focus:bg-white transition-all"
            />
          </div>

          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
          >
            <option value="">Semua Mata Kuliah</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode} — {c.courseName}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
          >
            <option value="">Semua Prioritas</option>
            <option value="High">Prioritas Tinggi</option>
            <option value="Medium">Prioritas Sedang</option>
            <option value="Low">Prioritas Rendah</option>
          </select>
        </div>

        <div className="flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={() => openAddModal("Todo")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2.2} />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {loading ? (
        <LoadingState message="Memuat papan tugas perkuliahan..." />
      ) : (
        <TaskBoard
          tasks={filteredTasks}
          getMenuItems={getMenuItems}
          onStatusChange={handleQuickStatusChange}
          onAddTask={openAddModal}
        />
      )}

      {/* ADD / EDIT TASK MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingTask ? "Edit Tugas" : "Tambah Tugas Baru"}
        maxWidth="md"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mata Kuliah <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.courseId}
              onChange={(e) =>
                setFormData({ ...formData, courseId: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} — {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Contoh: Implementasi REST API Cloud"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detail instruksi atau catatan tugas..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Prioritas
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as TaskStatus,
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <ModalActions
            onCancel={() => setIsFormModalOpen(false)}
            confirmLabel={editingTask ? "Simpan Perubahan" : "Tambah Tugas"}
            isLoading={formSubmitting}
          />
        </form>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Tugas"
        message={`Apakah Anda yakin ingin menghapus tugas "${taskToDelete?.title}"? Semua subtugas di dalamnya juga akan dihapus.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<LoadingState message="Menyiapkan Daftar Tugas..." />}>
      <TasksContent />
    </Suspense>
  );
}
