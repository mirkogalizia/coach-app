import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function MealCard({ title, kcal, items }:{ title:string; kcal:number; items:{ label:string; grams:number|string; macro:string }[] }){
  return (
    <Card>
      <CardHeader className="pb-1 flex items-center justify-between">
        <div className="font-medium">{title}</div>
        <Badge variant="outline">{Math.round(kcal)} kcal</Badge>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        {items.map((it, i)=> (
          <div className="flex items-center justify-between" key={i}>
            <span>{it.label} • {it.grams}g</span>
            <span className="text-muted-foreground">{it.macro}</span>
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-end"><Button size="sm" variant="ghost">Dettagli <ChevronRight className="ml-1 h-4 w-4"/></Button></CardFooter>
    </Card>
  );
}