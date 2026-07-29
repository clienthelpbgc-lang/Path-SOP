import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export function handleError(error: unknown) {
  console.error(error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      },
    },
    { status: 500 },
  );
}
