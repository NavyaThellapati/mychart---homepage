import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Globe, Accessibility } from "lucide-react";
import authService from "../../services/authService";

export function Login(): JSX.Element {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(username, password);
      
      if (response.success) {
        // Redirect to dashboard on successful login
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Heart with Heartbeat */}
      <div className="w-1/2 relative overflow-hidden">
        <img
          src="https://c.animaapp.com/mhkp6uvn3Dubvu/img/image.png"
          alt="Heart with heartbeat"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* MyChart Logo Text */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-6">
              <span className="text-[#1E88E5]">My</span>
              <span className="text-[#EF5350]">Chart</span>
            </h1>
            <h2 className="text-3xl font-semibold text-gray-800">Log in</h2>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            {/* Username Input */}
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 bg-white border-gray-200 rounded-lg text-base px-4"
              />
            </div>

            {/* Password Input */}
            <div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 bg-white border-gray-200 rounded-lg text-base px-4"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]"
                />
                <label htmlFor="remember" className="text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-[#1E88E5] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              className="w-full h-14 bg-[#4A90E2] hover:bg-[#357ABD] text-white font-semibold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!username || !password || loading}
              onClick={handleLogin}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {/* Create Account Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-700">
                Don't have an Account?{" "}
                <Link
                  to="/register"
                  className="text-[#1E88E5] hover:underline font-medium"
                >
                  Create Account
                </Link>
              </p>
            </div>

            {/* Language & Accessibility */}
            <div className="flex items-center justify-between pt-4">
              <button className="flex items-center gap-2 text-[#1E88E5] hover:underline text-sm font-medium">
                <Globe className="w-4 h-4" />
                Language
              </button>
              <button className="flex items-center gap-2 text-[#1E88E5] hover:underline text-sm font-medium">
                <Accessibility className="w-4 h-4" />
                Accessibility
              </button>
            </div>

            {/* Back to Home */}
            <div className="text-center pt-4">
              <Link
                to="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
