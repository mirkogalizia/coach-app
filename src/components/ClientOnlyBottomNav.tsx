// src/components/ClientOnlyBottomNav.tsx
"use client";

import { useAuth } from "./AuthProvider";
import { BottomNav } from "./BottomNav";

export function ClientOnlyBottomNav() {
  const { user, loading } = useAuth();
  if (!user || loading) return null;
  return <BottomNav />;
}