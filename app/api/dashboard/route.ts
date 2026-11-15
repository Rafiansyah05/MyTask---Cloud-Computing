import { store } from "@/lib/store";
import { successResponse, errorResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summary = store.getDashboardSummary();
    return successResponse(summary, "Data ringkasan dashboard berhasil dimuat");
  } catch (error: any) {
    return errorResponse(error.message || "Gagal memuat ringkasan dashboard", 500);
  }
}
