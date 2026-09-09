"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ClipboardList, Package, Store, LogOut } from "lucide-react";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useLang } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

export function AdminNav() {
  const { t } = useLang();
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin", label: t.admin.nav.dashboard, Icon: LayoutDashboard, exact: true },
    { href: "/admin/orders", label: t.admin.nav.orders, Icon: ClipboardList, exact: false },
    { href: "/admin/products", label: t.admin.nav.products, Icon: Package, exact: false },
  ];

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex shrink-0 flex-col border-line bg-offwhite lg:h-screen lg:w-64 lg:border-e">
      <div className="flex items-center justify-between border-b border-line px-5 py-4 lg:block lg:py-6">
        <Link href="/admin" className="flex flex-col leading-none">
          <span className="font-serif text-xl font-semibold">{t.brand.name}</span>
          <span className="mt-0.5 text-[0.65rem] uppercase tracking-widest text-ink-soft">
            {t.nav.admin}
          </span>
        </Link>
        <div className="lg:hidden">
          <LanguageToggle />
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:gap-1 lg:py-6">
        {links.map(({ href, label, Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 whitespace-nowrap rounded-[2px] px-3 py-2.5 text-sm transition-colors",
              isActive(href, exact)
                ? "bg-ink text-cream"
                : "text-ink-soft hover:bg-sand hover:text-ink"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="hidden border-t border-line p-3 lg:block">
        <div className="mb-2 px-1">
          <LanguageToggle />
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-[2px] px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-sand hover:text-ink"
        >
          <Store className="h-4 w-4" />
          {t.admin.nav.viewStore}
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-[2px] px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-sand hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          {t.admin.nav.logout}
        </button>
      </div>

      {/* Mobile actions */}
      <div className="flex items-center gap-2 border-t border-line px-3 py-2 lg:hidden">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-[2px] px-3 py-2 text-sm text-ink-soft"
        >
          <Store className="h-4 w-4" />
          {t.admin.nav.viewStore}
        </Link>
        <button
          onClick={logout}
          className="ms-auto flex items-center gap-2 rounded-[2px] px-3 py-2 text-sm text-ink-soft hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          {t.admin.nav.logout}
        </button>
      </div>
    </aside>
  );
}
