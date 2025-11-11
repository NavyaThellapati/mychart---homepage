import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import authService from "../../services/authService";

export const Register = (): JSX.Element => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword,
      });
      
      if (response.success) {
        // Redirect to dashboard on successful registration
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="https://c.animaapp.com/mhkp6uvn3Dubvu/img/image_1.png"
              alt="Heart with heartbeat"
              className="w-16 h-16 object-contain"
            />
            <h1 className="text-4xl font-bold">
              <span className="text-[#1E88E5]">My</span>
              <span className="text-[#EF5350]">Chart</span>
            </h1>
          </div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-3">
            Create Your Account
          </h2>
          <p className="text-gray-600 text-base">
            Access your health information, schedule visits, and view results securely.
          </p>
        </div>

        {/* Registration Form */}
        <div className="space-y-4">
          {/* First Name */}
          <div>
            <Input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-14 bg-white border-gray-300 rounded-lg text-base px-4"
            />
          </div>

          {/* Last Name */}
          <div>
            <Input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-14 bg-white border-gray-300 rounded-lg text-base px-4"
            />
          </div>

          {/* Email Address */}
          <div>
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 bg-white border-gray-300 rounded-lg text-base px-4"
            />
          </div>

          {/* Phone Number */}
          <div>
            <Input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-14 bg-white border-gray-300 rounded-lg text-base px-4"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 bg-white border-gray-300 rounded-lg text-base px-4 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-14 bg-white border-gray-300 rounded-lg text-base px-4 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="w-4 h-4 mt-1 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the{" "}
              <Link to="/terms" className="text-[#1E88E5] hover:underline">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-[#1E88E5] hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
            </div>
          )}

          {/* Create Account Button */}
          <Button
            className="w-full h-14 bg-[#4A90E2] hover:bg-[#357ABD] text-white font-semibold text-lg rounded-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !firstName ||
              !lastName ||
              !email ||
              !phone ||
              !password ||
              !confirmPassword ||
              !agreeToTerms ||
              loading
            }
            onClick={handleRegister}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          {/* Already have account */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#1E88E5] hover:underline font-medium"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
