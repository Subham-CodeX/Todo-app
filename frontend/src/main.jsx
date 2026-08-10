import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { registerSW }
from "virtual:pwa-register";

import "./index.css";
import App from "./App.jsx";

import { TaskProvider }
from "./context/TaskContext";
import {
    TemplateProvider,
} from "./context/TemplateContext";

import { NotesProvider } from "./context/NotesContext";

registerSW({

  immediate: true,

});

createRoot(
document.getElementById("root")
).render(

  <StrictMode>

  <TaskProvider>

    <TemplateProvider>

      <NotesProvider>

        <App />

        <Toaster
        position="top-right"
        reverseOrder={false}
    />

      </NotesProvider>
    </TemplateProvider>

  </TaskProvider>

  </StrictMode>

);