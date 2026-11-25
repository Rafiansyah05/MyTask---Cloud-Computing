import { store } from "@/lib/store";
import { validateSubtaskInput } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await Promise.resolve(props.params);
    const taskId = params.id;

    const task = store.getTaskById(taskId);
    if (!task) {
      return errorResponse("Tugas induk tidak ditemukan", 404);
    }

    const subtasks = store.getSubtasksByTaskId(taskId);
    return successResponse(subtasks, "Daftar subtugas berhasil diambil");
  } catch (error: any) {
    return errorResponse(error.message || "Gagal mengambil data subtugas", 500);
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await Promise.resolve(props.params);
    const taskId = params.id;
    const body = await request.json();

    const validation = validateSubtaskInput(body);
    if (!validation.isValid) {
      return errorResponse(validation.error || "Data subtugas tidak valid", 400);
    }

    const result = store.createSubtask(taskId, {
      title: body.title,
      status: body.status,
    });

    if (!result.success) {
      return errorResponse(result.error || "Gagal menambahkan subtugas", result.status || 400);
    }

    return successResponse(result.data, "Subtugas berhasil ditambahkan", 201);
  } catch (error: any) {
    return errorResponse(error.message || "Terjadi kesalahan saat memproses request", 500);
  }
}
