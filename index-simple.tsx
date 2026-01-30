import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

console.log("index.tsx loaded");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found");
  throw new Error("Could not find root element");
}

console.log("Creating React root");
const root = ReactDOM.createRoot(rootElement);

// Simple render to test basic React functionality
root.render(
  <div style={{ padding: 20, fontFamily: "system-ui" }}>
    <h1>Peta Wiki</h1>
    <p>Carregando...</p>
  </div>
);