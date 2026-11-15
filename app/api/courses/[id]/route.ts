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

    const course = store.getCourseById(id);
    if (!course) {
      return errorResponse("Mata kuliah tidak ditemukan", 404);
    }

    return successResponse(course, "Detail mata kuliah berhasil diambil");
  } catch (error: any) {
    return errorResponse(error.message || "Gagal mengambil data mata kuliah", 500);
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

    if (body.courseCode !== undefined && !body.courseCode.trim()) {
      return errorResponse("Kode mata kuliah tidak boleh kosong", 400);
    }
    if (body.courseName !== undefined && !body.courseName.trim()) {
      return errorResponse("Nama mata kuliah tidak boleh kosong", 400);
    }
    if (body.semester !== undefined && !body.semester.trim()) {
      return errorResponse("Semester tidak boleh kosong", 400);
    }

    const result = store.updateCourse(id, body);
    if (!result.success) {
      return errorResponse(result.error || "Gagal memperbarui mata kuliah", result.status || 400);
    }

    return successResponse(result.data, "Mata kuliah berhasil diperbarui", 200);
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

    const result = store.deleteCourse(id);
    if (!result.success) {
      return errorResponse(result.error || "Gagal menghapus mata kuliah", result.status || 400);
    }

    return successResponse(null, "Mata kuliah berhasil dihapus", 200);
  } catch (error: any) {
    return errorResponse(error.message || "Terjadi kesalahan saat memproses request", 500);
  }
}
