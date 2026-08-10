import { useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Layout from "./components/Layout";

import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Templates from "./pages/Templates";

import {
  requestNotificationPermission,
} from "./services/notificationService";

import Notes from "./pages/Notes";
// ==========================
// Placeholder Pages
// ==========================

function Profile() {
  return (
    <div className="coming-soon">
      Profile Page Coming Soon
    </div>
  );
}

// function Notes() {
//   return (
//     <div className="coming-soon">
//       Sticky Notes Coming Soon
//     </div>
//   );
// }

// ==========================
// App
// ==========================

function App() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<Tasks />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/templates"
            element={<Templates />}
          />

          <Route
            path="/notes"
            element={<Notes />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;