"use client";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import * as React from "react";

export function GlassCard({
  className, ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn("glass ios-rounded ios-shadow", className)}
      {...props}
    />
  );
}