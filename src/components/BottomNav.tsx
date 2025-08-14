// src/components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Home, Salad, User } from "lucide-react";
import { useAuth } from "./AuthProvider";

const routes = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/diet", icon: Salad, label: "Dieta" },
  { href: "/workout", icon: Dumbbell, label: "Workout" },
  { href: "/account", icon: User, label: "Account" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null; // 👈 Nasconde se non sei loggato

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-t shadow-lg">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {routes.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 text-xs transition-all ${
                active ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}