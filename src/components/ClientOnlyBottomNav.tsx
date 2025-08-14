// src/components/ClientOnlyBottomNav.tsx
"use client";

import { useAuth } from "./AuthProvider";
import { BottomNav } from "./BottomNav";

export function ClientOnlyBottomNav() {
  const { user, loading } = useAuth();
  if (loading || !user) return null; // 👈 questo ordine è fondamentale
  return <BottomNav />;
}