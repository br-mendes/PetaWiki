import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);

// Importar App diretamente sem validação de ambiente para evitar problemas no Vercel
import("./App").then(({ default: App }) => {
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}).catch(error => {
  console.error("Failed to load App:", error);
  root.render(
    <div style={{ padding: 24, fontFamily: "system-ui", color: "red" }}>
      <h1>Erro ao carregar aplicação</h1>
      <p>Verifique o console para mais detalhes.</p>
    </div>
  );
});
