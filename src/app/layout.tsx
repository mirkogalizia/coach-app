// src/app/layout.tsx
'use client'

import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { BottomNav } from "@/components/BottomNav";
import { usePathname } from "next/navigation";

export const metadata: Metadata = {
  title: "Coach",
  description: "Diet & Workout AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideBottomNav = ["/sign-in", "/sign-up", "/onboarding"].some(path =>
    pathname.startsWith(path)
  );

  return (
    <html lang="it" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <AuthProvider>
          <div className="max-w-md mx-auto px-4 pt-4 pb-[120px] min-h-[100dvh]">
            {children}
          </div>
          {!hideBottomNav && <BottomNav />}
        </AuthProvider>
      </body>
    </html>
  );
}