// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Coach",
  description: "Diet & Workout AI",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="min-h-[100dvh] bg-background text-foreground relative">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}