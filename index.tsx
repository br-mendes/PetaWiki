import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

console.log("index.tsx: Starting app initialization");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found");
  throw new Error("Could not find root element");
}

console.log("index.tsx: Root element found");

// Test with simplified version first
try {
  console.log("index.tsx: Attempting to import simplified App");
  import("./App-simple").then(({ default: App }) => {
    console.log("index.tsx: Simplified App imported successfully");
    console.log("index.tsx: Creating React root");
    const root = ReactDOM.createRoot(rootElement);
    
    console.log("index.tsx: Rendering simplified App");
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log("index.tsx: Simplified App rendered successfully");
  }).catch(error => {
    console.error("index.tsx: Failed to import or render simplified App:", error);
    rootElement.innerHTML = `
      <div style="padding:20px;font-family:system-ui;color:red;">
        <h1>Erro ao importar App</h1>
        <pre>${error.message}</pre>
        <p>Verifique o console para mais detalhes.</p>
      </div>
    `;
  });
} catch (error) {
  console.error("index.tsx: Critical error:", error);
  rootElement.innerHTML = `
    <div style="padding:20px;font-family:system-ui;color:red;">
      <h1>Erro Crítico</h1>
      <pre>${error.message}</pre>
    </div>
  `;
}
