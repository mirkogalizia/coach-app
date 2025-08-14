"use client";

import { Dumbbell, LogOut, Salad, User2, Home } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/diet", icon: Salad, label: "Dieta" },
  { href: "/workout", icon: Dumbbell, label: "Workout" },
  { href: "/account", icon: User2, label: "Account" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.replace("/sign-in");
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/70 backdrop-blur-md shadow-md border-t border-border">
      <div className="mx-auto flex max-w-md items-center justify-between px-6 py-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center text-xs",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="mb-0.5 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-xs text-muted-foreground"
        >
          <LogOut className="mb-0.5 h-5 w-5" />
          Logout
        </button>
      </div>
    </nav>
  );
}