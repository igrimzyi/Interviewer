import { useNavigate } from "react-router-dom";
import logo from "../assets/Group_Logo.png";
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <img src={logo} className="mb-4 h-10" />

      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-gray-500">Page not found</p>
      <p className="mt-1 text-sm text-gray-400">
        The page you’re looking for doesn’t exist.
      </p>

      <button
        onClick={() => navigate("/")}
        className="mt-4 px-4 py-2 rounded-lg text-white"
        style={{ backgroundColor: "#155DFC" }}
      >
        Go Home
      </button>
    </div>
  );
}