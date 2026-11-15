import { store } from "@/lib/store";
import { validateCourseInput } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const courses = store.getCourses();
    return successResponse(courses, "Daftar mata kuliah berhasil diambil");
  } catch (error: any) {
    return errorResponse(error.message || "Gagal mengambil data mata kuliah", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateCourseInput(body);
    if (!validation.isValid) {
      return errorResponse(validation.error || "Data tidak valid", 400);
    }

    const result = store.createCourse({
      courseCode: body.courseCode,
      courseName: body.courseName,
      lecturer: body.lecturer,
      semester: body.semester,
    });

    if (!result.success) {
      return errorResponse(result.error || "Gagal menambahkan mata kuliah", result.status || 400);
    }

    return successResponse(result.data, "Mata kuliah berhasil ditambahkan", 201);
  } catch (error: any) {
    return errorResponse(error.message || "Terjadi kesalahan saat memproses request", 500);
  }
}
