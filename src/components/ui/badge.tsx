import React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default:
    "bg-zen-sand text-zen-charcoal border border-zen-pebble/20",

  success:
    "bg-green-50 text-green-700 border border-green-200",

  warning:
    "bg-yellow-50 text-yellow-700 border border-yellow-200",

  destructive:
    "bg-red-50 text-red-700 border border-red-200",

  outline:
    "bg-transparent text-zen-slate border border-zen-pebble/30",
} as const;

type BadgeVariant = keyof typeof badgeVariants;

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulse?: boolean;
}

export function Badge({
  className,
  variant = "default",
  pulse = false,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        "rounded-full",
        "px-2.5 py-0.5",

        "text-xs font-medium",

        badgeVariants[variant],

        pulse && "animate-pulse",

        className
      )}
      {...props}
    />
  );
}