import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

/** Admin logout: clear the session cookie. */
export async function POST() {
  destroyAdminSession();
  return NextResponse.json({ ok: true });
}
