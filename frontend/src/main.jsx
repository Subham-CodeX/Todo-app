import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { registerSW }
from "virtual:pwa-register";

import "./index.css";
import App from "./App.jsx";

import { TaskProvider }
from "./context/TaskContext";
import {
    TemplateProvider,
} from "./context/TemplateContext";

registerSW({

  immediate: true,

});

createRoot(
document.getElementById("root")
).render(

  <StrictMode>

  <TaskProvider>

    <TemplateProvider>

        <App />

    </TemplateProvider>

  </TaskProvider>

  </StrictMode>

);