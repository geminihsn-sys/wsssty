import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus, OrderError } from "@/lib/orders";
import { isAdminAuthed } from "@/lib/auth-server";
import type { OrderStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

/** Admin: fetch a single order. */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const order = await getOrderById(params.id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ order });
}

/** Admin: update an order's status. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const order = await updateOrderStatus(params.id, body.status as OrderStatus);
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json(
        { error: "validation", fieldErrors: err.fieldErrors },
        { status: 400 }
      );
    }
    console.error("[orders.PATCH]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
