// src/components/AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <div className="max-w-md mx-auto px-3 pt-3 pb-[120px]">
        {children}
      </div>
      {pathname !== "/sign-in" && pathname !== "/sign-up" && <BottomNav />}
    </>
  );
}