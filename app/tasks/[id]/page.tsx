"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { TaskWithDetails, Subtask, TaskStatus, TaskPriority, Course } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id as string;

  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Subtask Add Form
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);

  // Subtask Edit
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState("");
  const [updatingSubtask, setUpdatingSubtask] = useState(false);

  // Subtask Delete
  const [subtaskToDelete, setSubtaskToDelete] = useState<Subtask | null>(null);
  const [deletingSubtask, setDeletingSubtask] = useState(false);

  // Task Edit Modal
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editTaskForm, setEditTaskForm] = useState({
    courseId: "",
    title: "",
    description: "",
    deadline: "",
    priority: "Medium" as TaskPriority,
    status: "Todo" as TaskStatus,
  });
  const [updatingTask, setUpdatingTask] = useState(false);

  // Task Delete Modal
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);

  const fetchTaskData = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      setError(null);
      const [taskRes, coursesRes] = await Promise.all([
        api.getTask(taskId),
        api.getCourses(),
      ]);
      setTask(taskRes);
      setCourses(coursesRes);
    } catch (err: any) {
      setError(err.message || "Gagal memuat detail tugas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [taskId]);

  // Handle direct task status change
  const handleTaskStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    try {
      const updated = await api.updateTask(task.id, { status: newStatus });
      setTask(updated);
      setSuccessMsg(`Status tugas diubah menjadi "${newStatus}".`);
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui status tugas");
    }
  };

  // Open Edit Task Modal
  const openEditTaskModal = () => {
    if (!task) return;
    setEditTaskForm({
      courseId: task.courseId,
      title: task.title,
      description: task.description || "",
      deadline: task.deadline,
      priority: task.priority,
      status: task.status,
    });
    setIsEditTaskModalOpen(true);
  };

  // Submit Edit Task
  const handleUpdateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    try {
      setUpdatingTask(true);
      const updated = await api.updateTask(task.id, editTaskForm);
      setTask(updated);
      setIsEditTaskModalOpen(false);
      setSuccessMsg("Informasi tugas berhasil diperbarui.");
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui tugas");
    } finally {
      setUpdatingTask(false);
    }
  };

  // Delete Parent Task
  const handleDeleteTask = async () => {
    if (!task) return;
    try {
      setDeletingTask(true);
      await api.deleteTask(task.id);
      router.push("/tasks");
    } catch (err: any) {
      setError(err.message || "Gagal menghapus tugas");
      setIsDeleteTaskOpen(false);
      setDeletingTask(false);
    }
  };

  // Add Subtask
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newSubtaskTitle.trim()) return;

    try {
      setAddingSubtask(true);
      await api.createSubtask(task.id, {
        title: newSubtaskTitle.trim(),
        status: "Todo",
      });
      setNewSubtaskTitle("");
      setSuccessMsg("Subtugas baru berhasil ditambahkan.");
      const refreshed = await api.getTask(task.id);
      setTask(refreshed);
    } catch (err: any) {
      setError(err.message || "Gagal menambahkan subtugas");
    } finally {
      setAddingSubtask(false);
    }
  };

  // Toggle Subtask Status (Todo <-> Done)
  const handleToggleSubtask = async (subtask: Subtask) => {
    if (!task) return;
    const nextStatus = subtask.status === "Done" ? "Todo" : "Done";
    try {
      await api.updateSubtask(subtask.id, { status: nextStatus });
      const refreshed = await api.getTask(task.id);
      setTask(refreshed);
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui status subtugas");
    }
  };

  // Open Edit Subtask
  const openEditSubtask = (subtask: Subtask) => {
    setEditingSubtask(subtask);
    setEditSubtaskTitle(subtask.title);
  };

  // Save Edit Subtask
  const handleSaveEditSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubtask || !task || !editSubtaskTitle.trim()) return;

    try {
      setUpdatingSubtask(true);
      await api.updateSubtask(editingSubtask.id, { title: editSubtaskTitle.trim() });
      setEditingSubtask(null);
      setSuccessMsg("Judul subtugas berhasil diperbarui.");
      const refreshed = await api.getTask(task.id);
      setTask(refreshed);
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui subtugas");
    } finally {
      setUpdatingSubtask(false);
    }
  };

  // Delete Subtask
  const handleDeleteSubtask = async () => {
    if (!subtaskToDelete || !task) return;
    try {
      setDeletingSubtask(true);
      await api.deleteSubtask(subtaskToDelete.id);
      setSubtaskToDelete(null);
      setSuccessMsg("Subtugas berhasil dihapus.");
      const refreshed = await api.getTask(task.id);
      setTask(refreshed);
    } catch (err: any) {
      setError(err.message || "Gagal menghapus subtugas");
      setSubtaskToDelete(null);
    } finally {
      setDeletingSubtask(false);
    }
  };

  if (loading) {
    return <LoadingState message="Memuat rincian detail tugas..." />;
  }

  if (error && !task) {
    return (
      <div className="space-y-4">
        <Alert type="error" title="Kesalahan" message={error} />
        <Link
          href="/tasks"
          className="inline-block px-4 py-2 rounded-[8px] bg-slate-900 text-white font-medium text-xs"
        >
          &larr; Kembali ke Daftar Tugas
        </Link>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Action Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span>&larr;</span>
          <span>Kembali ke Daftar Tugas</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openEditTaskModal}
            className="px-3.5 py-1.5 text-xs font-medium rounded-[8px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Ubah Tugas
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteTaskOpen(true)}
            className="px-3.5 py-1.5 text-xs font-medium rounded-[8px] border border-rose-200 bg-rose-50/60 text-rose-700 hover:bg-rose-100 transition-colors"
          >
            Hapus Tugas
          </button>
        </div>
      </div>

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

      {/* MAIN TASK DETAILS CARD */}
      <div className="rounded-[8px] border border-slate-200 bg-white p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-[8px] border border-blue-100">
              {task.course ? `${task.course.courseCode} • ${task.course.courseName}` : "Mata Kuliah"}
            </span>
            <Badge
              variant={
                task.priority === "High"
                  ? "danger"
                  : task.priority === "Medium"
                  ? "warning"
                  : "neutral"
              }
              size="md"
            >
              Prioritas {task.priority}
            </Badge>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{task.title}</h2>

          {task.description ? (
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/80 p-4 rounded-[8px] border border-slate-100">
              {task.description}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">Tidak ada catatan deskripsi tambahan.</p>
          )}
        </div>

        {/* METADATA CHIPS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-[8px] border border-slate-200 bg-slate-50/50">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Tenggat Waktu (Deadline)
            </span>
            <span className="text-sm font-bold text-slate-800">{task.deadline}</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Status Pengerjaan
            </span>
            <div className="inline-flex rounded-[8px] border border-slate-200 p-0.5 bg-white">
              {(["Todo", "In Progress", "Done"] as TaskStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleTaskStatusChange(st)}
                  className={`px-3 py-1 text-xs font-semibold rounded-[6px] transition-all ${
                    task.status === st
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Dibuat Pada
            </span>
            <span className="text-xs text-slate-600">
              {new Date(task.createdAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* PROGRESS BAR SECTION */}
        <div className="p-4 rounded-[8px] border border-blue-100 bg-blue-50/40 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-blue-900">
            <span>Tingkat Penyelesaian Subtugas</span>
            <span className="font-bold">
              {task.progressPercentage !== null ? `${task.progressPercentage}%` : "Belum Tersedia"}
            </span>
          </div>
          <ProgressBar
            percentage={task.progressPercentage}
            totalSubtasks={task.totalSubtasks}
            completedSubtasks={task.completedSubtasks}
            showText={true}
          />
        </div>
      </div>

      {/* SUBTASKS SECTION */}
      <div className="rounded-[8px] border border-slate-200 bg-white p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Daftar Subtugas ({task.subtasks.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pecah tugas besar menjadi langkah-langkah terukur. Status Todo / Done memengaruhi persentase progres.
          </p>
        </div>

        {/* ADD SUBTASK FORM */}
        <form onSubmit={handleAddSubtask} className="flex gap-2.5">
          <input
            type="text"
            required
            placeholder="Tambah subtugas baru... (Contoh: Menyiapkan rancangan UI)"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
          <button
            type="submit"
            disabled={addingSubtask || !newSubtaskTitle.trim()}
            className="px-4 py-2 rounded-[8px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-all disabled:opacity-50 shrink-0"
          >
            {addingSubtask ? "Menambah..." : "+ Tambah Subtugas"}
          </button>
        </form>

        {/* SUBTASKS LIST */}
        {task.subtasks.length === 0 ? (
          <div className="p-8 rounded-[8px] border border-dashed border-slate-200 text-center space-y-1">
            <span className="text-xs font-semibold text-slate-400 block uppercase">
              Belum Ada Subtugas
            </span>
            <p className="text-xs text-slate-500">
              Buat rincian langkah kerja menggunakan formulir di atas.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className={`p-3.5 rounded-[8px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  subtask.status === "Done"
                    ? "bg-slate-50/60 border-slate-200/60 text-slate-400"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Left: Checkmark & Title */}
                <div className="flex items-center gap-3 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(subtask)}
                    className={`h-5 w-5 rounded-[6px] border flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                      subtask.status === "Done"
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-slate-300 hover:border-blue-500 text-transparent"
                    }`}
                    title={subtask.status === "Done" ? "Batal Selesai" : "Tandai Selesai"}
                  >
                    ✓
                  </button>

                  <div className="space-y-0.5">
                    <span
                      onClick={() => handleToggleSubtask(subtask)}
                      className={`text-sm font-medium cursor-pointer select-none transition-all ${
                        subtask.status === "Done"
                          ? "line-through text-slate-400"
                          : "text-slate-800 hover:text-blue-600"
                      }`}
                    >
                      {subtask.title}
                    </span>
                    <div className="text-[11px] text-slate-400">
                      Status: {subtask.status}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(subtask)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-[8px] border transition-colors ${
                      subtask.status === "Done"
                        ? "border-amber-200 bg-amber-50/60 text-amber-700 hover:bg-amber-100"
                        : "border-emerald-200 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {subtask.status === "Done" ? "Batal" : "Selesai"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditSubtask(subtask)}
                    className="px-2.5 py-1 text-xs font-medium rounded-[8px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubtaskToDelete(subtask)}
                    className="px-2.5 py-1 text-xs font-medium rounded-[8px] border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT SUBTASK MODAL */}
      <Modal
        isOpen={!!editingSubtask}
        onClose={() => setEditingSubtask(null)}
        title="Ubah Judul Subtugas"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveEditSubtask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Subtugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editSubtaskTitle}
              onChange={(e) => setEditSubtaskTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingSubtask(null)}
              className="px-4 py-2 text-xs font-semibold rounded-[8px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updatingSubtask || !editSubtaskTitle.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-[8px] bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {updatingSubtask ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE SUBTASK MODAL */}
      <ConfirmModal
        isOpen={!!subtaskToDelete}
        onClose={() => setSubtaskToDelete(null)}
        onConfirm={handleDeleteSubtask}
        title="Hapus Subtugas"
        message={`Apakah Anda yakin ingin menghapus subtugas "${subtaskToDelete?.title}"?`}
        confirmLabel="Ya, Hapus Subtugas"
        isLoading={deletingSubtask}
      />

      {/* EDIT PARENT TASK MODAL */}
      <Modal
        isOpen={isEditTaskModalOpen}
        onClose={() => setIsEditTaskModalOpen(false)}
        title="Ubah Data Tugas"
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mata Kuliah Terkait <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={editTaskForm.courseId}
              onChange={(e) => setEditTaskForm({ ...editTaskForm, courseId: e.target.value })}
              className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm font-medium bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            >
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
              value={editTaskForm.title}
              onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Tugas
            </label>
            <textarea
              rows={3}
              value={editTaskForm.description}
              onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
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
                value={editTaskForm.deadline}
                onChange={(e) => setEditTaskForm({ ...editTaskForm, deadline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioritas
              </label>
              <select
                value={editTaskForm.priority}
                onChange={(e) =>
                  setEditTaskForm({ ...editTaskForm, priority: e.target.value as TaskPriority })
                }
                className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={editTaskForm.status}
                onChange={(e) =>
                  setEditTaskForm({ ...editTaskForm, status: e.target.value as TaskStatus })
                }
                className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditTaskModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-[8px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updatingTask}
              className="px-4 py-2 text-xs font-semibold rounded-[8px] bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {updatingTask ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE PARENT TASK MODAL */}
      <ConfirmModal
        isOpen={isDeleteTaskOpen}
        onClose={() => setIsDeleteTaskOpen(false)}
        onConfirm={handleDeleteTask}
        title="Hapus Tugas Ini"
        message={`Apakah Anda yakin ingin menghapus tugas "${task.title}" beserta seluruh subtugasnya?`}
        confirmLabel="Ya, Hapus Tugas"
        isLoading={deletingTask}
      />
    </div>
  );
}
