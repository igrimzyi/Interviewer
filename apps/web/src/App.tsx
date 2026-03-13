import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/Navbar.tsx'
import './index.css'
import LandingPage from './pages/LandingPage.tsx'
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="min-h-screen w-full">
    <Routes>
      <Route path="/" element={<><Navbar/> <LandingPage /></>} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
    </div>
    
  );
}

export default App;