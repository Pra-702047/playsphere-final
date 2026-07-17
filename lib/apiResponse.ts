import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export const successResponse = <T>(
  message: string,
  data?: T,
  status: number = 200
) => {
  return NextResponse.json(
    { success: true, message, data },
    { status }
  );
};

export const errorResponse = (
  message: string,
  error?: string,
  status: number = 400
) => {
  return NextResponse.json(
    { success: false, message, error },
    { status }
  );
};
