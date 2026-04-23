import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { CURRENCY_OPTIONS, TIMEZONE_OPTIONS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/api-error";
import { preloadDashboardRoute } from "@/lib/route-preloaders";

/**
 * Registration page with simple validation for demo purposes.
 */
const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    currency: "USD",
    timezone: "America/New_York",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    preloadDashboardRoute();
  }, []);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const authResult = await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        passwordConfirm: form.confirmPassword,
        currency: form.currency,
        timezone: form.timezone,
      });

      if (authResult?.requiresOtp) {
        navigate("/verify-otp", {
          state: {
            email: form.email,
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
      setError(getErrorMessage(error, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="flex min-h-full items-center justify-center">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-solid w-full max-w-md p-8"
          initial={{ opacity: 0, y: 20 }}
        >
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-3xl font-display font-bold text-primary">
              Create Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Start your financial journey with SpendSmart
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">
                Full Name
              </label>
              <input
                className="glass-input w-full rounded-lg px-4 py-2.5 text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                placeholder="John Doe"
                type="text"
                value={form.fullName}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-primary">
                Email
              </label>
              <input
                className="glass-input w-full rounded-lg px-4 py-2.5 text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={form.email}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-primary">
                  Password
                </label>
                <input
                  className="glass-input w-full rounded-lg px-4 py-2.5 text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-primary">
                  Confirm
                </label>
                <input
                  className="glass-input w-full rounded-lg px-4 py-2.5 text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onChange={(event) =>
                    updateField("confirmPassword", event.target.value)
                  }
                  placeholder="••••••••"
                  type="password"
                  value={form.confirmPassword}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-primary">
                  Currency
                </label>
                <select
                  className="glass-input w-full rounded-lg px-4 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onChange={(event) =>
                    updateField("currency", event.target.value)
                  }
                  value={form.currency}
                >
                  {CURRENCY_OPTIONS.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-primary">
                  Timezone
                </label>
                <select
                  className="glass-input w-full rounded-lg px-4 py-2.5 text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onChange={(event) =>
                    updateField("timezone", event.target.value)
                  }
                  value={form.timezone}
                >
                  {TIMEZONE_OPTIONS.map((timezone) => (
                    <option key={timezone} value={timezone}>
                      {timezone.split("/").pop()?.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="mt-2 w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-4">
            <button
              className="glass-card flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-primary transition-all hover:bg-white/25"
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

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              className="font-medium text-primary hover:underline"
              to="/login"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
