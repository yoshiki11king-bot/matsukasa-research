import { NextResponse } from "next/server";
import {
  adminAuthConfigured,
  createSessionToken,
  getSessionCookieValue,
  validateAdminCredentials,
} from "@/lib/admin-session";
import {
  clearLoginRateLimit,
  isLoginRateLimited,
  recordFailedLoginAttempt,
} from "@/lib/login-rate-limit";

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const clientKey = getClientKey(request);

  if (!adminAuthConfigured()) {
    return NextResponse.redirect(new URL("/admin/login?error=unavailable", request.url), 303);
  }

  if (!username || !password) {
    return NextResponse.redirect(new URL("/admin/login?error=missing", request.url), 303);
  }

  if (isLoginRateLimited(clientKey)) {
    return NextResponse.redirect(new URL("/admin/login?error=blocked", request.url), 303);
  }

  const valid = await validateAdminCredentials(username, password);

  if (!valid) {
    recordFailedLoginAttempt(clientKey);
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url), 303);
  }

  clearLoginRateLimit(clientKey);

  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  const cookie = getSessionCookieValue(createSessionToken(username));
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
