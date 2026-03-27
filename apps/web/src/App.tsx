import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import "./index.css";
import LandingPage from "./pages/LandingPage.tsx";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage.tsx";
import JoinSession from "./pages/JoinSession.tsx"
import Session from "./pages/Session";
import Editor from "./pages/Editor";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import QuestionPage from "./pages/QuestionPage";
import QuestionBank from "./pages/QuestionBank";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full">
        <Routes>
          <Route path="/" element={<><Navbar /> <LandingPage /></>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/session/join/:id" element={<JoinSession/>}/>

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

          {/* ✅EDITOR */}
          <Route
            path="/editor/:sessionCode"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />

          {/* QUESTION */}
          <Route
            path="/question/create"
            element={
              <ProtectedRoute>
                <QuestionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/questions"
            element={
              <ProtectedRoute>
                <QuestionBank />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
