import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Only actual page */}
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;