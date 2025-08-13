// src/app/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <div style={{minHeight:"100dvh",display:"grid",placeItems:"center",fontFamily:"sans-serif"}}>
      <div>
        <h1 style={{fontSize:20,fontWeight:600}}>Coach App</h1>
        <p style={{opacity:.7,fontSize:14}}>Build di test OK</p>
      </div>
    </div>
  );
}