import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
} from "./auth";

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-insecure-secret";
}

/** Constant-time-ish password check against the configured admin password. */
export function checkAdminPassword(password: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD || "walid-admin-2026";
  return typeof password === "string" && password.length > 0 && password === expected;
}

/** Read + verify the current admin session cookie (server components / routes). */
export async function isAdminAuthed(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifySessionToken(token, sessionSecret());
}

/** Issue a fresh admin session cookie. Call from a route handler only. */
export async function createAdminSession(): Promise<void> {
  const token = await createSessionToken(sessionSecret());
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Clear the admin session cookie. Call from a route handler only. */
export function destroyAdminSession(): void {
  cookies().delete(COOKIE_NAME);
}
