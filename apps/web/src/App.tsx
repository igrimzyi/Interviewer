import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      {/* Only actual page */}
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;