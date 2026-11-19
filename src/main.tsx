import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { initInstall } from "./features/pwa/install";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/global.css";

// Tangkap `beforeinstallprompt` sebelum React me-render, agar peristiwa yang
// datang lebih awal tidak hilang.
initInstall();

const container = document.getElementById("root");

if (!container) {
  throw new Error("Elemen #root tidak ditemukan.");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
