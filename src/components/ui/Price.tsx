"use client";

import { useLang } from "@/components/providers/LanguageProvider";
import { formatDA } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  const { lang } = useLang();
  return <span className={cn("tabular-nums", className)}>{formatDA(amount, lang)}</span>;
}
