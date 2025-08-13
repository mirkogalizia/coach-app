// app/workout/page.tsx
import dynamic from "next/dynamic";

// NON importare direttamente il client component!
// import WorkoutClient from "./workout-client";  ❌

const WorkoutClient = dynamic(() => import("./workout-client"), { ssr: false });

export const dynamic = "force-dynamic"; // evita SSG/ISR

export default function WorkoutPage() {
  return <WorkoutClient />;
}