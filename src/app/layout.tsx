// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider"; // 👈 IMPORTANTE

export const metadata: Metadata = {
  title: "Coach",
  description: "Diet & Workout AI",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="min-h-[100dvh] bg-background text-foreground">
        <AuthProvider> {/* 👈 WRAP TUTTO */}
          <div className="max-w-md mx-auto px-3 pt-3 pb-[120px]">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}