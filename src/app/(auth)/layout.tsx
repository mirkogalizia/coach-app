export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] grid place-items-center px-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}