export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center text-center p-6">
      <div>
        <div className="text-2xl font-semibold mb-1">Pagina non trovata</div>
        <p className="text-sm text-muted-foreground">Controlla l’URL o torna alla Home.</p>
      </div>
    </div>
  );
}