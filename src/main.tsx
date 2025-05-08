import { Theme } from "@radix-ui/themes";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

// 导入样式
import "@radix-ui/themes/styles.css";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme appearance="light" accentColor="gray" radius="none">
      <App />
    </Theme>
  </React.StrictMode>,
);
