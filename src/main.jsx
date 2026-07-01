import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./ui/ErrorBoundary.jsx";
import { LangProvider } from "./lib/i18n.js";
import "./saver-ui.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LangProvider>
        <App />
      </LangProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
