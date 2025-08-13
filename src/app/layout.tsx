// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { BottomNav } from "@/components/BottomNav";
import { usePathname } from "next/navigation";

export const metadata: Metadata = {
  title: "Coach",
  description: "Diet & Workout AI",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 👇 Componente client per gestire BottomNav dinamicamente
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/sign-in" || pathname === "/sign-up";

  return (
    <>
      <div className="max-w-md mx-auto px-4 pb-[100px]">{children}</div>
      {!hideNav && <BottomNav />}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="min-h-[100dvh] bg-background text-foreground relative">
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}