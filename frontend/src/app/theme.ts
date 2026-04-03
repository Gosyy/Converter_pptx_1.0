import { createTheme } from "@mui/material/styles";

export const createAppTheme = (mode: "light" | "dark") =>
  createTheme({
    typography: {
      fontFamily: "'JetBrains Mono', monospace",
      h1: { fontFamily: "'JetBrains Mono', monospace" },
      h2: { fontFamily: "'JetBrains Mono', monospace" },
      h3: { fontFamily: "'JetBrains Mono', monospace" },
      h4: { fontFamily: "'JetBrains Mono', monospace" },
      h5: { fontFamily: "'JetBrains Mono', monospace" },
      h6: { fontFamily: "'JetBrains Mono', monospace" },
      body1: { fontFamily: "'JetBrains Mono', monospace" },
      body2: { fontFamily: "'JetBrains Mono', monospace" },
      button: { fontFamily: "'JetBrains Mono', monospace" },
      caption: { fontFamily: "'JetBrains Mono', monospace" },
    },
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#d7d7d7" : "#2e2e2e",
      },
      background: {
        default: mode === "dark" ? "#0f1115" : "#ffffff",
        paper: mode === "dark" ? "#171a21" : "#ffffff",
      },
    },
  });
