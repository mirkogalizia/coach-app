"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Utensils, Dumbbell, MessageSquare } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/diet", label: "Dieta", icon: Utensils },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/chat", label: "Chat", icon: MessageSquare },
];

export function MobileTabbar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/80 backdrop-blur border-t pb-[calc(env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-4 gap-1 p-2 max-w-md mx-auto">
        {TABS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex">
            <Button variant="ghost" className="w-full h-12 flex-col text-xs">
              <Icon className="h-5 w-5" />
              {label}
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
}