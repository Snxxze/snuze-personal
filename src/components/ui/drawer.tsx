import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
}: DrawerProps) {
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 250,
              mass: 0.8,
            }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "mx-auto max-w-md",
              "bg-zen-white",
              "rounded-t-3xl",
              "shadow-2xl",
              "border-t border-zen-pebble/20",
              "max-h-[85vh]",
              "flex flex-col"
            )}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-zen-pebble/60" />
            </div>

            <div className="sticky top-0 shrink-0 border-b border-zen-pebble/10 bg-zen-white px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zen-charcoal">
                  {title}
                </h3>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="
                    rounded-full
                    p-2
                    text-zen-slate
                    transition-colors
                    hover:bg-zen-sand
                    hover:text-zen-charcoal
                  "
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}