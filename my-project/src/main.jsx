import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { HeadProvider } from "react-head";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <HeadProvider>
        <App />
      </HeadProvider>
    </BrowserRouter>
  </React.StrictMode>
);
