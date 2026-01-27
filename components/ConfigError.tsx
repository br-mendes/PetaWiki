import React from "react";

export function ConfigError({ missing }: { missing: string[] }) {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Configuração incompleta</h1>
      <p style={{ marginBottom: 12 }}>
        Faltam variáveis de ambiente necessárias para iniciar o Peta Wiki.
      </p>
      <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
{missing.map((m) => `- ${m}`).join("\n")}
      </pre>
      <p style={{ marginTop: 12 }}>
        No Vercel: Settings → Environment Variables (Production) e faça Redeploy (Clear Build Cache).
      </p>
    </div>
  );
}