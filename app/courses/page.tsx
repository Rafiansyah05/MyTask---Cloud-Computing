"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Course, TaskWithDetails } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  // Dropdown menu state for action dots
  const [openMenuCourseId, setOpenMenuCourseId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuCourseId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

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
    } catch (err: any) {
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
        setSuccessMsg(`Mata kuliah "${formData.courseName}" berhasil diperbarui.`);
      } else {
        await api.createCourse(formData);
        setSuccessMsg(`Mata kuliah "${formData.courseName}" berhasil ditambahkan.`);
      }
      setIsFormModalOpen(false);
      await fetchCourses();
    } catch (err: any) {
      setFormError(err.message || "Gagal menyimpan data mata kuliah");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      setIsDeleting(true);
      setError(null);
      await api.deleteCourse(courseToDelete.id);
      setSuccessMsg(`Mata kuliah "${courseToDelete.courseName}" berhasil dihapus.`);
      setCourseToDelete(null);
      await fetchCourses();
    } catch (err: any) {
      setError(err.message || "Gagal menghapus mata kuliah");
      setCourseToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="rounded-[8px] border border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Katalog Mata Kuliah
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daftar Mata Kuliah</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data mata kuliah semester ini beserta relasi tugas perkuliahan
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-[8px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Tambah Mata Kuliah</span>
        </button>
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

      {/* Course List Card / Table */}
      {loading ? (
        <LoadingState message="Memuat daftar mata kuliah..." />
      ) : courses.length === 0 ? (
        <EmptyState
          title="Belum ada mata kuliah"
          description="Tambahkan mata kuliah untuk mulai mengatur dan mendistribusikan tugas perkuliahan."
          actionText="Tambah Mata Kuliah Pertama"
          onAction={openAddModal}
        />
      ) : (
        <div className="rounded-[8px] border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                  <th className="p-4 w-14 text-center">No</th>
                  <th className="p-4 w-32">Kode MK</th>
                  <th className="p-4">Nama Mata Kuliah</th>
                  <th className="p-4">Dosen Pengampu</th>
                  <th className="p-4 w-32">Semester</th>
                  <th className="p-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course, index) => (
                  <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 text-center text-xs text-slate-400 font-medium">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-[8px] bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                        {course.courseCode}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-900">
                      <button
                        type="button"
                        onClick={() => openDetailModal(course)}
                        className="text-left hover:text-blue-600 hover:underline transition-colors font-semibold"
                      >
                        {course.courseName}
                      </button>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      {course.lecturer || <span className="text-slate-400 italic">Belum diisi</span>}
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      <span className="px-2 py-0.5 rounded-[8px] bg-slate-100 text-slate-700 border border-slate-200">
                        {course.semester}
                      </span>
                    </td>
                    <td className="p-4 text-center relative">
                      <div className="inline-block text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuCourseId(openMenuCourseId === course.id ? null : course.id);
                          }}
                          className="p-1.5 rounded-[8px] border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center justify-center"
                          aria-label="Opsi Aksi"
                          title="Menu Aksi"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {openMenuCourseId === course.id && (
                          <div
                            className="absolute right-4 mt-1.5 w-32 bg-white rounded-[8px] border border-slate-200 shadow-lg py-1 z-30 animate-in fade-in duration-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuCourseId(null);
                                openDetailModal(course);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors block"
                            >
                              Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuCourseId(null);
                                openEditModal(course);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors block"
                            >
                              Ubah
                            </button>
                            <div className="h-px bg-slate-100 my-1" />
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuCourseId(null);
                                setCourseToDelete(course);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors block"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT COURSE */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingCourse ? "Ubah Data Mata Kuliah" : "Tambah Mata Kuliah Baru"}
        maxWidth="md"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kode Mata Kuliah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: CAK3EAB3"
              value={formData.courseCode}
              onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
              className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Harus unik dan tidak boleh duplikat.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Mata Kuliah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Komputasi Awan dan Terdistribusi"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Dosen Pengampu (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Dr. Eng. Ir. Budi Santoso, M.T."
              value={formData.lecturer}
              onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
              className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Semester <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Semester 5"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="w-full px-3.5 py-2 rounded-[8px] border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
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
              {formSubmitting ? "Menyimpan..." : editingCourse ? "Simpan Perubahan" : "Tambah Mata Kuliah"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: DETAIL COURSE */}
      {selectedCourse && (
        <Modal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          title={`Detail Mata Kuliah: ${selectedCourse.courseCode}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-[8px] border border-slate-200 bg-slate-50/60">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Nama Mata Kuliah
                </span>
                <span className="text-base font-bold text-slate-900">{selectedCourse.courseName}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Kode Mata Kuliah
                </span>
                <span className="text-sm font-semibold text-blue-700">
                  {selectedCourse.courseCode}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Dosen Pengampu
                </span>
                <span className="text-sm text-slate-700">{selectedCourse.lecturer || "-"}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Semester
                </span>
                <span className="text-sm text-slate-700">{selectedCourse.semester}</span>
              </div>
            </div>

            {/* Linked Tasks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Daftar Tugas Terkait ({courseTasks.length})
                </h4>
                <Link
                  href={`/tasks?courseId=${selectedCourse.id}`}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Buka di Manajemen Tugas &rarr;
                </Link>
              </div>

              {loadingCourseTasks ? (
                <p className="text-xs text-slate-400">Memeriksa tugas...</p>
              ) : courseTasks.length === 0 ? (
                <div className="p-4 rounded-[8px] border border-dashed border-slate-200 text-center text-xs text-slate-500">
                  Belum ada tugas untuk mata kuliah ini.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {courseTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-[8px] border border-slate-200/80 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <Link
                          href={`/tasks/${t.id}`}
                          className="font-semibold text-sm text-slate-900 hover:text-blue-600 transition-colors block"
                        >
                          {t.title}
                        </Link>
                        <div className="text-xs text-slate-400">Tenggat: {t.deadline}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            t.status === "Done"
                              ? "success"
                              : t.status === "In Progress"
                              ? "primary"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {t.status}
                        </Badge>
                        <Link
                          href={`/tasks/${t.id}`}
                          className="px-2.5 py-1 text-xs font-medium rounded-[8px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        >
                          Detail
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 text-xs font-semibold rounded-[8px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleDeleteCourse}
        title="Hapus Mata Kuliah"
        message={`Apakah Anda yakin ingin menghapus mata kuliah "${courseToDelete?.courseName}" (${courseToDelete?.courseCode})? Mata kuliah tidak dapat dihapus bila masih memiliki tugas terkait.`}
        confirmLabel="Ya, Hapus Mata Kuliah"
        isLoading={isDeleting}
      />
    </div>
  );
}
