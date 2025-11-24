import "./globals.css";
import "primereact/resources/themes/lara-light-purple/theme.css";

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PrimeReactProvider } from "primereact/api";
import React from "react";
import ReactDOM from "react-dom/client";

import "primeicons/primeicons.css";
import { AppV2 } from "./AppV2";
import { AppStateProvider, WebSocketsProvider } from "./context";

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <PrimeReactProvider>
    <AppStateProvider>
      <WebSocketsProvider>
        <AppV2 />
      </WebSocketsProvider>
    </AppStateProvider>
  </PrimeReactProvider>,
);
