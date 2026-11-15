import { NextResponse } from "next/server";

export function successResponse<T>(data: T, message: string = "Request berhasil", status: number = 200) {
  return NextResponse.json(
    {
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      error: {
        message,
      },
    },
    { status }
  );
}
