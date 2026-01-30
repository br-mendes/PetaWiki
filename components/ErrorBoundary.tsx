import React from "react";

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <div>Carregando...</div>
      </div>
    }>
      {children}
    </React.Suspense>
  );
}