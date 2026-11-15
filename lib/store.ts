import { Course, Task, Subtask, TaskWithDetails, DashboardSummary, UpcomingDeadlineTask } from "@/types";
import { initialCourses, initialTasks, initialSubtasks } from "./seed";
import crypto from "crypto";

class MemoryStore {
  private courses: Course[] = [];
  private tasks: Task[] = [];
  private subtasks: Subtask[] = [];

  constructor() {
    this.init();
  }

  public init() {
    // Deep clone initial seed data to prevent mutations to base seed objects
    this.courses = JSON.parse(JSON.stringify(initialCourses));
    this.tasks = JSON.parse(JSON.stringify(initialTasks));
    this.subtasks = JSON.parse(JSON.stringify(initialSubtasks));
  }

  // ================= COURSES =================
  public getCourses(): Course[] {
    return [...this.courses].sort((a, b) => a.courseCode.localeCompare(b.courseCode));
  }

  public getCourseById(id: string): Course | null {
    const course = this.courses.find((c) => c.id === id);
    return course ? { ...course } : null;
  }

  public getCourseByCode(code: string): Course | null {
    const cleanCode = code.trim().toLowerCase();
    const course = this.courses.find((c) => c.courseCode.trim().toLowerCase() === cleanCode);
    return course ? { ...course } : null;
  }

  public createCourse(payload: {
    courseCode: string;
    courseName: string;
    lecturer?: string;
    semester: string;
  }): { success: boolean; data?: Course; error?: string; status?: number } {
    const trimmedCode = payload.courseCode.trim();
    if (this.getCourseByCode(trimmedCode)) {
      return {
        success: false,
        error: `Kode mata kuliah "${trimmedCode}" sudah terdaftar. Gunakan kode yang unik.`,
        status: 409,
      };
    }

    const now = new Date().toISOString();
    const newCourse: Course = {
      id: `course-${crypto.randomUUID()}`,
      courseCode: trimmedCode.toUpperCase(),
      courseName: payload.courseName.trim(),
      lecturer: payload.lecturer ? payload.lecturer.trim() : "",
      semester: payload.semester.trim(),
      createdAt: now,
      updatedAt: now,
    };

    this.courses.push(newCourse);
    return { success: true, data: { ...newCourse }, status: 201 };
  }

  public updateCourse(
    id: string,
    payload: {
      courseCode?: string;
      courseName?: string;
      lecturer?: string;
      semester?: string;
    }
  ): { success: boolean; data?: Course; error?: string; status?: number } {
    const index = this.courses.findIndex((c) => c.id === id);
    if (index === -1) {
      return { success: false, error: "Mata kuliah tidak ditemukan", status: 404 };
    }

    if (payload.courseCode) {
      const trimmedCode = payload.courseCode.trim();
      const existing = this.getCourseByCode(trimmedCode);
      if (existing && existing.id !== id) {
        return {
          success: false,
          error: `Kode mata kuliah "${trimmedCode}" sudah digunakan oleh mata kuliah lain.`,
          status: 409,
        };
      }
    }

    const current = this.courses[index];
    const updated: Course = {
      ...current,
      courseCode: payload.courseCode ? payload.courseCode.trim().toUpperCase() : current.courseCode,
      courseName: payload.courseName !== undefined ? payload.courseName.trim() : current.courseName,
      lecturer: payload.lecturer !== undefined ? payload.lecturer.trim() : current.lecturer,
      semester: payload.semester !== undefined ? payload.semester.trim() : current.semester,
      updatedAt: new Date().toISOString(),
    };

    this.courses[index] = updated;
    return { success: true, data: { ...updated }, status: 200 };
  }

  public deleteCourse(id: string): { success: boolean; error?: string; status?: number } {
    const course = this.getCourseById(id);
    if (!course) {
      return { success: false, error: "Mata kuliah tidak ditemukan", status: 404 };
    }

    // Business rule: Course with tasks cannot be deleted
    const hasTasks = this.tasks.some((t) => t.courseId === id);
    if (hasTasks) {
      return {
        success: false,
        error: "Mata kuliah tidak dapat dihapus karena masih memiliki tugas terkait. Hapus atau pindahkan tugas terlebih dahulu.",
        status: 409,
      };
    }

    this.courses = this.courses.filter((c) => c.id !== id);
    return { success: true, status: 200 };
  }

