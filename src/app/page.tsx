import dynamic from "next/dynamic";
const HomeClient = dynamic(() => import("./home-client"), { ssr: false });
export const dynamic = "force-dynamic";
export default function Home(){ return <HomeClient/>; }