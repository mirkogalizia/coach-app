// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { MobileDock } from "@/components/MobileDock";
import { ViewportLock } from "@/components/ViewportLock";

export const metadata: Metadata = {
  title: "Coach",
  description: "Diet & Workout AI",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    userScalable: false, // riduce zoom/pinch
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ViewportLock />
        <div className="mx-auto max-w-md px-3 pt-3 no-scroll-screen">
          {children}
        </div>
        <MobileDock />
      </body>
    </html>
  );
}