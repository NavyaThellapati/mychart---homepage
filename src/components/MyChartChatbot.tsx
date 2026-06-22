import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  Calendar,
  CreditCard,
  FileText,
  MessageCircle,
  Pill,
  Send,
  X,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

type Message = {
  id: number;
  sender: "assistant" | "user";
  text: string;
};

const copy = {
  en: {
    title: "MyChart Assistant",
    status: "Portal help",
    open: "Open MyChart Assistant",
    close: "Close chatbot",
    welcome:
      "Hi! I can help you find appointments, test results, billing, medications, or secure messages.",
    placeholder: "Ask about your portal...",
    send: "Send message",
    disclaimer:
      "For emergencies, call 911. This assistant does not provide medical advice.",
    quick: [
      { label: "Appointments", path: "/appointments", icon: Calendar },
      { label: "Test Results", path: "/test-results", icon: FileText },
      { label: "Billing", path: "/billing", icon: CreditCard },
      { label: "Medications", path: "/medications", icon: Pill },
    ],
    replies: {
      appointment:
        "I can take you to appointments, where you can review visits or schedule a new one.",
      results:
        "Your test results are available in the Test Results section of the portal.",
      billing:
        "You can review balances, payment history, and available payment actions on the Billing page.",
      medication:
        "The Medications page shows your prescriptions and refill information.",
      message:
        "Use Secure Messages to read messages or contact your care team.",
      password:
        "Select Forgot password on the login page to request a reset link.",
      emergency:
        "If this is a medical emergency, call 911 immediately. For urgent medical concerns, contact a healthcare professional.",
      default:
        "I can help with appointments, test results, billing, medications, messages, login, and password reset.",
    },
  },
  es: {
    title: "Asistente de MyChart",
    status: "Ayuda del portal",
    open: "Abrir el asistente de MyChart",
    close: "Cerrar el chatbot",
    welcome:
      "¡Hola! Puedo ayudarle a encontrar citas, resultados, facturación, medicamentos o mensajes seguros.",
    placeholder: "Pregunte sobre su portal...",
    send: "Enviar mensaje",
    disclaimer:
      "Para emergencias, llame al 911. Este asistente no ofrece consejos médicos.",
    quick: [
      { label: "Citas", path: "/appointments", icon: Calendar },
      { label: "Resultados", path: "/test-results", icon: FileText },
      { label: "Facturación", path: "/billing", icon: CreditCard },
      { label: "Medicamentos", path: "/medications", icon: Pill },
    ],
    replies: {
      appointment:
        "Puedo llevarle a Citas, donde puede revisar sus visitas o programar una nueva.",
      results:
        "Sus resultados están disponibles en la sección Resultados del portal.",
      billing:
        "Puede revisar saldos, historial de pagos y opciones de pago en Facturación.",
      medication:
        "La página Medicamentos muestra sus recetas e información de renovaciones.",
      message:
        "Use Mensajes seguros para leer mensajes o contactar a su equipo de atención.",
      password:
        "Seleccione ¿Olvidó su contraseña? en la página de inicio de sesión para solicitar un enlace.",
      emergency:
        "Si es una emergencia médica, llame al 911 de inmediato. Para inquietudes urgentes, contacte a un profesional de salud.",
      default:
        "Puedo ayudar con citas, resultados, facturación, medicamentos, mensajes, inicio de sesión y contraseña.",
    },
  },
};

export function MyChartChatbot(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const text = copy[language];
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "assistant", text: text.welcome },
  ]);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages((current) => {
      if (current.length === 1 && current[0].sender === "assistant") {
        return [{ ...current[0], text: text.welcome }];
      }
      return current;
    });
  }, [text.welcome]);

  useEffect(() => {
    if (isOpen) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const getReply = (value: string) => {
    const normalized = value.toLowerCase();
    if (/emergency|urgent|chest pain|911|emergencia|urgente|dolor de pecho/.test(normalized)) {
      return text.replies.emergency;
    }
    if (/appointment|visit|schedule|doctor|cita|visita|programar|médico/.test(normalized)) {
      return text.replies.appointment;
    }
    if (/result|lab|test|resultado|laboratorio|prueba/.test(normalized)) {
      return text.replies.results;
    }
    if (/bill|payment|balance|invoice|factura|pago|saldo/.test(normalized)) {
      return text.replies.billing;
    }
    if (/medication|medicine|refill|prescription|medicamento|receta|renovación/.test(normalized)) {
      return text.replies.medication;
    }
    if (/message|provider|care team|mensaje|equipo/.test(normalized)) {
      return text.replies.message;
    }
    if (/password|login|sign in|contraseña|iniciar sesión/.test(normalized)) {
      return text.replies.password;
    }
    return text.replies.default;
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;

    const nextId = Date.now();
    setMessages((current) => [
      ...current,
      { id: nextId, sender: "user", text: value },
      { id: nextId + 1, sender: "assistant", text: getReply(value) },
    ]);
    setInput("");
  };

  const openSection = (path: string) => {
    if (location.pathname !== path) navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          role="dialog"
          aria-label={text.title}
          className="mb-4 flex h-[min(610px,calc(100vh-110px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <header className="flex h-16 shrink-0 items-center justify-between bg-[#1E88E5] px-4 text-white dark:bg-[#0b1623]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-bold">{text.title}</h2>
                <p className="flex items-center gap-1.5 text-xs text-blue-50 dark:text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  {text.status}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={text.close}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <p
                  className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-5 shadow-sm ${
                    message.sender === "user"
                      ? "bg-[#1E88E5] text-white"
                      : "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 grid grid-cols-2 gap-2">
              {text.quick.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.path}
                    type="button"
                    onClick={() => openSection(action.path)}
                    className="flex min-h-10 items-center gap-2 rounded-md border border-slate-200 px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#1E88E5]" aria-hidden="true" />
                    {action.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={text.placeholder}
                aria-label={text.placeholder}
                className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1E88E5] focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label={text.send}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#1E88E5] text-white hover:bg-[#1976d2] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send className="h-5 w-5" aria-hidden="true" />
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] leading-4 text-slate-500 dark:text-slate-400">
              {text.disclaimer}
            </p>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? text.close : text.open}
        aria-expanded={isOpen}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1E88E5] text-white shadow-xl transition hover:bg-[#1976d2] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 dark:bg-blue-600 dark:focus-visible:ring-blue-900"
      >
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-7 w-7" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
