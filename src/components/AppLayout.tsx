// src/components/AppLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideBottomNav = ["/sign-in", "/sign-up", "/onboarding"].some((path) =>
    pathname.startsWith(path)
  );

  return (
    <div className="relative min-h-[100dvh] max-w-md mx-auto bg-background text-foreground flex flex-col">
      {/* Contenuto scrollabile */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        {children}
      </main>

      {/* BottomNav visibile solo se non in onboarding/login */}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}