import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initJam } from "@/lib/jam";

// Initialize Jam SDK for beta tester bug reporting
// Set VITE_JAM_API_KEY in your .env to activate
initJam();

if (!window.location.hash) {
  window.location.hash = "#/";
}

createRoot(document.getElementById("root")!).render(<App />);
