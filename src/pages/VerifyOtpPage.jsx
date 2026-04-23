import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/api-error";

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resendOtp, verifyOtp } = useAuth();

  const initialEmail = location.state?.email || "";
  const initialPurpose = location.state?.purpose || "SIGNUP";
  const initialChallengeId = location.state?.challengeId || "";

  const [email, setEmail] = useState(initialEmail);
  const [purpose, setPurpose] = useState(initialPurpose);
  const [challengeId, setChallengeId] = useState(initialChallengeId);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!email || !purpose || !challengeId || !otpCode) {
      setError("Session expired. Please log in again to request a fresh OTP.");
      return;
    }

    setLoading(true);
    try {
      const user = await verifyOtp({ email, purpose, challengeId, otpCode });
      navigate(user?.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (verifyError) {
      setError(getErrorMessage(verifyError, "OTP verification failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");

    if (!email || !purpose) {
      setError("Email and purpose are required to resend OTP.");
      return;
    }

    setResending(true);
    try {
      const response = await resendOtp({ email, purpose });
      if (response?.otpChallengeId) {
        setChallengeId(response.otpChallengeId);
      }
      setInfo("A new OTP has been sent.");
    } catch (resendError) {
      setError(getErrorMessage(resendError, "Failed to resend OTP"));
    } finally {
      setResending(false);
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
              Verify OTP
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the OTP sent to your email to continue.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {info && (
            <div className="mb-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">
              {info}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleVerify}>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Email</label>
              <input
                className="glass-input w-full rounded-lg px-4 py-2.5 text-primary"
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                value={email}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Purpose</label>
              <select
                className="glass-input w-full rounded-lg px-4 py-2.5 text-primary"
                onChange={(event) => setPurpose(event.target.value)}
                value={purpose}
              >
                <option value="SIGNUP">Signup verification</option>
                <option value="LOGIN_2FA">Login 2FA</option>
              </select>
            </div>

            <input type="hidden" value={challengeId} readOnly />

            <div>
              <label className="mb-1 block text-sm font-medium text-primary">OTP Code</label>
              <input
                className="glass-input w-full rounded-lg px-4 py-2.5 text-primary"
                maxLength={6}
                onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                type="text"
                value={otpCode}
              />
            </div>

            <button
              className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              className="w-full rounded-lg border border-border py-3 font-semibold text-primary transition-all hover:bg-white/10 disabled:opacity-50"
              disabled={resending}
              onClick={handleResend}
              type="button"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Back to{" "}
            <Link className="font-medium text-primary hover:underline" to="/login">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;

