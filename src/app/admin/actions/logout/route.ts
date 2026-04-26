import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.cookies.set("harbor_admin_session", "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    priority: "high",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
