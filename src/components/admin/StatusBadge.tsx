"use client";

import { statusDef } from "@/lib/constants";
import { useLang } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const { lang } = useLang();
  const def = statusDef(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        def.className
      )}
    >
      {lang === "ar" ? def.ar : def.fr}
    </span>
  );
}
