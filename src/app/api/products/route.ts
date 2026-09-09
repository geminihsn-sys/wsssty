import { NextRequest, NextResponse } from "next/server";
import { getProducts, type SortKey } from "@/lib/products";
import { createProduct, ProductError } from "@/lib/product-admin";
import { isAdminAuthed } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

/** List products. Admin callers may include inactive products via ?all=1. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wantAll = searchParams.get("all") === "1";
  const includeInactive = wantAll && (await isAdminAuthed());

  const products = await getProducts({
    category: searchParams.get("category") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    size: searchParams.get("size") ?? undefined,
    sort: (searchParams.get("sort") as SortKey | null) ?? undefined,
    includeInactive,
  });
  return NextResponse.json({ products });
}

/** Admin: create a product. */
export async function POST(req: NextRequest) {
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
    const product = await createProduct(body as never);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (err instanceof ProductError) {
      return NextResponse.json(
        { error: "validation", fieldErrors: err.fieldErrors },
        { status: 400 }
      );
    }
    console.error("[products.POST]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
