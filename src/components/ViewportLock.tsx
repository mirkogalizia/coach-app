"use client";
import { useEffect } from "react";

/** Blocca scroll/bounce anche su iOS Safari (touchmove, wheel, pinch). */
export function ViewportLock() {
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();

    // Blocca scroll via touch (necessario { passive:false })
    document.addEventListener("touchmove", stop, { passive: false });

    // Blocca zoom pinch (iOS)
    document.addEventListener("gesturestart", stop as EventListener, { passive: false });

    // Blocca wheel (desktop/mobile con mouse)
    document.addEventListener("wheel", stop, { passive: false });

    // Blocca frecce/pagina (tastiera)
    const onKey = (e: KeyboardEvent) => {
      const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      if (keys.includes(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("touchmove", stop as EventListener);
      document.removeEventListener("gesturestart", stop as EventListener);
      document.removeEventListener("wheel", stop as EventListener);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}