import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface FABProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  icon?: React.ReactNode;
  ariaLabel: string;
  loading?: boolean;
}

export function FAB({
  icon,
  ariaLabel,
  loading = false,
  disabled,
  className,
  ...props
}: FABProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      disabled={isDisabled}
      className={cn(
        "absolute z-40",
        "bottom-6 right-6",

        "flex h-14 w-14 items-center justify-center",

        "rounded-full",

        "bg-zen-indigo text-zen-white",

        "shadow-lg shadow-zen-indigo/20",

        "transition-colors",

        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-zen-indigo/40",

        "disabled:cursor-not-allowed",
        "disabled:opacity-60",

        className
      )}
      whileHover={
        isDisabled
          ? undefined
          : {
              scale: 1.05,
              y: -2,
            }
      }
      whileTap={
        isDisabled
          ? undefined
          : {
              scale: 0.95,
            }
      }
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 22,
      }}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        icon
      )}
    </motion.button>
  );
}