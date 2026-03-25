import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import "./index.css";
import LandingPage from "./pages/LandingPage.tsx";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage.tsx";
import Session from "./pages/Session";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full">
        <Routes>
          <Route path="/" element={<><Navbar /> <LandingPage /></>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ✅DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ✅NEW ROUTE*/}
          <Route
            path="/session/create"
            element={
              <ProtectedRoute>
                <Session />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;