import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";

export async function POST(request: Request) {
  await requireAdmin();
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
