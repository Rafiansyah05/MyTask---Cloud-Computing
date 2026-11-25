"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  User,
  BookOpen,
  ArrowRight,
  Pencil,
  Trash2,
  Eye,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Course, TaskWithDetails } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { ModalActions } from "@/components/ui/ModalActions";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";

type FormState = {
  courseCode: string;
  courseName: string;
  lecturer: string;
  semester: string;
};

const initialFormState: FormState = {
  courseCode: "",
  courseName: "",
  lecturer: "",
  semester: "Semester 5",
};

export default function CoursesPage() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form Modal (Add / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Detail Modal
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseTasks, setCourseTasks] = useState<TaskWithDetails[]>([]);
  const [loadingCourseTasks, setLoadingCourseTasks] = useState(false);

  // Delete Confirm Modal
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCourses();
      setCourses(res);
    } catch (err: any) {
      setError(err.message || "Gagal memuat daftar mata kuliah");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData(initialFormState);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode,
      courseName: course.courseName,
      lecturer: course.lecturer || "",
      semester: course.semester,
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openDetailModal = async (course: Course) => {
    setSelectedCourse(course);
    setLoadingCourseTasks(true);
    try {
      const tasks = await api.getTasks({ courseId: course.id });
      setCourseTasks(tasks);
    } catch {
      setCourseTasks([]);
    } finally {
      setLoadingCourseTasks(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.courseCode.trim()) {
      setFormError("Kode mata kuliah wajib diisi");
      return;
    }
    if (!formData.courseName.trim()) {
      setFormError("Nama mata kuliah wajib diisi");
      return;
    }
    if (!formData.semester.trim()) {
      setFormError("Semester wajib diisi");
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, formData);
        showToast({
          type: "success",
          message: "Mata kuliah berhasil diperbarui.",
        });
      } else {
        await api.createCourse(formData);
        showToast({
          type: "success",
          message: "Mata kuliah baru berhasil ditambahkan.",
        });
      }
      setIsFormModalOpen(false);
      await fetchCourses();
    } catch (err: any) {
      setFormError(err.message || "Gagal menyimpan mata kuliah");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteCourse(courseToDelete.id);
      showToast({
        type: "success",
        message: `Mata kuliah "${courseToDelete.courseName}" berhasil dihapus.`,
      });
      setCourseToDelete(null);
      await fetchCourses();
    } catch (err: any) {
      setError(err.message || "Gagal menghapus mata kuliah");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.courseCode.toLowerCase().includes(q) ||
      c.courseName.toLowerCase().includes(q) ||
      c.lecturer.toLowerCase().includes(q)
    );
  });

  const getMenuItems = (course: Course): DropdownMenuItem[] => [
    {
      label: "Lihat Tugas",
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: () => openDetailModal(course),
    },
    {
      label: "Edit Mata Kuliah",
      icon: <Pencil className="w-3.5 h-3.5" />,
      onClick: () => openEditModal(course),
    },
    {
      label: "Hapus",
      icon: <Trash2 className="w-3.5 h-3.5" />,
      variant: "danger",
      dividerBefore: true,
      onClick: () => setCourseToDelete(course),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode, nama mata kuliah, atau dosen..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
          />
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold transition-all shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2.2} />
          <span>Tambah Mata Kuliah</span>
        </button>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {loading ? (
        <LoadingState message="Memuat daftar mata kuliah..." />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title="Belum ada mata kuliah"
          description="Tambahkan mata kuliah semester ini untuk mulai mengelompokkan tugas perkuliahan."
          actionText="+ Tambah Mata Kuliah"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group relative bg-white rounded-2xl p-5 border border-slate-200/70 hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top row: Code Pill + Action Menu */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#EEF4FF] text-[#0066FF] text-xs font-bold font-mono">
                      {course.courseCode}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      {course.semester}
                    </span>
                  </div>

                  <DropdownMenu
                    items={getMenuItems(course)}
                    aria-label={`Menu ${course.courseName}`}
                  />
                </div>

                {/* Course Title & Lecturer */}
                <h3
                  onClick={() => openDetailModal(course)}
                  className="mt-3.5 text-base font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors cursor-pointer line-clamp-2"
                >
                  {course.courseName}
                </h3>

                <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {course.lecturer || "Dosen belum diisi"}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openDetailModal(course)}
                  className="text-xs font-semibold text-slate-600 hover:text-[#0066FF] inline-flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lihat Daftar Tugas</span>
                </button>

                <Link
                  href={`/tasks?courseId=${course.id}`}
                  className="text-xs font-semibold text-[#0066FF] hover:underline inline-flex items-center gap-1"
                >
                  <span>Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT COURSE MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingCourse ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru"}
        maxWidth="md"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kode Mata Kuliah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.courseCode}
                onChange={(e) =>
                  setFormData({ ...formData, courseCode: e.target.value })
                }
                placeholder="Contoh: CAK3EAB3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Semester <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
                placeholder="Contoh: Semester 5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Mata Kuliah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.courseName}
              onChange={(e) =>
                setFormData({ ...formData, courseName: e.target.value })
              }
              placeholder="Contoh: Komputasi Awan dan Terdistribusi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Dosen Pengampu
            </label>
            <input
              type="text"
              value={formData.lecturer}
              onChange={(e) =>
                setFormData({ ...formData, lecturer: e.target.value })
              }
              placeholder="Contoh: Dr. Eng. Ir. Budi Santoso, M.T."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            />
          </div>

          <ModalActions
            onCancel={() => setIsFormModalOpen(false)}
            confirmLabel={
              editingCourse ? "Simpan Perubahan" : "Tambah Mata Kuliah"
            }
            isLoading={formSubmitting}
          />
        </form>
      </Modal>

      {/* COURSE DETAIL MODAL */}
      <Modal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.courseName ?? "Detail Mata Kuliah"}
        maxWidth="lg"
      >
        {selectedCourse && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#EEF4FF] text-[#0066FF] text-xs font-bold font-mono">
                {selectedCourse.courseCode}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                {selectedCourse.semester}
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-[#EEF4FF] text-[#0066FF]">
                <User className="w-4 h-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-xs text-slate-500">Dosen Pengampu</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5 break-words">
                  {selectedCourse.lecturer || "-"}
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h4 className="text-sm font-bold text-slate-900">
                  Daftar Tugas ({courseTasks.length})
                </h4>
                <Link
                  href={`/tasks?courseId=${selectedCourse.id}`}
                  className="text-xs font-semibold text-[#0066FF] hover:underline"
                >
                  Kelola di Daftar Tugas &rarr;
                </Link>
              </div>

              {loadingCourseTasks ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Memuat daftar tugas...
                </div>
              ) : courseTasks.length === 0 ? (
                <div className="py-8 text-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  Belum ada tugas untuk mata kuliah ini.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {courseTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/70 hover:border-blue-200 hover:bg-[#EEF4FF]/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {task.title}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{task.deadline}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${
                          task.status === "Done"
                            ? "bg-emerald-50 text-emerald-700"
                            : task.status === "In Progress"
                            ? "bg-blue-50 text-[#0066FF]"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {task.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Mata Kuliah"
        message={`Apakah Anda yakin ingin menghapus mata kuliah "${courseToDelete?.courseName}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
}
