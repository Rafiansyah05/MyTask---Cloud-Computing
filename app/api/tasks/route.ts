import { store } from "@/lib/store";
import { validateTaskInput } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId") || undefined;
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;

    const tasks = store.getTasks({ courseId, status, priority });
    return successResponse(tasks, "Daftar tugas berhasil diambil");
  } catch (error: any) {
    return errorResponse(error.message || "Gagal mengambil data tugas", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateTaskInput(body);
    if (!validation.isValid) {
      return errorResponse(validation.error || "Data tugas tidak valid", 400);
    }

    const result = store.createTask({
      courseId: body.courseId,
      title: body.title,
      description: body.description,
      deadline: body.deadline,
      priority: body.priority,
      status: body.status,
    });

    if (!result.success) {
      return errorResponse(result.error || "Gagal menambahkan tugas", result.status || 400);
    }

    return successResponse(result.data, "Tugas berhasil ditambahkan", 201);
  } catch (error: any) {
    return errorResponse(error.message || "Terjadi kesalahan saat memproses request", 500);
  }
}
