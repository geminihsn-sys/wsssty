import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth-server";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth — middleware already gates this, but re-check server-side.
  if (!(await isAdminAuthed())) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-cream lg:flex">
      <AdminNav />
      <main className="flex-1 lg:h-screen lg:overflow-y-auto">
        <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
