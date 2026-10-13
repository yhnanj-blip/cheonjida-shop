import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Shop from "../app/shop";
import "../app/globals.css";
import "./static.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Shop />
  </StrictMode>,
);
