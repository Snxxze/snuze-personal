import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  selectedValue,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "relative flex p-1 bg-zen-sand border border-zen-pebble/30 rounded-xl w-full",
        className
      )}
    >
      {options.map((option) => {
        const isActive = selectedValue === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
            className={cn(
              "flex-1 flex items-center justify-center gap-2",
              "py-2 text-xs font-semibold rounded-lg relative z-10",
              "transition-colors duration-200 cursor-pointer focus:outline-none",
              isActive ? "text-zen-indigo" : "text-zen-slate hover:text-zen-charcoal"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeSegment"
                className="absolute inset-0 bg-zen-white rounded-lg shadow-sm border border-zen-pebble/20"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            {option.icon && <span className="z-10">{option.icon}</span>}
            <span className="z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
