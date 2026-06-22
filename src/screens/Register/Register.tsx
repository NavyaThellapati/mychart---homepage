import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import authService from "../../services/authService";
import { ThemeLanguageControls } from "../../components/ThemeLanguageControls";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";

export const Register = (): JSX.Element => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();
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
  const isDark = isDarkMode;

  const text = {
    en: {
      title: "Create Your Account",
      subtitle:
        "Access your health information, schedule visits, and view results securely.",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone number",
      password: "Password",
      confirmPassword: "Confirm Password",
      agree: "I agree to the",
      terms: "Terms & Conditions",
      and: "and",
      privacy: "Privacy Policy",
      creating: "Creating Account...",
      create: "Create Account",
      already: "Already have an account?",
      login: "Log In",
      passwordsMatch: "Passwords do not match",
      passwordLength: "Password must be at least 6 characters",
      failed: "Registration failed. Please try again.",
    },
    es: {
      title: "Crear su cuenta",
      subtitle:
        "Acceda a su información de salud, programe visitas y vea resultados de forma segura.",
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Correo electrónico",
      phone: "Número de teléfono",
      password: "Contraseña",
      confirmPassword: "Confirmar contraseña",
      agree: "Acepto los",
      terms: "Términos y condiciones",
      and: "y la",
      privacy: "Política de privacidad",
      creating: "Creando cuenta...",
      create: "Crear cuenta",
      already: "¿Ya tiene una cuenta?",
      login: "Iniciar sesión",
      passwordsMatch: "Las contraseñas no coinciden",
      passwordLength: "La contraseña debe tener al menos 6 caracteres",
      failed: "No se pudo registrar. Inténtelo de nuevo.",
    },
  }[language];

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleRegister = async () => {
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError(text.passwordsMatch);
      return;
    }

    if (password.length < 6) {
      setError(text.passwordLength);
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
      setError(err.message || text.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-8 transition-colors ${
        isDark
          ? "bg-gradient-to-br from-[#071827] via-[#0b2538] to-[#123047]"
          : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      <ThemeLanguageControls className="absolute right-6 top-6 z-20" />

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
          <h2
            className={`text-3xl font-semibold mb-3 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            {text.title}
          </h2>
          <p className={`text-base ${isDark ? "text-slate-300" : "text-gray-600"}`}>
            {text.subtitle}
          </p>
        </div>

        {/* Registration Form */}
        <div
          className={`space-y-4 rounded-3xl border p-6 shadow-2xl ${
            isDark
              ? "bg-[#07111f] border-[#28506b]"
              : "bg-white/80 border-blue-100"
          }`}
        >
          {/* First Name */}
          <div>
            <Input
              type="text"
              placeholder={text.firstName}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`h-14 rounded-lg text-base px-4 ${
                isDark
                  ? "bg-[#102033] border-[#36566f] text-white placeholder:text-slate-400"
                  : "bg-white border-gray-300 text-slate-900"
              }`}
            />
          </div>

          {/* Last Name */}
          <div>
            <Input
              type="text"
              placeholder={text.lastName}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`h-14 rounded-lg text-base px-4 ${
                isDark
                  ? "bg-[#102033] border-[#36566f] text-white placeholder:text-slate-400"
                  : "bg-white border-gray-300 text-slate-900"
              }`}
            />
          </div>

          {/* Email Address */}
          <div>
            <Input
              type="email"
              placeholder={text.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`h-14 rounded-lg text-base px-4 ${
                isDark
                  ? "bg-[#102033] border-[#36566f] text-white placeholder:text-slate-400"
                  : "bg-white border-gray-300 text-slate-900"
              }`}
            />
          </div>

          {/* Phone Number */}
          <div>
            <Input
              type="tel"
              placeholder={text.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`h-14 rounded-lg text-base px-4 ${
                isDark
                  ? "bg-[#102033] border-[#36566f] text-white placeholder:text-slate-400"
                  : "bg-white border-gray-300 text-slate-900"
              }`}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={text.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`h-14 rounded-lg text-base px-4 pr-12 ${
                isDark
                  ? "bg-[#102033] border-[#36566f] text-white placeholder:text-slate-400"
                  : "bg-white border-gray-300 text-slate-900"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                isDark
                  ? "text-slate-400 hover:text-blue-400"
                  : "text-gray-500 hover:text-gray-700"
              }`}
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
              placeholder={text.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`h-14 rounded-lg text-base px-4 pr-12 ${
                isDark
                  ? "bg-[#102033] border-[#36566f] text-white placeholder:text-slate-400"
                  : "bg-white border-gray-300 text-slate-900"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                isDark
                  ? "text-slate-400 hover:text-blue-400"
                  : "text-gray-500 hover:text-gray-700"
              }`}
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
            <label
              htmlFor="terms"
              className={`text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}
            >
              {text.agree}{" "}
              <Link
                to="/terms-and-conditions"
                className="text-[#1E88E5] hover:underline"
              >
                {text.terms}
              </Link>{" "}
              {text.and}{" "}
              <Link
                to="/privacy-policy"
                className="text-[#1E88E5] hover:underline"
              >
                {text.privacy}
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
            {loading ? text.creating : text.create}
          </Button>

          {/* Already have account */}
          <div className="text-center pt-4">
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>
              {text.already}{" "}
              <Link
                to="/login"
                className="text-[#1E88E5] hover:underline font-medium"
              >
                {text.login}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
