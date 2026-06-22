import React from "react";
import { Globe, Moon, Sun } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

interface ThemeLanguageControlsProps {
  variant?: "light" | "dark";
  className?: string;
}

export function ThemeLanguageControls({
  variant = "light",
  className = "",
}: ThemeLanguageControlsProps): JSX.Element {
  const { language, setLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const isDarkVariant = variant === "dark";

  const controlClass = isDarkVariant
    ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
    : "border-slate-200 bg-white text-slate-800 hover:bg-blue-50";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <label
        className={`flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold shadow-sm ${controlClass}`}
      >
        <Globe className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Language</span>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as "en" | "es")}
          className="cursor-pointer bg-transparent font-semibold outline-none"
          aria-label="Language"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </label>

      <button
        type="button"
        onClick={toggleTheme}
        className={`flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm transition-colors ${controlClass}`}
        aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Moon className="h-5 w-5" aria-hidden="true" />
        )}
        <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
      </button>
    </div>
  );
}
