import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrders, OrderError } from "@/lib/orders";
import { isAdminAuthed } from "@/lib/auth-server";
import type { OrderStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

/** Public: place a Cash-on-Delivery order. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const order = await createOrder(body as never);
    return NextResponse.json({ order, reference: order.reference }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json(
        { error: "validation", fieldErrors: err.fieldErrors },
        { status: 400 }
      );
    }
    console.error("[orders.POST]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

/** Admin: list orders with optional status/search filters. */
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") as OrderStatus | null) ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const orders = await getOrders({ status, q });
  return NextResponse.json({ orders });
}