  // ================= TASKS =================
  public getTasks(filters?: { courseId?: string; status?: string; priority?: string }): TaskWithDetails[] {
    let result = [...this.tasks];

    if (filters?.courseId) {
      result = result.filter((t) => t.courseId === filters.courseId);
    }
    if (filters?.status) {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters?.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }

    // Map each task with course and subtasks information
    return result
      .map((t) => this.enrichTask(t))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }

  public getTaskById(id: string): TaskWithDetails | null {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return null;
    return this.enrichTask(task);
  }

  public createTask(payload: {
    courseId: string;
    title: string;
    description?: string;
    deadline: string;
    priority?: "Low" | "Medium" | "High";
    status?: "Todo" | "In Progress" | "Done";
  }): { success: boolean; data?: TaskWithDetails; error?: string; status?: number } {
    // Validate course exists
    const course = this.getCourseById(payload.courseId);
    if (!course) {
      return { success: false, error: "Mata kuliah terkait tidak ditemukan", status: 400 };
    }

    const now = new Date().toISOString();
    const newTask: Task = {
      id: `task-${crypto.randomUUID()}`,
      courseId: payload.courseId,
      title: payload.title.trim(),
      description: payload.description ? payload.description.trim() : "",
      deadline: payload.deadline.trim(),
      priority: payload.priority || "Medium",
      status: payload.status || "Todo",
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.push(newTask);
    return { success: true, data: this.enrichTask(newTask), status: 201 };
  }

  public updateTask(
    id: string,
    payload: {
      courseId?: string;
      title?: string;
      description?: string;
      deadline?: string;
      priority?: "Low" | "Medium" | "High";
      status?: "Todo" | "In Progress" | "Done";
    }
  ): { success: boolean; data?: TaskWithDetails; error?: string; status?: number } {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return { success: false, error: "Tugas tidak ditemukan", status: 404 };
    }

    if (payload.courseId) {
      const course = this.getCourseById(payload.courseId);
      if (!course) {
        return { success: false, error: "Mata kuliah terkait tidak ditemukan", status: 400 };
      }
    }

    const current = this.tasks[index];
    const updated: Task = {
      ...current,
      courseId: payload.courseId || current.courseId,
      title: payload.title !== undefined ? payload.title.trim() : current.title,
      description: payload.description !== undefined ? payload.description.trim() : current.description,
      deadline: payload.deadline !== undefined ? payload.deadline.trim() : current.deadline,
      priority: payload.priority || current.priority,
      status: payload.status || current.status,
      updatedAt: new Date().toISOString(),
    };

    this.tasks[index] = updated;
    return { success: true, data: this.enrichTask(updated), status: 200 };
  }

  public deleteTask(id: string): { success: boolean; error?: string; status?: number } {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return { success: false, error: "Tugas tidak ditemukan", status: 404 };
    }

    // Cascade delete: remove all subtasks belonging to this task
    this.subtasks = this.subtasks.filter((s) => s.taskId !== id);
    this.tasks.splice(index, 1);

