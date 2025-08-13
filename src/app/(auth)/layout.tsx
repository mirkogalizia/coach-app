// src/app/(auth)/layout.tsx
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] grid place-items-center px-4 py-8">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}