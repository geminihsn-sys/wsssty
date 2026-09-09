import { NextResponse } from "next/server";
import { getAnalytics } from "@/lib/analytics";
import { isAdminAuthed } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

/** Admin: dashboard analytics payload. */
export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const data = await getAnalytics();
  return NextResponse.json({ analytics: data });
}
