"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Salad, Home, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "./AuthProvider"; // ⬅️ aggiunto

const navItems = [
  { href: "/dashboard", icon: Home },
  { href: "/diet", icon: Salad },
  { href: "/workout", icon: Dumbbell },
];

export function BottomNav() {
  const { user } = useAuth(); // ⬅️ otteniamo l'utente loggato
  const pathname = usePathname();

  if (!user) return null; // ⬅️ Nascondi la barra se l'utente non è loggato

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t px-6 py-3 flex justify-between items-center max-w-md mx-auto">
      {navItems.map(({ href, icon: Icon }) => (
        <Link key={href} href={href}>
          <Icon
            className={`size-6 ${
              pathname === href ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </Link>
      ))}
      <button onClick={() => signOut(auth)} title="Logout">
        <LogOut className="size-6 text-muted-foreground" />
      </button>
    </nav>
  );
}