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
        main: mode === "dark" ? "#cfd8ff" : "#2e2e2e",
      },
      background: {
        default: mode === "dark" ? "#0b1020" : "#ffffff",
        paper: mode === "dark" ? "#121a30" : "#ffffff",
      },
    },
    shape: {
      borderRadius: 14,
    },
    transitions: {
      duration: {
        shortest: 140,
        shorter: 190,
        short: 230,
        standard: 280,
        complex: 360,
        enteringScreen: 320,
        leavingScreen: 240,
      },
      easing: {
        easeInOut: "cubic-bezier(0.22, 1, 0.36, 1)",
        easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
        easeIn: "cubic-bezier(0.4, 0, 1, 1)",
        sharp: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background-color 280ms cubic-bezier(0.22,1,0.36,1), color 280ms cubic-bezier(0.22,1,0.36,1)",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: "background-color 280ms cubic-bezier(0.22,1,0.36,1), box-shadow 280ms cubic-bezier(0.22,1,0.36,1)",
            backdropFilter: mode === "dark" ? "blur(14px)" : "none",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            transition: "all 220ms cubic-bezier(0.22,1,0.36,1)",
          },
        },
      },
    },
  });
