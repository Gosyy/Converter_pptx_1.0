import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/App";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { ThemeProvider } from "@mui/material/styles";
import { createAppTheme } from "./app/theme";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./app/store";

const ThemedApp = () => {
  const colorMode = useSelector((state: RootState) => state.ui.colorMode);
  const theme = useMemo(() => createAppTheme(colorMode), [colorMode]);

  return (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <ThemedApp />
  </Provider>
);
