import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type LoginFormData = {
  email: string;
  password: string;
};

const cardClass = "mt-6 w-full max-w-sm rounded-xl border border-[#E2E8F0] bg-white px-6 py-6 shadow-sm";
const labelClass = "block text-xs font-medium text-[#0F172B]";
const inputClass = "mt-1 w-full rounded-md border border-[#E2E8F0] bg-gray-50 px-3 py-2 text-sm text-[#0F172B] outline-none focus:bg-white focus:ring-2 focus:ring-[#155DFC]/30";
const linkClass = "text-xs font-medium text-[#155DFC] hover:underline";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof LoginFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Login failed. Please try again.");
        return;
      }

      signIn(data.token, data.user);
      navigate("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">

      <div className="flex flex-col items-center">
        <img
          className="h-25 w-25 object-contain"
          src="/src/assets/logo.png"
          alt="EnterView Logo"
        />

        <h1 className="mt-3 text-lg font-semibold text-[#0F172B]">
          EnterView
        </h1>

        <p className="mt-1 text-sm text-[#45556C]">
          Sign in to your account
        </p>
      </div>

      <section className={cardClass} aria-labelledby="welcome-title">
        <h2
          id="welcome-title"
          className="text-sm font-semibold text-[#0F172B]"
        >
          Welcome back
        </h2>

        <p className="mt-1 text-xs text-[#45556C]">
          Enter your credentials to continue
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@gmail.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className={labelClass}>
                Password
              </label>

              <Link to="#" className={linkClass}>
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-md bg-[#0F172B] py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 active:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="pt-1 text-center text-xs text-[#45556C]">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-[#155DFC] hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
