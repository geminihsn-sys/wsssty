import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword, createAdminSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

/** Admin login: verify password and set the session cookie. */
export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!checkAdminPassword(body.password)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
