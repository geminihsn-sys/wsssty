import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { updateProduct, deleteProduct, ProductError } from "@/lib/product-admin";
import { isAdminAuthed } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

/** Fetch a single product by id (admin editor). */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const row = await prisma.product.findUnique({ where: { id: params.id } });
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ product: serializeProduct(row) });
}

/** Admin: update a product. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const product = await updateProduct(params.id, body as never);
    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof ProductError) {
      const status = err.message === "not_found" ? 404 : 400;
      return NextResponse.json(
        { error: err.message === "not_found" ? "not_found" : "validation", fieldErrors: err.fieldErrors },
        { status }
      );
    }
    console.error("[products.PATCH]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

/** Admin: delete a product. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    await deleteProduct(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[products.DELETE]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
