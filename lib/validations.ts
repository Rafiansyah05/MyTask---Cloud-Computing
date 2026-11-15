import { TaskPriority, TaskStatus, SubtaskStatus } from "@/types";

export type ValidationError = {
  field?: string;
  message: string;
};

export function validateCourseInput(data: any): { isValid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { isValid: false, error: "Payload data tidak valid" };
  }

  const courseCode = typeof data.courseCode === "string" ? data.courseCode.trim() : "";
  const courseName = typeof data.courseName === "string" ? data.courseName.trim() : "";
  const semester = typeof data.semester === "string" ? data.semester.trim() : "";

  if (!courseCode) {
    return { isValid: false, error: "Kode mata kuliah wajib diisi" };
  }
  if (!courseName) {
    return { isValid: false, error: "Nama mata kuliah wajib diisi" };
  }
  if (!semester) {
    return { isValid: false, error: "Semester wajib diisi" };
  }

  return { isValid: true };
}

export function validateTaskInput(data: any): { isValid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { isValid: false, error: "Payload data tidak valid" };
  }

  const courseId = typeof data.courseId === "string" ? data.courseId.trim() : "";
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const deadline = typeof data.deadline === "string" ? data.deadline.trim() : "";
  const priority = data.priority;
  const status = data.status;

  if (!courseId) {
    return { isValid: false, error: "Mata kuliah wajib dipilih" };
  }
  if (!title) {
    return { isValid: false, error: "Judul tugas wajib diisi" };
  }
  if (!deadline) {
    return { isValid: false, error: "Tenggat waktu (deadline) wajib diisi" };
  }

  // Validate ISO date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(deadline) || isNaN(Date.parse(deadline))) {
    return { isValid: false, error: "Format deadline tidak valid (gunakan format YYYY-MM-DD)" };
  }

  const validPriorities: TaskPriority[] = ["Low", "Medium", "High"];
  if (priority && !validPriorities.includes(priority)) {
    return { isValid: false, error: "Prioritas harus salah satu dari: Low, Medium, High" };
  }

  const validStatuses: TaskStatus[] = ["Todo", "In Progress", "Done"];
  if (status && !validStatuses.includes(status)) {
    return { isValid: false, error: "Status harus salah satu dari: Todo, In Progress, Done" };
  }

  return { isValid: true };
}

export function validateSubtaskInput(data: any): { isValid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { isValid: false, error: "Payload data tidak valid" };
  }

  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title) {
    return { isValid: false, error: "Judul subtugas wajib diisi" };
  }

  const status = data.status;
  const validStatuses: SubtaskStatus[] = ["Todo", "Done"];
  if (status && !validStatuses.includes(status)) {
    return { isValid: false, error: "Status subtugas harus salah satu dari: Todo atau Done" };
  }

  return { isValid: true };
}
