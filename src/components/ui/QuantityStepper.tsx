"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const btn =
    size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const box = size === "sm" ? "w-8 text-sm" : "w-10 text-base";
  return (
    <div className="inline-flex items-center border border-line">
      <button
        type="button"
        aria-label="decrease quantity"
        className={cn(
          "flex items-center justify-center text-ink transition-colors hover:bg-sand disabled:opacity-40",
          btn
        )}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={cn("text-center tabular-nums", box)}>{value}</span>
      <button
        type="button"
        aria-label="increase quantity"
        className={cn(
          "flex items-center justify-center text-ink transition-colors hover:bg-sand disabled:opacity-40",
          btn
        )}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
