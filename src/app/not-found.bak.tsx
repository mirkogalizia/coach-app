// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-[60dvh] grid place-items-center text-center p-6">
      <div>
        <div className="text-2xl font-semibold">Pagina non trovata</div>
        <p className="text-sm text-muted-foreground mt-2">Controlla l’URL o torna alla home.</p>
      </div>
    </div>
  );
}