import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Layout from "./components/Layout";

import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";

function Templates() {
  return (
    <div className="coming-soon">
      Templates Page Coming Soon
    </div>
  );
}

function Profile() {
  return (
    <div className="coming-soon">
      Profile Page Coming Soon
    </div>
  );
}

function App() {

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
            path="/profile"
            element={<Profile />}
          />

        </Route>

      </Routes>

    </BrowserRouter>

  );

}

export default App;