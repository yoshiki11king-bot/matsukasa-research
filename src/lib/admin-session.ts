import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "harbor_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

function getAdminUsername() {
  return process.env.ADMIN_USERNAME ?? "admin";
}

export function getConfiguredAdminUsername() {
  return getAdminUsername();
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function adminAuthConfigured() {
  return Boolean(getAdminPassword() && getSessionSecret());
}

export async function validateAdminCredentials(username: string, password: string) {
  if (!adminAuthConfigured()) {
    return false;
  }

  return safeCompare(username, getAdminUsername()) && safeCompare(password, getAdminPassword());
}

export function createSessionToken(username: string) {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${username}:${expiresAt}`;
  const signature = sign(payload);
  return `${payload}:${signature}`;
}

export function getSessionCookieValue(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: "/",
      sameSite: "strict" as const,
      priority: "high" as const,
      secure: process.env.NODE_ENV === "production",
    },
  };
}

export async function isAdminAuthenticated() {
  if (!adminAuthConfigured()) {
    return false;
  }

  const token = (await cookies()).get(COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  const parts = token.split(":");

  if (parts.length !== 3) {
    return false;
  }

  const [username, expiresAt, signature] = parts;
  const payload = `${username}:${expiresAt}`;

  if (!safeCompare(signature, sign(payload))) {
    return false;
  }

  if (Date.now() > Number(expiresAt)) {
    return false;
  }

  return safeCompare(username, getAdminUsername());
}

export async function requireAdmin() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }
}
