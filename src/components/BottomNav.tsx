"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, CheckSquare, StickyNote, TrendingUp, LucideIcon } from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/todo", label: "Tasks", icon: CheckSquare },
  { path: "/notes", label: "Notes", icon: StickyNote },
  { path: "/assets", label: "Assets", icon: TrendingUp },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 w-full">
      <nav
        aria-label="Bottom navigation menu"
        className="
          bg-zen-white/70
          backdrop-blur-md
          border-t border-zen-pebble/20
          p-2 w-full flex items-center
          justify-around
        "
      >
        {navItems.map((item: NavItem) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className="
                flex flex-col items-center justify-center
                py-2.5 px-3 relative w-16 min-h-[48px]
                focus:outline-none
                group cursor-pointer
              "
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`z-10 transition-colors duration-200 ${isActive ? "text-zen-indigo" : "text-zen-slate group-hover:text-zen-charcoal"
                  }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>

              <span
                className={`text-[10px] mt-1 tracking-wide z-10 transition-all duration-200 ${
                  isActive 
                    ? "font-semibold text-zen-indigo" 
                    : "font-medium text-zen-slate group-hover:text-zen-charcoal"
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}