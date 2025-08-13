"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function WorkoutPage() {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="space-y-3 pb-28">
      <Card>
        <CardHeader className="pb-2 flex items-center justify-between">
          <div className="font-semibold">Petto + Spalle</div>
          <Badge variant="outline">Settimana 2/4</Badge>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Spinte manubri piana</span>
            <span>4×8–10</span>
          </div>
          <div className="flex justify-between">
            <span>Croci ai cavi</span>
            <span>3×12–15</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span>Military press manubri</span>
            <span>4×8–10</span>
          </div>
        </CardContent>

        <CardFooter className="justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPreviewOpen(true)}
          >
            Sostituisci con AI
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}