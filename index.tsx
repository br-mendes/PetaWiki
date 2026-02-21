import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigError } from "./components/ConfigError";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Could not find root element");

const missing: string[] = [];
if (!import.meta.env.VITE_SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missing.push("VITE_SUPABASE_ANON_KEY");

const root = ReactDOM.createRoot(rootElement);

if (missing.length) {
  root.render(
    <React.StrictMode>
      <ConfigError missing={missing} />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
