// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { BottomNav } from "@/components/BottomNav";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Coach",
  description: "Diet & Workout AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = headers().get("x-pathname") || "";
  const hideBottomNav = ["/sign-in", "/sign-up", "/onboarding"].some((path) =>
    pathname.startsWith(path)
  );

  return (
    <html lang="it" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <AuthProvider>
          <main className="flex flex-col min-h-[100dvh] max-w-md mx-auto px-4 pt-4 pb-[100px]">
            {children}
          </main>
          {!hideBottomNav && <BottomNav />}
        </AuthProvider>
      </body>
    </html>
  );
}