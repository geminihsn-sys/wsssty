import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);
  if (!product) notFound();
  return <ProductForm product={product} />;
}
