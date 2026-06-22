import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  HeartPulse,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import authService from "../../services/authService";

function ForgotPassword(): JSX.Element {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<"email" | "reset" | "success">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mailSent, setMailSent] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    const params = new URLSearchParams(window.location.search);
    const tokenFromEmail = params.get("token");
    const emailFromEmail = params.get("email");

    if (tokenFromEmail && emailFromEmail) {
      setEmail(emailFromEmail);
      setResetToken(tokenFromEmail);
      setStep("reset");
      setMessage("Reset link verified. Enter your new password.");
    }
  }, []);

  const handleResetRequest = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.requestPasswordReset(email.trim());
      setResetToken(response.resetToken || "");
      setMessage(response.message);
      setMailSent(Boolean(response.emailSent));
      setStep(response.emailSent ? "success" : "reset");
    } catch (err: any) {
      setError(err.message || "Unable to verify this account.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await authService.resetPassword(
        email.trim(),
        resetToken,
        newPassword,
        confirmPassword
      );
      setMessage(response.message);
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`min-h-screen flex items-center justify-center px-6 py-10 ${
        isDark
          ? "bg-gradient-to-br from-[#071827] via-[#0b2538] to-[#123047]"
          : "bg-gradient-to-br from-blue-50 via-white to-cyan-50"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-[28px] shadow-2xl border p-8 ${
          isDark
            ? "bg-[#07111f] border-[#28506b]"
            : "bg-white border-blue-100"
        }`}
      >
        <button
          onClick={() => navigate("/login")}
          className={`flex items-center gap-2 mb-8 text-sm font-medium ${
            isDark ? "text-blue-400" : "text-blue-600"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 mb-5">
            <HeartPulse className="w-9 h-9 text-white" />
          </div>

          <h1
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Forgot Password?
          </h1>

          <p
            className={`mt-2 text-sm ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            Enter your email and we will send you a reset link.
          </p>
        </div>

        {step === "email" ? (
          <div className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-14 pl-12 rounded-xl text-base ${
                  isDark
                    ? "bg-[#102033] border-[#36566f] text-white placeholder:text-slate-400"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>

            {error && (
              <div
                className={`px-4 py-3 rounded-xl text-sm border ${
                  isDark
                    ? "bg-red-950/40 border-red-800 text-red-300"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {error}
              </div>
            )}

            <Button
              onClick={handleResetRequest}
              disabled={loading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg shadow-blue-600/25"
            >
              {loading ? "Sending..." : "Send Reset Email"}
            </Button>

            <p
              className={`text-center text-sm ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-blue-500 hover:underline font-semibold"
              >
                Login
              </Link>
            </p>
          </div>
        ) : step === "reset" ? (
          <div className="space-y-5">
            {message && (
              <div
                className={`px-4 py-3 rounded-xl text-sm border ${
                  isDark
                    ? "bg-emerald-950/30 border-emerald-800 text-emerald-300"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              >
                {message}
              </div>
            )}

            <div
              className={`px-4 py-3 rounded-xl text-sm border ${
                isDark
                  ? "bg-[#102033] border-[#36566f] text-slate-300"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              Resetting password for <strong>{email}</strong>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`h-14 pl-12 pr-12 rounded-xl text-base ${
                  isDark
                    ? "bg-[#102033] border-[#36566f] text-white placeholder:text-slate-400"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`h-14 pl-12 pr-12 rounded-xl text-base ${
                  isDark
                    ? "bg-[#102033] border-[#36566f] text-white placeholder:text-slate-400"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <div
                className={`px-4 py-3 rounded-xl text-sm border ${
                  isDark
                    ? "bg-red-950/40 border-red-800 text-red-300"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {error}
              </div>
            )}

            <Button
              onClick={handlePasswordUpdate}
              disabled={loading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg shadow-blue-600/25"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setResetToken("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
                setMessage("");
                setMailSent(false);
              }}
              className={`w-full text-sm font-medium ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <div className="text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>

            <h2
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {mailSent ? "Check Your Email" : "Password Updated"}
            </h2>

            <div
              className={`text-sm leading-6 space-y-4 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              <p>
                {message || "Your password was updated successfully."}
              </p>

              <p className="text-xs opacity-80">
                {mailSent
                  ? "Use the reset link in your email to create a new password. The link expires in 1 hour."
                  : "You can now sign in with your new password."}
              </p>
            </div>

            <Button
              onClick={() => navigate("/login")}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
            >
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

export default ForgotPassword;
