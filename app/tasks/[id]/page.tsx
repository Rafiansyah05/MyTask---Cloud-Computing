"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Pencil, Trash2, Plus } from "lucide-react";
import { api } from "@/lib/api-client";
import { TaskWithDetails, Subtask, TaskStatus, TaskPriority, Course } from "@/types";
import {
  computeDaysRemaining,
  formatRelativeDays,
  formatShortDate,
} from "@/lib/labels";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PriorityIndicator } from "@/components/ui/PriorityIndicator";
import { Modal } from "@/components/ui/Modal";
import { ModalActions } from "@/components/ui/ModalActions";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "Todo", label: "Todo" },
  { value: "In Progress", label: "In Progress" },
  { value: "Done", label: "Done" },
];

const cardStyle = "rounded-3xl border border-slate-200/70 bg-white";

const subtaskActionStyle =
  "inline-flex items-center justify-center w-9 h-11 sm:w-8 sm:h-8 rounded-lg text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export default function TaskDetailPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams();
  const taskId = params?.id as string;

  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleTaskStatusChange = async (newStatus: TaskStatus) => {
    if (!task || task.status === newStatus) return;
    try {
      const updated = await api.updateTask(task.id, { status: newStatus });
      setTask(updated);
      showToast({ type: "success", message: `Status tugas diubah menjadi "${newStatus}".` });
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui status tugas");
    }
  };

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

  const handleUpdateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    try {
      setUpdatingTask(true);
      const updated = await api.updateTask(task.id, editTaskForm);
      setTask(updated);
      setIsEditTaskModalOpen(false);
      showToast({ type: "success", message: "Informasi tugas berhasil diperbarui." });
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui tugas");
    } finally {
      setUpdatingTask(false);
    }
  };

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

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newSubtaskTitle.trim()) return;
    try {
      setAddingSubtask(true);
      await api.createSubtask(task.id, { title: newSubtaskTitle.trim(), status: "Todo" });
      setNewSubtaskTitle("");
      showToast({ type: "success", message: "Subtugas baru berhasil ditambahkan." });
      const refreshed = await api.getTask(task.id);
      setTask(refreshed);
    } catch (err: any) {
      setError(err.message || "Gagal menambahkan subtugas");
    } finally {
      setAddingSubtask(false);
    }
  };

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

  const openEditSubtask = (subtask: Subtask) => {
    setEditingSubtask(subtask);
    setEditSubtaskTitle(subtask.title);
  };

  const handleSaveEditSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubtask || !task || !editSubtaskTitle.trim()) return;
    try {
      setUpdatingSubtask(true);
      await api.updateSubtask(editingSubtask.id, { title: editSubtaskTitle.trim() });
      setEditingSubtask(null);
      showToast({ type: "success", message: "Judul subtugas berhasil diperbarui." });
      const refreshed = await api.getTask(task.id);
      setTask(refreshed);
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui subtugas");
    } finally {
      setUpdatingSubtask(false);
    }
  };

  const handleDeleteSubtask = async () => {
    if (!subtaskToDelete || !task) return;
    try {
      setDeletingSubtask(true);
      await api.deleteSubtask(subtaskToDelete.id);
      setSubtaskToDelete(null);
      showToast({ type: "success", message: "Subtugas berhasil dihapus." });
      const refreshed = await api.getTask(task.id);
      setTask(refreshed);
    } catch (err: any) {
      setError(err.message || "Gagal menghapus subtugas");
      setSubtaskToDelete(null);
    } finally {
      setDeletingSubtask(false);
    }
  };

  if (loading) return <LoadingState message="Memuat rincian detail tugas..." />;

  if (error && !task) {
    return (
      <div className="space-y-4">
        <Alert type="error" title="Kesalahan" message={error} />
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066FF] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Daftar Tugas
        </Link>
      </div>
    );
  }

  if (!task) return null;

  const days = computeDaysRemaining(task.deadline + "T00:00:00");
  const isOverdue = task.status !== "Done" && days < 0;
  const isDueSoon = task.status !== "Done" && days >= 0 && days <= 3;

  return (
    <div className="space-y-5 animate-fade-up">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1.5 py-1 text-xs font-semibold text-slate-500 hover:text-[#0066FF] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Daftar Tugas
      </Link>

      {error && (
        <Alert type="error" title="Perhatian" message={error} onClose={() => setError(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-[auto_1fr] gap-6 items-start">
        <section className={`${cardStyle} lg:col-start-1 p-5 sm:p-8`}>
          {task.course && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#EEF4FF] text-[#0066FF] text-xs font-bold font-mono">
                {task.course.courseCode}
              </span>
              <span className="text-sm text-slate-500">{task.course.courseName}</span>
            </div>
          )}
          <h2 className="mt-5 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight break-words">
            {task.title}
          </h2>
          <p className="mt-4 max-w-[70ch] text-sm leading-7 text-slate-600 whitespace-pre-line break-words">
            {task.description || "Tidak ada deskripsi tambahan."}
          </p>
        </section>

        <aside
          className={`${cardStyle} lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24 p-5 sm:p-6 space-y-7`}
        >
          <div>
            <h3 className="mb-2.5 text-xs text-slate-500">Status Pengerjaan</h3>
            <SegmentedControl
              aria-label="Status pengerjaan"
              className="w-full"
              options={STATUS_OPTIONS}
              value={task.status}
              onChange={handleTaskStatusChange}
            />
          </div>

          <dl className="grid grid-cols-2 lg:grid-cols-1 gap-6">
            <div>
              <dt className="text-xs text-slate-500">Tenggat Waktu</dt>
              <dd
                className={`mt-1.5 text-sm font-semibold ${
                  isOverdue ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {formatShortDate(task.deadline)}
              </dd>
              {task.status !== "Done" && (
                <dd
                  className={`mt-0.5 text-xs ${
                    isOverdue
                      ? "text-rose-600"
                      : isDueSoon
                      ? "text-amber-700"
                      : "text-slate-500"
                  }`}
                >
                  {formatRelativeDays(days)}
                </dd>
              )}
            </div>
            <div>
              <dt className="text-xs text-slate-500">Prioritas</dt>
              <dd className="mt-1.5">
                <PriorityIndicator priority={task.priority} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Dibuat Pada</dt>
              <dd className="mt-1.5 text-sm font-semibold text-slate-900">
                {formatShortDate(task.createdAt)}
              </dd>
            </div>
          </dl>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={openEditTaskModal}
              className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Pencil className="w-3.5 h-3.5" />
              Ubah Tugas
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteTaskOpen(true)}
              aria-label="Hapus Tugas"
              title="Hapus Tugas"
              className="inline-flex items-center justify-center w-11 min-h-[44px] rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </aside>

        <section className={`${cardStyle} lg:col-start-1 p-5 sm:p-8`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900">Subtugas</h3>
            {task.totalSubtasks > 0 && (
              <span className="text-xs text-slate-500 tabular-nums">
                {task.completedSubtasks} dari {task.totalSubtasks} selesai
              </span>
            )}
          </div>

          {task.subtasks.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Belum ada subtugas. Pecah tugas ini menjadi langkah-langkah kecil.
            </p>
          ) : (
            <>
              <ProgressBar
                className="mt-4"
                percentage={task.progressPercentage}
                totalSubtasks={task.totalSubtasks}
                completedSubtasks={task.completedSubtasks}
                showText={false}
              />
              <ul className="mt-4 -mx-3 space-y-1">
                {task.subtasks.map((subtask) => {
                  const isDone = subtask.status === "Done";
                  return (
                    <li
                      key={subtask.id}
                      className="group flex items-center gap-1 pr-1 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isDone}
                        onClick={() => handleToggleSubtask(subtask)}
                        className="flex flex-1 min-w-0 items-center gap-3.5 px-3 py-3.5 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <span
                          className={`flex items-center justify-center w-5 h-5 shrink-0 rounded-full border-2 transition-colors ${
                            isDone
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 text-transparent group-hover:border-[#0066FF]"
                          }`}
                        >
                          <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                        </span>
                        <span
                          className={`min-w-0 text-sm break-words ${
                            isDone ? "line-through text-slate-500" : "text-slate-800"
                          }`}
                        >
                          {subtask.title}
                        </span>
                      </button>
                      <div className="flex shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => openEditSubtask(subtask)}
                          aria-label={`Edit subtugas ${subtask.title}`}
                          title="Edit Subtugas"
                          className={`${subtaskActionStyle} hover:text-slate-700 hover:bg-slate-200/70`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubtaskToDelete(subtask)}
                          aria-label={`Hapus subtugas ${subtask.title}`}
                          title="Hapus Subtugas"
                          className={`${subtaskActionStyle} hover:text-rose-600 hover:bg-rose-50`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <form onSubmit={handleAddSubtask} className="mt-6 flex gap-2.5">
            <input
              type="text"
              required
              aria-label="Judul subtugas baru"
              placeholder="Tambah subtugas baru..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className="flex-1 min-w-0 h-11 px-4 rounded-xl border border-transparent bg-slate-100 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 focus:bg-white outline-none transition-all"
            />
            <button
              type="submit"
              disabled={addingSubtask || !newSubtaskTitle.trim()}
              className="inline-flex items-center gap-1.5 h-11 px-4 shrink-0 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" strokeWidth={2.2} />
              {addingSubtask ? "Menambah..." : "Tambah"}
            </button>
          </form>
        </section>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Judul Subtugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editSubtaskTitle}
              onChange={(e) => setEditSubtaskTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 focus:bg-white outline-none transition-all"
            />
          </div>

          <ModalActions
            onCancel={() => setEditingSubtask(null)}
            confirmLabel="Simpan Perubahan"
            isLoading={updatingSubtask}
            disabled={!editSubtaskTitle.trim()}
          />
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mata Kuliah Terkait <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={editTaskForm.courseId}
              onChange={(e) => setEditTaskForm({ ...editTaskForm, courseId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            >
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
              required
              value={editTaskForm.title}
              onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deskripsi Tugas
            </label>
            <textarea
              rows={3}
              value={editTaskForm.description}
              onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tenggat Waktu <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={editTaskForm.deadline}
                onChange={(e) => setEditTaskForm({ ...editTaskForm, deadline: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Prioritas
              </label>
              <select
                value={editTaskForm.priority}
                onChange={(e) =>
                  setEditTaskForm({ ...editTaskForm, priority: e.target.value as TaskPriority })
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
                value={editTaskForm.status}
                onChange={(e) =>
                  setEditTaskForm({ ...editTaskForm, status: e.target.value as TaskStatus })
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
            onCancel={() => setIsEditTaskModalOpen(false)}
            confirmLabel="Simpan Perubahan"
            isLoading={updatingTask}
          />
        </form>
      </Modal>

      {/* CONFIRM DELETE PARENT TASK MODAL */}
      <ConfirmModal
        isOpen={isDeleteTaskOpen}
        onClose={() => setIsDeleteTaskOpen(false)}
        onConfirm={handleDeleteTask}
        title="Hapus Tugas Ini"
        message={`Apakah Anda yakin ingin menghapus tugas "${task.title}" beserta seluruh subtugasnya? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Tugas"
        isLoading={deletingTask}
      />
    </div>
  );
}
