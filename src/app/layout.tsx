import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { MobileDock } from "@/components/MobileDock";

export const metadata: Metadata = { title: "Coach", description: "Diet & Workout AI" };

function DockIfAuth() {
  "use client";
  const { user } = useAuth();
  if (!user) return null;
  return <MobileDock />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="min-h-[100dvh] bg-background text-foreground">
        <AuthProvider>
          <div className="max-w-md mx-auto px-3 pt-3 pb-[120px]">{children}</div>
          <DockIfAuth />
        </AuthProvider>
      </body>
    </html>
  );
}