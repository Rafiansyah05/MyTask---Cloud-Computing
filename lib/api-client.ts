import { Course, TaskWithDetails, Subtask, DashboardSummary } from "@/types";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = json?.error?.message || `Terjadi kesalahan (Status: ${res.status})`;
    throw new Error(errorMsg);
  }

  return json.data as T;
}

export const api = {
  // Dashboard
  getDashboard: () => fetcher<DashboardSummary>("/api/dashboard"),

  // Courses
  getCourses: () => fetcher<Course[]>("/api/courses"),
  getCourse: (id: string) => fetcher<Course>(`/api/courses/${id}`),
  createCourse: (data: { courseCode: string; courseName: string; lecturer?: string; semester: string }) =>
    fetcher<Course>("/api/courses", { method: "POST", body: JSON.stringify(data) }),
  updateCourse: (
    id: string,
    data: { courseCode?: string; courseName?: string; lecturer?: string; semester?: string }
  ) => fetcher<Course>(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCourse: (id: string) => fetcher<null>(`/api/courses/${id}`, { method: "DELETE" }),

  // Tasks
  getTasks: (filters?: { courseId?: string; status?: string; priority?: string }) => {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append("courseId", filters.courseId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);
    const queryString = params.toString();
    return fetcher<TaskWithDetails[]>(`/api/tasks${queryString ? `?${queryString}` : ""}`);
  },
  getTask: (id: string) => fetcher<TaskWithDetails>(`/api/tasks/${id}`),
  createTask: (data: {
    courseId: string;
    title: string;
    description?: string;
    deadline: string;
    priority?: string;
    status?: string;
  }) => fetcher<TaskWithDetails>("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (
    id: string,
    data: {
      courseId?: string;
      title?: string;
      description?: string;
      deadline?: string;
      priority?: string;
      status?: string;
    }
  ) => fetcher<TaskWithDetails>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTask: (id: string) => fetcher<null>(`/api/tasks/${id}`, { method: "DELETE" }),

  // Subtasks
  getSubtasks: (taskId: string) => fetcher<Subtask[]>(`/api/tasks/${taskId}/subtasks`),
  createSubtask: (taskId: string, data: { title: string; status?: string }) =>
    fetcher<Subtask>(`/api/tasks/${taskId}/subtasks`, { method: "POST", body: JSON.stringify(data) }),
  updateSubtask: (id: string, data: { title?: string; status?: string }) =>
    fetcher<Subtask>(`/api/subtasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSubtask: (id: string) => fetcher<null>(`/api/subtasks/${id}`, { method: "DELETE" }),
};
