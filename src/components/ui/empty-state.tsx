import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "rounded-2xl",
        "border border-dashed border-zen-pebble/40",
        "bg-zen-sand/20",
        "px-4 py-14",
        "text-center",
        className
      )}
    >
      <div
        className="
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-zen-sand
          text-zen-slate
        "
      >
        {icon}
      </div>

      <h3 className="text-sm font-semibold text-zen-charcoal">
        {title}
      </h3>

      <p
        className="
          mt-1
          max-w-[260px]
          text-xs
          leading-relaxed
          text-zen-slate
        "
      >
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}
