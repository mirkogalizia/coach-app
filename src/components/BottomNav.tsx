// src/components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Salad, Home, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/diet", icon: Salad, label: "Dieta" },
  { href: "/workout", icon: Dumbbell, label: "Allenamento" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t 
      px-6 py-3 flex justify-around items-center max-w-md mx-auto 
      ios-shadow"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {navItems.map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href} aria-label={label}>
          <Icon
            className={`size-6 transition-colors ${
              pathname === href ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </Link>
      ))}
      <button
        onClick={() => signOut(auth)}
        aria-label="Logout"
        className="focus:outline-none"
      >
        <LogOut className="size-6 text-muted-foreground transition-colors hover:text-destructive" />
      </button>
    </nav>
  );
}