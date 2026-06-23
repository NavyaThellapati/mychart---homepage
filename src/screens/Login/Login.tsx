import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Globe,
  Accessibility,
  HeartPulse,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import authService from "../../services/authService";
import { ThemeLanguageControls } from "../../components/ThemeLanguageControls";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";

export function Login(): JSX.Element {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);
  const [largeText, setLargeText] = useState(
    localStorage.getItem("accessibility-large-text") === "true"
  );
  const [highContrast, setHighContrast] = useState(
    localStorage.getItem("accessibility-high-contrast") === "true"
  );
  const [reducedMotion, setReducedMotion] = useState(
    localStorage.getItem("accessibility-reduced-motion") === "true"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [otp, setOtp] = useState("");

  const isDark = isDarkMode;

  const translations = {
    en: {
      heroTitle: "Your health, clearly connected.",
      heroSubtitle:
        "Access appointments, test results, medications, billing, and secure messages in one simple patient portal.",
      portalAccess: "Portal Access",
      healthRecords: "Health Records",
      welcome: "Welcome Back",
      subtitle: "Sign in to access your health portal",
      username: "Username or Email",
      password: "Password",
      remember: "Remember me",
      forgot: "Forgot password?",
      login: "Login",
      logging: "Logging in...",
      secure: "Secure patient portal access",
      noAccount: "Don’t have an account?",
      create: "Create Account",
      language: "Language",
      accessibility: "Accessibility",
      largeText: "Large text",
      highContrast: "High contrast",
      reducedMotion: "Reduce motion",
      backHome: "← Back to Home",
      loginFailed: "Login failed. Please try again.",
      mfaCode: "Verification code",
      mfaHelp: "Enter the 6-digit code sent to your email.",
      verify: "Verify code",
      verifying: "Verifying...",
    },
    es: {
      heroTitle: "Su salud, claramente conectada.",
      heroSubtitle:
        "Acceda a citas, resultados de pruebas, medicamentos, facturación y mensajes seguros en un solo portal para pacientes.",
      portalAccess: "Acceso al portal",
      healthRecords: "Registros de salud",
      welcome: "Bienvenido de nuevo",
      subtitle: "Inicie sesión para acceder a su portal de salud",
      username: "Usuario o correo electrónico",
      password: "Contraseña",
      remember: "Recordarme",
      forgot: "¿Olvidó su contraseña?",
      login: "Iniciar sesión",
      logging: "Iniciando sesión...",
      secure: "Acceso seguro al portal del paciente",
      noAccount: "¿No tiene una cuenta?",
      create: "Crear cuenta",
      language: "Idioma",
      accessibility: "Accesibilidad",
      largeText: "Texto grande",
      highContrast: "Alto contraste",
      reducedMotion: "Reducir movimiento",
      backHome: "← Volver al inicio",
      loginFailed: "Error al iniciar sesión. Inténtelo de nuevo.",
      mfaCode: "Código de verificación",
      mfaHelp: "Ingrese el código de 6 dígitos enviado a su correo electrónico.",
      verify: "Verificar código",
      verifying: "Verificando...",
    },
  };

  const t = translations[language];

  useEffect(() => {
    const savedLanguage =
      (localStorage.getItem("language") as "en" | "es") || "en";

    setLanguage(savedLanguage);
  }, [setLanguage]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-large-text",
      String(largeText)
    );
    document.documentElement.setAttribute(
      "data-high-contrast",
      String(highContrast)
    );
    document.documentElement.setAttribute(
      "data-reduced-motion",
      String(reducedMotion)
    );

    localStorage.setItem("accessibility-large-text", String(largeText));
    localStorage.setItem("accessibility-high-contrast", String(highContrast));
    localStorage.setItem(
      "accessibility-reduced-motion",
      String(reducedMotion)
    );
  }, [largeText, highContrast, reducedMotion]);

  const changeLanguage = (lang: "en" | "es") => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    setShowLanguageMenu(false);
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(username, password);

      if (response.mfaRequired && response.mfaToken) {
        setMfaToken(response.mfaToken);
        return;
      }

      if (response.success) {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || t.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await authService.verifyOtp(mfaToken, otp);
      if (response.success) {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || t.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`login-accessibility-scope min-h-screen flex items-center justify-center px-6 py-10 ${
        isDark
          ? "bg-gradient-to-br from-[#071827] via-[#0b2538] to-[#123047]"
          : "bg-gradient-to-br from-blue-50 via-white to-cyan-50"
      }`}
    >
      <ThemeLanguageControls className="absolute right-6 top-6 z-20" />

      <div
        className={`w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-[32px] overflow-hidden shadow-2xl border ${
          isDark
            ? "bg-[#0b1623]/95 border-[#28506b]"
            : "bg-white border-blue-100"
        }`}
      >
        <section
          className={`hidden lg:flex flex-col justify-center p-14 ${
            isDark
              ? "bg-gradient-to-br from-[#102a43] via-[#164e63] to-[#0f766e] border-r border-[#2f6f7e]"
              : "bg-gradient-to-br from-blue-600 to-cyan-500"
          }`}
        >
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${
              isDark
                ? "bg-white/10 border border-white/20 backdrop-blur-md"
                : "bg-white/20"
            }`}
          >
            <HeartPulse className="w-11 h-11 text-white" />
          </div>

          <h1 className="text-5xl font-bold text-white leading-tight mb-5">
            {t.heroTitle}
          </h1>

          <p className="text-lg leading-8 max-w-md text-blue-50">
            {t.heroSubtitle}
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl p-5 border bg-white/10 border-white/20 backdrop-blur-md">
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-sm mt-1 text-blue-50">{t.portalAccess}</p>
            </div>

            <div className="rounded-2xl p-5 border bg-white/10 border-white/20 backdrop-blur-md">
              <p className="text-3xl font-bold text-white">Secure</p>
              <p className="text-sm mt-1 text-blue-50">{t.healthRecords}</p>
            </div>
          </div>
        </section>

        <section
          className={`px-8 py-12 sm:px-12 lg:px-14 ${
            isDark ? "bg-[#07111f]" : "bg-white"
          }`}
        >
          <div className="max-w-md mx-auto">
            <div className="text-center mb-9">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 mb-5">
                <HeartPulse className="w-9 h-9 text-white" />
              </div>

              <h2
                className={`text-4xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {t.welcome}
              </h2>

              <p
                className={`mt-2 ${
                  isDark ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {t.subtitle}
              </p>
            </div>

            <div className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder={t.username}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`h-14 pl-12 rounded-xl text-base ${
                    isDark
                      ? "bg-[#102033] border-[#36566f] text-white placeholder:text-slate-400"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-14 pl-12 pr-12 rounded-xl text-base ${
                    isDark
                      ? "bg-[#102033] border-[#36566f] text-white placeholder:text-slate-400"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                  />
                  {t.remember}
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-500 hover:underline font-medium"
                >
                  {t.forgot}
                </Link>
              </div>

              {mfaToken && (
                <div className="space-y-3">
                  <p
                    className={`text-sm ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {t.mfaHelp}
                  </p>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder={t.mfaCode}
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className={`h-14 rounded-xl text-base tracking-[0.3em] ${
                      isDark
                        ? "bg-[#102033] border-[#36566f] text-white placeholder:text-slate-400"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              )}

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
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg shadow-blue-600/25 disabled:opacity-50"
                disabled={
                  mfaToken
                    ? otp.length !== 6 || loading
                    : !username || !password || loading
                }
                onClick={mfaToken ? handleOtpVerification : handleLogin}
              >
                {mfaToken
                  ? loading
                    ? t.verifying
                    : t.verify
                  : loading
                    ? t.logging
                    : t.login}
              </Button>

              <div
                className={`flex items-center justify-center gap-2 text-sm pt-1 ${
                  isDark ? "text-slate-300" : "text-slate-500"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {t.secure}
              </div>

              <p
                className={`text-center text-sm pt-2 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {t.noAccount}{" "}
                <Link
                  to="/register"
                  className="text-blue-500 hover:underline font-semibold"
                >
                  {t.create}
                </Link>
              </p>

              <div
                className={`flex items-center justify-between pt-5 border-t ${
                  isDark ? "border-[#28445a]" : "border-slate-200"
                }`}
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className="flex items-center gap-2 text-blue-500 hover:underline text-sm font-medium"
                  >
                    <Globe className="w-4 h-4" />
                    {language === "en" ? "English" : "Español"}
                  </button>

                  {showLanguageMenu && (
                    <div
                      className={`absolute bottom-full mb-3 left-0 w-40 rounded-xl shadow-lg border overflow-hidden z-50 ${
                        isDark
                          ? "bg-[#102033] border-[#36566f]"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => changeLanguage("en")}
                        className={`w-full px-4 py-2 text-left text-sm ${
                          isDark
                            ? "text-white hover:bg-[#18324d]"
                            : "text-slate-700 hover:bg-blue-50"
                        }`}
                      >
                        English
                      </button>

                      <button
                        type="button"
                        onClick={() => changeLanguage("es")}
                        className={`w-full px-4 py-2 text-left text-sm ${
                          isDark
                            ? "text-white hover:bg-[#18324d]"
                            : "text-slate-700 hover:bg-blue-50"
                        }`}
                      >
                        Español
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowAccessibilityMenu(!showAccessibilityMenu)
                    }
                    aria-expanded={showAccessibilityMenu}
                    aria-controls="login-accessibility-menu"
                    className="flex items-center gap-2 text-blue-500 hover:underline text-sm font-medium"
                  >
                    <Accessibility className="w-4 h-4" />
                    {t.accessibility}
                  </button>

                  {showAccessibilityMenu && (
                    <div
                      id="login-accessibility-menu"
                      className={`absolute bottom-full mb-3 right-0 w-64 rounded-xl shadow-lg border p-4 z-50 ${
                        isDark
                          ? "bg-[#102033] border-[#36566f]"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="space-y-3">
                        {[
                          {
                            label: t.largeText,
                            checked: largeText,
                            onChange: setLargeText,
                          },
                          {
                            label: t.highContrast,
                            checked: highContrast,
                            onChange: setHighContrast,
                          },
                          {
                            label: t.reducedMotion,
                            checked: reducedMotion,
                            onChange: setReducedMotion,
                          },
                        ].map((option) => (
                          <label
                            key={option.label}
                            className={`flex items-center justify-between gap-3 text-sm ${
                              isDark ? "text-white" : "text-slate-700"
                            }`}
                          >
                            <span>{option.label}</span>
                            <input
                              type="checkbox"
                              checked={option.checked}
                              onChange={(event) =>
                                option.onChange(event.target.checked)
                              }
                              className="w-5 h-5 rounded border-slate-300 accent-blue-600"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/"
                  className={`text-sm hover:text-blue-500 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {t.backHome}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
