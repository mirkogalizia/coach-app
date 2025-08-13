"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Utensils, Dumbbell, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: Home, rounded: "start" as const },
  { href: "/diet", label: "Dieta", icon: Utensils },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/chat", label: "Chat", icon: MessageSquare, rounded: "end" as const },
];

export function MobileDock() {
  const pathname = usePathname();

  return (
    <>
      <div className="fixed z-50 w-full max-w-md -translate-x-1/2 left-1/2 bottom-4 px-3">
  <div className="relative h-16 w-full ios-rounded glass ios-shadow">
          <div className="grid h-full grid-cols-5">
            {TABS.slice(0, 2).map((item) => (
              <DockButton key={item.href} {...item} active={pathname === item.href} />
            ))}

            {/* FAB centrale */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("dock:fad"))}
                className={cn(
                  "inline-flex items-center justify-center w-10 h-10 rounded-full",
                  "bg-primary text-primary-foreground ring-offset-background",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2",
                  "active:scale-95 transition"
                )}
                aria-label="Nuovo elemento"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {TABS.slice(2).map((item) => (
              <DockButton key={item.href} {...item} active={pathname === item.href} />
            ))}
          </div>
        </div>
      </div>

      {/* Safe area iOS */}
      <div className="h-[calc(env(safe-area-inset-bottom))]" />
    </>
  );
}

function DockButton({
  href, label, icon: Icon, active, rounded,
}: {
  href: string; label: string; icon: any; active?: boolean; rounded?: "start"|"end";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex flex-col items-center justify-center px-5 select-none",
        rounded === "start" && "rounded-s-full",
        rounded === "end" && "rounded-e-full",
        "hover:bg-accent/50 focus:bg-accent/60 focus:outline-none"
      )}
      aria-label={label}
    >
      <Icon className={cn("w-5 h-5 mb-1", active ? "text-primary" : "text-muted-foreground")} />
      <span className="sr-only">{label}</span>
    </Link>
  );
}