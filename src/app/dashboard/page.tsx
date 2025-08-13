// app/dashboard/page.tsx
import dynamic from "next/dynamic";

// Import dinamico per evitare SSR del client component
const DashboardClient = dynamic(() => import("./dashboard-client"), { ssr: false });

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <DashboardClient />;
}