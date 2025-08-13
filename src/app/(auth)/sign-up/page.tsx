// app/(auth)/sign-up/page.tsx
"use client"

import { Dumbbell } from "lucide-react"
import { SignUpForm } from "@/components/sign-up-form"
import { Card, CardContent } from "@/components/ui/card"

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side – Form */}
      <div className="flex flex-col gap-6 p-6 md:p-10 bg-background">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium text-xl">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-xl shadow">
              <Dumbbell className="size-4" />
            </div>
            Coach AI
          </a>
        </div>

        {/* Signup Form */}
        <div className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-sm shadow-soft border-none bg-white/70 backdrop-blur-md">
            <CardContent className="p-6">
              <SignUpForm />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side – Optional image */}
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Signup Visual"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}