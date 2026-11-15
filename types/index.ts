export type Course = {
  id: string;
  courseCode: string;
  courseName: string;
  lecturer: string;
  semester: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskStatus = "Todo" | "In Progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export type Task = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  deadline: string; // ISO date: YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type SubtaskStatus = "Todo" | "Done";

export type Subtask = {
  id: string;
  taskId: string;
  title: string;
  status: SubtaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskWithDetails = Task & {
  course?: Course;
  subtasks: Subtask[];
  totalSubtasks: number;
  completedSubtasks: number;
  progressPercentage: number | null; // null if no subtasks
};

export type UpcomingDeadlineTask = Task & {
  courseName: string;
  courseCode: string;
  isOverdue: boolean;
  isDueSoon: boolean; // within 3 days
  daysRemaining: number;
};

export type DashboardSummary = {
  totalCourses: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  upcomingDeadlines: UpcomingDeadlineTask[];
  taskProgressList: {
    id: string;
    title: string;
    courseCode: string;
    status: TaskStatus;
    totalSubtasks: number;
    completedSubtasks: number;
    progressPercentage: number | null;
  }[];
};

export type ApiResponse<T> = {
  data?: T;
  message?: string;
  error?: {
    message: string;
  };
};
