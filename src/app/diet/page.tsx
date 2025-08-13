import dynamic from "next/dynamic";
const DietClient = dynamic(() => import("./diet-client"), { ssr: false });
export const dynamic = "force-dynamic";
export default function DietPage(){ return <DietClient/>; }