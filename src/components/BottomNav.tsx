"use client"

import { usePathname } from "next/navigation"
import { Dumbbell, Home, LogOut, Salad } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/AuthProvider"

export function BottomNav() {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  // Se loading o utente non loggato, non mostrare nulla
  if (loading || !user) return null

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t z-50">
      <div className="flex justify-around max-w-md mx-auto px-3 py-2 text-sm">
        <Link href="/dashboard" className={`flex flex-col items-center ${pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}>
          <Home className="size-5" />
          Home
        </Link>
        <Link href="/diet" className={`flex flex-col items-center ${pathname === "/diet" ? "text-primary" : "text-muted-foreground"}`}>
          <Salad className="size-5" />
          Dieta
        </Link>
        <Link href="/workout" className={`flex flex-col items-center ${pathname === "/workout" ? "text-primary" : "text-muted-foreground"}`}>
          <Dumbbell className="size-5" />
          Allenamento
        </Link>
        <button
          onClick={() => {
            localStorage.clear()
            window.location.href = "/sign-in"
          }}
          className="flex flex-col items-center text-muted-foreground"
        >
          <LogOut className="size-5" />
          Esci
        </button>
      </div>
    </nav>
  )
}