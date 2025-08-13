"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, User } from "lucide-react";

const navItems = [
  { href: "/diet", icon: Home, label: "Dieta" },
  { href: "/workout", icon: Dumbbell, label: "Workout" },
  { href: "/profile", icon: User, label: "Profilo" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="flex justify-around rounded-full bg-white/80 backdrop-blur-md shadow-lg py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center text-xs text-muted-foreground hover:text-black transition"
            >
              <Icon size={22} className={isActive ? "text-black" : "text-muted-foreground"} />
              <span className={isActive ? "text-black font-medium" : ""}>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}