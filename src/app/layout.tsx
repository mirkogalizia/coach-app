// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Coach",
  description: "Diet & Workout AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="min-h-[100dvh] bg-background text-foreground relative">
        <AuthProvider>
          <div className="max-w-md mx-auto px-3 pt-3 pb-[120px]">
            {children}
          </div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}