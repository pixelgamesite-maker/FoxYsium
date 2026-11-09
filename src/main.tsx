import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// After a redeploy, an open tab may ask for old chunk files. Reload once.
window.addEventListener("vite:preloadError", () => {
  try {
    if (sessionStorage.getItem("fx-reloaded")) return;
    sessionStorage.setItem("fx-reloaded", "1");
  } catch {
    return;
  }
  window.location.reload();
});
window.addEventListener("load", () => setTimeout(() => {
  try { sessionStorage.removeItem("fx-reloaded"); } catch { /* ignore */ }
}, 10_000));

createRoot(document.getElementById("root")!).render(<App />);
