import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home as HomeIcon,
  Calendar as CalendarIcon,
  ClipboardList as ClipboardListIcon,
  DollarSign as DollarSignIcon,
  Pill as PillIcon,
  MessageSquare as MessageSquareIcon,
  User,
  ChevronDown,
  HeartPulse,
  Settings,
  Palette,
  LogOut,
  FileText,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { ThemeLanguageControls } from "./ThemeLanguageControls";

const labels = {
  en: {
    nav: {
      home: "Home",
      appointments: "Appointments",
      testResults: "Test Results",
      billing: "Billing",
      medications: "Medications",
      messages: "Messages",
    },
    profile: "Profile",
    settings: "Account Settings",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    logout: "Logout",
  },
  es: {
    nav: {
      home: "Inicio",
      appointments: "Citas",
      testResults: "Resultados",
      billing: "Facturación",
      medications: "Medicamentos",
      messages: "Mensajes",
    },
    profile: "Perfil",
    settings: "Configuración",
    theme: "Tema",
    dark: "Oscuro",
    light: "Claro",
    logout: "Cerrar sesión",
  },
};

export function HeaderSection(): JSX.Element {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const t = labels[language];

  const navigationItems = [
    { icon: HomeIcon, label: t.nav.home, path: "/dashboard" },
    { icon: CalendarIcon, label: t.nav.appointments, path: "/appointments" },
    { icon: FileText, label: t.nav.testResults, path: "/test-results" },
    { icon: DollarSignIcon, label: t.nav.billing, path: "/billing" },
    { icon: PillIcon, label: t.nav.medications, path: "/medications" },
    { icon: MessageSquareIcon, label: t.nav.messages, path: "/messages" },
  ];

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showUserMenu]);

  const handleLogout = () => {
    // In a real app, you'd call authService.logout()
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowUserMenu(false);
    navigate("/login", { replace: true });
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setShowUserMenu(false);
  };

  const handleProfile = () => { setShowUserMenu(false); navigate("/profile"); };
  const handleSettings = () => { setShowUserMenu(false); navigate("/settings"); };

  return (
    <header className="w-full h-[96px] bg-[#1E88E5] relative z-50 shadow-lg border-b border-[#1976d2] dark:bg-[#0b1623] dark:border-slate-800">
      <div className="flex items-center justify-between h-full px-[51px]">
        {/* Logo */}
        <div
          className="flex items-center gap-3 h-[67px] cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <HeartPulse className="w-[50px] h-[50px] text-red-500" />
          <div className="[font-family:'Inter',Helvetica] font-semibold text-white text-[38px] tracking-[0] leading-[normal]">
            MyChart
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-8 h-full">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link key={index} to={item.path}>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-auto px-4 py-2 text-white hover:bg-white/10 transition-colors"
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="[font-family:'Inter',Helvetica] font-semibold text-lg tracking-[0] leading-[normal] whitespace-nowrap">
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
        <ThemeLanguageControls variant="dark" />

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            ref={menuButtonRef}
            onClick={(e) => { e.stopPropagation(); setShowUserMenu((v) => !v); }}
            className="flex items-center gap-2 bg-white text-slate-800 px-5 py-2.5 rounded-full hover:bg-blue-50 hover:text-[#1E88E5] transition-colors shadow-md border border-white/20 dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-white/15"
            aria-haspopup="menu"
            aria-expanded={showUserMenu}
          >
            <User className="w-5 h-5" />
            <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
          </button>

          {showUserMenu && (
            <div
              role="menu"
              aria-label="User menu"
              className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl border border-gray-200 py-2 z-50
                         bg-white dark:bg-[#121826] dark:border-gray-700"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleProfile}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-[#161e2d] flex items-center gap-3"
              >
                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-800 dark:text-gray-100 font-medium">{t.profile}</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleSettings}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-[#161e2d] flex items-center gap-3"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-800 dark:text-gray-100 font-medium">{t.settings}</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleThemeToggle}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-[#161e2d] flex items-center gap-3"
              >
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
                <span className="text-gray-800 dark:text-gray-100 font-medium">
                  {t.theme} {isDarkMode ? `(${t.dark})` : `(${t.light})`}
                </span>
              </button>

              <div className="border-t border-gray-200 my-2 dark:border-gray-700" />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-[#2a0f12] flex items-center gap-3"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="text-red-600 font-medium">{t.logout}</span>
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}
