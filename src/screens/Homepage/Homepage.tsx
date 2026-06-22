import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ThemeLanguageControls } from "../../components/ThemeLanguageControls";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Calendar,
  FileText,
  CreditCard,
  Clock,
  ShieldCheck,
  MapPin,
} from "lucide-react";

export function Homepage(): JSX.Element {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language } = useLanguage();

  const text = {
    en: {
      welcome: "Welcome to",
      subtitle1: "Connecting you to better care anytime",
      subtitle2:
        "Access appointments, lab results, records, and bills in one place",
      login: "Login",
      create: "Create Account",
      dark: "Dark Mode",
      light: "Light Mode",
      footerDark: "Dark Theme",
      footerLight: "Light Theme",
      interoperability: "Interoperability Guide",
      faqs: "FAQs",
      privacy: "Privacy Policy",
      terms: "Terms and Conditions",
      features: [
        ["Manage Appointments", "Schedule, reschedule, or cancel visits easily."],
        ["View Lab Results", "Check your latest test results anytime."],
        ["Pay Bills", "Pay medical bills quickly and securely."],
        ["24/7 Access", "Access your health portal anytime, anywhere."],
        ["Secure Records", "Keep your medical information safe and private."],
        ["Care Locations", "Find doctors and services near your location."],
      ],
    },
    es: {
      welcome: "Bienvenido a",
      subtitle1: "Conectándote con mejor atención en cualquier momento",
      subtitle2:
        "Accede a citas, resultados, registros y facturas en un solo lugar",
      login: "Iniciar sesión",
      create: "Crear cuenta",
      dark: "Modo oscuro",
      light: "Modo claro",
      footerDark: "Tema oscuro",
      footerLight: "Tema claro",
      interoperability: "Guía de Interoperabilidad",
      faqs: "Preguntas",
      privacy: "Política de Privacidad",
      terms: "Términos y Condiciones",
      features: [
        ["Administrar Citas", "Programa, cambia o cancela visitas fácilmente."],
        ["Ver Resultados", "Consulta tus últimos resultados en cualquier momento."],
        ["Pagar Facturas", "Paga facturas médicas de forma rápida y segura."],
        ["Acceso 24/7", "Accede al portal de salud en cualquier momento."],
        ["Registros Seguros", "Mantén tu información médica segura y privada."],
        ["Ubicaciones", "Encuentra doctores y servicios cerca de ti."],
      ],
    },
  }[language];

  const icons = [Calendar, FileText, CreditCard, Clock, ShieldCheck, MapPin];

  const features = text.features.map(([title, description], index) => ({
    icon: icons[index],
    title,
    description,
    delay: `${600 + index * 100}ms`,
  }));

  return (
    <main className="bg-white overflow-hidden w-full min-h-screen relative">
      <div className="homepage-bg-wrapper absolute inset-0 z-0">
        <img
          className={`homepage-bg-img absolute inset-0 z-0 w-full h-full object-cover object-center transition-all duration-300 ${
            isDarkMode
              ? "brightness-[0.42] contrast-110 saturate-75 blur-[1.5px] scale-[1.02]"
              : "brightness-100 contrast-100 saturate-100 blur-0 scale-100"
          }`}
          alt="Healthcare background"
          src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=1800&q=90"
        />

        <div
          className={`homepage-bg-overlay absolute inset-0 z-[1] pointer-events-none transition-all duration-300 ${
            isDarkMode ? "bg-[#020617]/65" : "bg-white/20"
          }`}
        ></div>
      </div>

      <ThemeLanguageControls className="absolute top-8 right-8 z-30" />

      <header className="absolute top-8 left-8 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms] z-30">
        <img
          className="homepage-logo w-64 h-auto object-cover"
          alt="MyChart logo"
          src="https://c.animaapp.com/mhkp6uvn3Dubvu/img/mychart-logo-high-resolution-1-1.png"
        />
      </header>

      <section className="homepage-content-card absolute top-[8%] right-[4%] flex max-h-[calc(100vh-6rem)] flex-col gap-3 overflow-y-auto w-[43%] bg-white/65 backdrop-blur-md p-6 rounded-3xl shadow-xl z-20">
        <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          <h1 className="[font-family:'Inter',Helvetica] font-normal text-4xl tracking-[0] leading-tight mb-4">
            <span className="font-bold text-[#1e2a4a]">{text.welcome}</span>
            <br />
            <span className="font-bold text-[#2563eb]">My</span>
            <span className="font-bold text-[#e53935]">Chart</span>
          </h1>

          <p className="[font-family:'Inter',Helvetica] font-medium text-[#1e2a4a] text-lg tracking-[0] leading-relaxed mb-2">
            {text.subtitle1}
          </p>

          <p className="[font-family:'Inter',Helvetica] font-medium text-[#1e2a4a] text-lg tracking-[0] leading-relaxed">
            {text.subtitle2}
          </p>
        </div>

        <div className="flex gap-4 mt-2 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
          <Link to="/login">
            <Button className="px-10 h-13 bg-[#2563eb] hover:bg-[#1d4ed8] [font-family:'Inter',Helvetica] font-bold text-white text-lg transition-colors rounded-xl shadow-md">
              {text.login}
            </Button>
          </Link>

          <Link to="/register">
            <Button
              variant="outline"
              className="px-10 h-13 bg-white hover:bg-gray-50 border-2 border-gray-300 [font-family:'Inter',Helvetica] font-bold text-[#111111] text-lg transition-colors rounded-xl shadow-md"
            >
              {text.create}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:500ms]">
          {features.map((feature, index) => (
            <Card
              key={index}
              onClick={() => (window.location.href = "/login")}
              className="cursor-pointer bg-white/95 backdrop-blur-sm border-gray-200 shadow-md hover:shadow-xl transition-[transform,box-shadow] hover:scale-105 translate-y-[-1rem] animate-fade-in opacity-0 rounded-2xl"
              style={
                { "--animation-delay": feature.delay } as React.CSSProperties
              }
            >
              <CardContent className="flex min-h-[112px] flex-col items-center justify-start gap-1.5 p-3">
                <div className="w-10 h-10 flex items-center justify-center bg-[#2563eb] rounded-xl">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>

                <h3 className="[font-family:'Inter',Helvetica] font-bold text-[#2563eb] text-sm text-center">
                  {feature.title}
                </h3>

                <p className="[font-family:'Inter',Helvetica] font-normal text-gray-600 text-[11px] text-center leading-tight">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 px-8 py-2 z-30">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Download on the App Store">
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                className="h-9 w-auto"
              />
            </a>

            <a href="#" aria-label="Get it on Google Play">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                className="h-9 w-auto"
              />
            </a>
          </div>

          <div className="flex items-center gap-7 font-medium text-base">
            <Link to="/interoperability-guide" className="text-[#2563eb]">
              {text.interoperability}
            </Link>

            <Link to="/faqs" className="text-[#2563eb]">
              {text.faqs}
            </Link>

            <Link to="/privacy-policy" className="text-[#2563eb]">
              {text.privacy}
            </Link>

            <Link to="/terms-and-conditions" className="text-[#2563eb]">
              {text.terms}
            </Link>

            <button
              onClick={toggleTheme}
              className="font-medium border-none bg-transparent cursor-pointer text-[#2563eb]"
            >
              {isDarkMode ? text.footerLight : text.footerDark}
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
