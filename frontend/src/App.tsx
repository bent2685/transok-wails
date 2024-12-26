import React from "react";
import TitleBar from "./components/TitleBar/TItleBar";
import { ThemeProvider } from "./provider/theme.provider";
import { ConfirmProvider } from "./provider/confirm.provider";
import { SpinProvider } from "./provider/spin.provider";
import useTheme from "./hooks/theme.use";
import MainLayout from "./@layout/MainLayout";

function App() {
  useTheme();

  return (
    <React.Fragment>
      <ThemeProvider storageKey="vite-ui-theme">
        <ConfirmProvider>
          <SpinProvider>
            <div id="App" className="h-100vh">
              <MainLayout />
            </div>
          </SpinProvider>
        </ConfirmProvider>
      </ThemeProvider>
    </React.Fragment>
  );
}

export default App;
