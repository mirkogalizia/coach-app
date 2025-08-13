import "./globals.css";
import type { Metadata } from "next";
import { ClientRoot } from "@/components/ClientRoot";

export const metadata: Metadata = {
  title: "Coach",
  description: "Diet & Workout AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="min-h-[100dvh] bg-background text-foreground">
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}