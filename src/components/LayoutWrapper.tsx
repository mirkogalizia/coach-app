"use client";

import { useAuth } from "./AuthProvider";
import { BottomNav } from "./BottomNav";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  return (
    <>
      <div className="max-w-md mx-auto px-3 pt-3 pb-[120px]">
        {children}
      </div>
      {user && !loading && <BottomNav />}
    </>
  );
}