    return { success: true, status: 200 };
  }

  // ================= SUBTASKS =================
  public getSubtasksByTaskId(taskId: string): Subtask[] {
    return this.subtasks
      .filter((s) => s.taskId === taskId)
      .map((s) => ({ ...s }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public getSubtaskById(id: string): Subtask | null {
    const subtask = this.subtasks.find((s) => s.id === id);
    return subtask ? { ...subtask } : null;
  }

  public createSubtask(
    taskId: string,
    payload: {
      title: string;
      status?: "Todo" | "Done";
    }
  ): { success: boolean; data?: Subtask; error?: string; status?: number } {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) {
      return { success: false, error: "Tugas induk tidak ditemukan", status: 404 };
    }

    const now = new Date().toISOString();
    const newSubtask: Subtask = {
      id: `subtask-${crypto.randomUUID()}`,
      taskId,
      title: payload.title.trim(),
      status: payload.status || "Todo",
      createdAt: now,
      updatedAt: now,
    };

    this.subtasks.push(newSubtask);
    return { success: true, data: { ...newSubtask }, status: 201 };
  }

  public updateSubtask(
    id: string,
    payload: {
      title?: string;
      status?: "Todo" | "Done";
    }
  ): { success: boolean; data?: Subtask; error?: string; status?: number } {
    const index = this.subtasks.findIndex((s) => s.id === id);
    if (index === -1) {
      return { success: false, error: "Subtugas tidak ditemukan", status: 404 };
    }

    const current = this.subtasks[index];
    const updated: Subtask = {
      ...current,
      title: payload.title !== undefined ? payload.title.trim() : current.title,
      status: payload.status || current.status,
      updatedAt: new Date().toISOString(),
    };

    this.subtasks[index] = updated;
    return { success: true, data: { ...updated }, status: 200 };
  }

  public deleteSubtask(id: string): { success: boolean; error?: string; status?: number } {
    const index = this.subtasks.findIndex((s) => s.id === id);
    if (index === -1) {
      return { success: false, error: "Subtugas tidak ditemukan", status: 404 };
    }

    this.subtasks.splice(index, 1);
    return { success: true, status: 200 };
  }

  // ================= DASHBOARD & DEADLINES =================
  public getDashboardSummary(): DashboardSummary {
    const totalCourses = this.courses.length;
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter((t) => t.status === "Done").length;
    const pendingTasks = totalTasks - completedTasks;

    const upcomingDeadlines = this.getUpcomingDeadlines();

    const taskProgressList = this.tasks.map((task) => {
      const course = this.courses.find((c) => c.id === task.courseId);
      const subtasks = this.subtasks.filter((s) => s.taskId === task.id);
      const totalSubtasks = subtasks.length;
      const completedSubtasks = subtasks.filter((s) => s.status === "Done").length;
      const progressPercentage =
        totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : null;

      return {
        id: task.id,
        title: task.title,
        courseCode: course ? course.courseCode : "-",
        status: task.status,
        totalSubtasks,
        completedSubtasks,
        progressPercentage,
      };
    });

    return {
      totalCourses,
      totalTasks,
      pendingTasks,
      completedTasks,
      upcomingDeadlines,
      taskProgressList,
    };
  }

  public getUpcomingDeadlines(): UpcomingDeadlineTask[] {
    const today = new Date();
    // Normalize to midnight UTC/local for clean day comparison
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    // Only tasks that are NOT "Done"
    const pendingTasks = this.tasks.filter((t) => t.status !== "Done");

    return pendingTasks
      .map((t) => {
        const course = this.courses.find((c) => c.id === t.courseId);
        const deadlineDate = new Date(t.deadline);
        const deadlineMidnight = new Date(
          deadlineDate.getFullYear(),
          deadlineDate.getMonth(),
          deadlineDate.getDate()
        ).getTime();

        const diffTime = deadlineMidnight - startOfToday;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const isOverdue = daysRemaining < 0;
        const isDueSoon = daysRemaining >= 0 && daysRemaining <= 3;

        return {
          ...t,
          courseName: course ? course.courseName : "Tidak diketahui",
          courseCode: course ? course.courseCode : "-",
          isOverdue,
          isDueSoon,
          daysRemaining,
        };
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }

  // ================= HELPER =================
  private enrichTask(task: Task): TaskWithDetails {
    const course = this.courses.find((c) => c.id === task.courseId);
    const subtasks = this.subtasks.filter((s) => s.taskId === task.id);
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter((s) => s.status === "Done").length;
    const progressPercentage =
      totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : null;

    return {
      ...task,
      course: course ? { ...course } : undefined,
      subtasks: subtasks.map((s) => ({ ...s })),
      totalSubtasks,
      completedSubtasks,
      progressPercentage,
    };
  }
}

// Global singleton pattern safe for Next.js hot reload
const globalForStore = globalThis as unknown as { memoryStore?: MemoryStore };

export const store = globalForStore.memoryStore ?? new MemoryStore();

if (process.env.NODE_ENV !== "production") {
  globalForStore.memoryStore = store;
}
