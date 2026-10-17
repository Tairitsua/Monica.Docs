"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

const desktopQuery = "(min-width: 901px)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(desktopQuery).matches;
}

// Collapsed server markup keeps the article within reach on narrow screens.
function getServerSnapshot() {
  return false;
}

export function ReadingNavigation({ label, resetKey, children }: { label: string; resetKey: string; children: ReactNode }) {
  const isDesktop = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    // Reset only the disclosure, preserving the document tree's mounted state.
    if (detailsRef.current) detailsRef.current.open = isDesktop;
  }, [resetKey, isDesktop]);

  return (
    <details className="reading-navigation" ref={detailsRef}>
      <summary>{label}</summary>
      <div className="reading-navigation-content">{children}</div>
    </details>
  );
}
