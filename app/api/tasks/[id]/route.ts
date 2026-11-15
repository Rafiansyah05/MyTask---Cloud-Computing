import { store } from "@/lib/store";
import { successResponse, errorResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(props.params);
    const { id } = params;

    const task = store.getTaskById(id);
    if (!task) {
      return errorResponse("Tugas tidak ditemukan", 404);
    }

    return successResponse(task, "Detail tugas berhasil diambil");
  } catch (error: any) {
    return errorResponse(error.message || "Gagal mengambil data tugas", 500);
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(props.params);
    const { id } = params;
    const body = await request.json();

    if (body.title !== undefined && !body.title.trim()) {
      return errorResponse("Judul tugas tidak boleh kosong", 400);
    }
    if (body.deadline !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(body.deadline) || isNaN(Date.parse(body.deadline))) {
        return errorResponse("Format deadline tidak valid (gunakan format YYYY-MM-DD)", 400);
      }
    }
    if (body.priority && !["Low", "Medium", "High"].includes(body.priority)) {
      return errorResponse("Prioritas harus salah satu dari: Low, Medium, High", 400);
    }
    if (body.status && !["Todo", "In Progress", "Done"].includes(body.status)) {
      return errorResponse("Status harus salah satu dari: Todo, In Progress, Done", 400);
    }

    const result = store.updateTask(id, body);
    if (!result.success) {
      return errorResponse(result.error || "Gagal memperbarui tugas", result.status || 400);
    }

    return successResponse(result.data, "Tugas berhasil diperbarui", 200);
  } catch (error: any) {
    return errorResponse(error.message || "Terjadi kesalahan saat memproses request", 500);
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(props.params);
    const { id } = params;

    const result = store.deleteTask(id);
    if (!result.success) {
      return errorResponse(result.error || "Gagal menghapus tugas", result.status || 400);
    }

    return successResponse(null, "Tugas dan seluruh subtugas terkait berhasil dihapus", 200);
  } catch (error: any) {
    return errorResponse(error.message || "Terjadi kesalahan saat memproses request", 500);
  }
}
