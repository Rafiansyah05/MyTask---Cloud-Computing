import { store } from "@/lib/store";
import { successResponse, errorResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(props.params);
    const { id } = params;
    const body = await request.json();

    if (body.title !== undefined && !body.title.trim()) {
      return errorResponse("Judul subtugas tidak boleh kosong", 400);
    }
    if (body.status && !["Todo", "Done"].includes(body.status)) {
      return errorResponse("Status subtugas harus salah satu dari: Todo atau Done", 400);
    }

    const result = store.updateSubtask(id, body);
    if (!result.success) {
      return errorResponse(result.error || "Gagal memperbarui subtugas", result.status || 400);
    }

    return successResponse(result.data, "Subtugas berhasil diperbarui", 200);
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

    const result = store.deleteSubtask(id);
    if (!result.success) {
      return errorResponse(result.error || "Gagal menghapus subtugas", result.status || 400);
    }

    return successResponse(null, "Subtugas berhasil dihapus", 200);
  } catch (error: any) {
    return errorResponse(error.message || "Terjadi kesalahan saat memproses request", 500);
  }
}
