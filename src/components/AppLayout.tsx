"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideBottomNav = ["/sign-in", "/sign-up", "/onboarding"].some((path) =>
    pathname.startsWith(path)
  );

  return (
    <>
      <div className="max-w-md mx-auto px-4 pt-4 pb-[120px] min-h-[100dvh]">
        {children}
      </div>
      {!hideBottomNav && <BottomNav />}
    </>
  );
}