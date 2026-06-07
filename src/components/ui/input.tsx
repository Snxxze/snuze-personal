import React from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "search";
  error?: boolean;
}

export const Input = React.forwardRef<
  HTMLInputElement,
  InputProps
>(
  (
    {
      className,
      variant = "default",
      type = "text",
      error = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputElement = (
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        aria-invalid={error}
        className={cn(
          "w-full rounded-2xl",

          "bg-zen-sand",

          "px-4 py-3.5",

          "text-sm text-zen-charcoal",

          "outline-none",

          "transition-all duration-200",

          "border border-transparent",

          "placeholder:text-zen-slate/60",

          "focus:bg-zen-white",
          "focus:border-zen-pebble",
          "focus:shadow-sm",

          "disabled:cursor-not-allowed",
          "disabled:opacity-60",

          "aria-[invalid=true]:border-red-400",
          "aria-[invalid=true]:bg-red-50",

          variant === "search" && "pl-11",

          className
        )}
        {...props}
      />
    );

    if (variant !== "search") {
      return inputElement;
    }

    return (
      <div className="relative w-full">
        <div
          className="
            pointer-events-none
            absolute
            inset-y-0
            left-4
            flex
            items-center
            text-zen-slate
          "
        >
          <Search className="h-4 w-4" />
        </div>

        {inputElement}
      </div>
    );
  }
);

Input.displayName = "Input";