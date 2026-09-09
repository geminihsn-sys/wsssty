"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Slide-over panel. `side` is physical (left/right); callers pass the value
 * appropriate to the current text direction.
 */
export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const sidePos = side === "right" ? "right-0" : "left-0";
  const closedTransform = open
    ? "translate-x-0"
    : side === "right"
      ? "translate-x-full"
      : "-translate-x-full";

  return (
    <div
      className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-ink/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-500 ease-refined",
          sidePos,
          closedTransform
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-serif text-2xl">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-soft transition-colors hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="border-t border-line px-6 py-5">{footer}</footer>}
      </aside>
    </div>
  );
}
