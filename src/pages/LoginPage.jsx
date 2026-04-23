import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/api-error";
import { preloadDashboardRoute } from "@/lib/route-preloaders";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Login page with minimal validation and mock-auth integration.
 */
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  useEffect(() => {
    preloadDashboardRoute();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const authResult = await login(email, password);

      if (authResult?.requiresOtp) {
        navigate("/verify-otp", {
          state: {
            email,
            purpose: authResult.otpPurpose,
            challengeId: authResult.otpChallengeId,
          },
        });
        return;
      }

      const user = authResult?.user;
      preloadDashboardRoute();
      navigate(user?.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (error) {
      setError(getErrorMessage(error, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4">
      <div className="flex min-h-full items-center justify-center">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-solid w-full max-w-md p-8"
          initial={{ opacity: 0, y: 20 }}
        >
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-display font-bold text-primary">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to SpendSmart
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">
                Email
              </label>
              <input
                className="glass-input w-full rounded-lg px-4 py-2.5 text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-primary">
                Password
              </label>
              <input
                className="glass-input w-full rounded-lg px-4 py-2.5 text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                type="password"
                value={password}
              />
            </div>

            <button
              className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <button
              className="glass-card flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-primary transition-all hover:bg-white/25"
              onClick={handleGoogleLogin}
              type="button"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              className="font-medium text-primary hover:underline"
              to="/register"
            >
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
