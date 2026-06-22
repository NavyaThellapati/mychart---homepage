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
    <header className="relative z-50 h-20 w-full border-b border-[#1976d2] bg-[#1E88E5] shadow-lg dark:border-slate-800 dark:bg-[#0b1623] lg:h-[88px]">
      <div className="flex h-full min-w-0 items-center justify-between gap-3 px-4 sm:px-5 lg:px-6 2xl:px-8">
        {/* Logo */}
        <div
          className="flex h-[60px] shrink-0 cursor-pointer items-center gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <HeartPulse className="h-10 w-10 text-red-500" />
          <div className="hidden text-[28px] font-semibold leading-normal text-white sm:block xl:text-[32px]">
            MyChart
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex xl:gap-2">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link key={index} to={item.path}>
                <Button
                  variant="ghost"
                  className="flex h-10 items-center gap-2 px-2 py-2 text-white transition-colors hover:bg-white/10 2xl:px-3"
                  aria-label={item.label}
                  title={item.label}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="hidden whitespace-nowrap text-base font-semibold 2xl:inline">
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
        <ThemeLanguageControls variant="dark" compact />

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            ref={menuButtonRef}
            onClick={(e) => { e.stopPropagation(); setShowUserMenu((v) => !v); }}
            className="flex h-11 items-center gap-1 rounded-full border border-white/20 bg-white px-3 text-slate-800 shadow-md transition-colors hover:bg-blue-50 hover:text-[#1E88E5] dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 sm:px-4"
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
