// app/(auth)/sign-in/page.tsx
"use client"

import { Dumbbell } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form Section */}
      <div className="flex flex-col gap-6 p-6 md:p-10 bg-background">
        {/* Logo + Branding */}
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium text-xl">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-xl shadow">
              <Dumbbell className="size-4" />
            </div>
            Coach AI
          </a>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-sm shadow-soft border-none bg-white/70 backdrop-blur-md">
            <CardContent className="p-6">
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg" // puoi sostituire con una immagine reale /coach-login.jpg ecc.
          alt="Login Visual"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}