import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "outline" | "ghost" | "subtle" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[2px] font-medium tracking-wide transition-all duration-300 ease-refined focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-cream hover:bg-ink/90",
  outline: "border border-ink text-ink hover:bg-ink hover:text-cream",
  ghost: "text-ink hover:bg-sand",
  subtle: "bg-sand text-ink hover:bg-line",
  danger: "border border-danger text-danger hover:bg-danger hover:text-cream",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
  icon: "h-10 w-10",
};

export function buttonVariants(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  return cn(base, variants[variant], sizes[size]);
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants(variant, size), className)} {...props} />
  )
);
Button.displayName = "Button";
