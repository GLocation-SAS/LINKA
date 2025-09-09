import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme.ts";
import "./styles/fonts.css"
import "./styles/scrollbar.css"
import AppRoutes from "./routes/index.tsx";
import "react-phone-input-2/lib/style.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  </React.StrictMode>
);
