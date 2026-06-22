import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock,
  DollarSign,
  MessageSquare,
  Pill,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { HeaderSection } from "../../components/HeaderSection";
import authService from "../../services/authService";
import { useLanguage } from "../../contexts/LanguageContext";

export function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const text = {
    en: {
      secure: "Secure patient dashboard",
      welcome: "Welcome back",
      subtitle:
        "Review upcoming care, messages, test results, billing, and medications from one organized workspace.",
      newAppointment: "New Appointment",
      newMessage: "New Message",
      quickActions: "Quick Actions",
      chooseTask: "Choose a task to continue",
      careTimeline: "Care Timeline",
      nextSteps: "Next steps for your care",
      portalStatus: "Portal Status",
      updated: "Updated just now",
      status:
        "Your account is active and protected. Review new messages and results as they become available.",
      features: [
        ["Appointments", "Schedule, review, or reschedule visits."],
        ["Test Results", "Review recent labs and reports."],
        ["Billing", "View balances and make payments."],
        ["Messages", "Contact your care team securely."],
        ["Medications", "Track prescriptions and refills."],
      ],
      summary: [
        ["Upcoming Visit", "May 30", "Primary care at 10:30 AM"],
        ["New Results", "2", "Ready for review"],
        ["Balance Due", "$86.40", "Payment available"],
      ],
      care: [
        ["Annual wellness check", "Friday, May 30 at 10:30 AM"],
        ["Medication refill", "Lisinopril refill due in 6 days"],
        ["Secure message", "1 unread response from your care team"],
      ],
    },
    es: {
      secure: "Panel seguro del paciente",
      welcome: "Bienvenida de nuevo",
      subtitle:
        "Revise próximas citas, mensajes, resultados, facturación y medicamentos desde un espacio organizado.",
      newAppointment: "Nueva cita",
      newMessage: "Nuevo mensaje",
      quickActions: "Acciones rápidas",
      chooseTask: "Elija una tarea para continuar",
      careTimeline: "Cronología de atención",
      nextSteps: "Próximos pasos para su atención",
      portalStatus: "Estado del portal",
      updated: "Actualizado ahora",
      status:
        "Su cuenta está activa y protegida. Revise nuevos mensajes y resultados cuando estén disponibles.",
      features: [
        ["Citas", "Programe, revise o cambie visitas."],
        ["Resultados", "Revise laboratorios e informes recientes."],
        ["Facturación", "Vea saldos y realice pagos."],
        ["Mensajes", "Contacte a su equipo de atención de forma segura."],
        ["Medicamentos", "Controle recetas y renovaciones."],
      ],
      summary: [
        ["Próxima visita", "30 de mayo", "Atención primaria a las 10:30 AM"],
        ["Nuevos resultados", "2", "Listos para revisar"],
        ["Saldo pendiente", "$86.40", "Pago disponible"],
      ],
      care: [
        ["Chequeo anual", "Viernes, 30 de mayo a las 10:30 AM"],
        ["Renovación de medicamento", "Lisinopril vence en 6 días"],
        ["Mensaje seguro", "1 respuesta sin leer de su equipo de atención"],
      ],
    },
  }[language];

  const features = [
    {
      icon: Calendar,
      title: text.features[0][0],
      description: text.features[0][1],
      path: "/appointments",
    },
    {
      icon: ClipboardList,
      title: text.features[1][0],
      description: text.features[1][1],
      path: "/test-results",
    },
    {
      icon: DollarSign,
      title: text.features[2][0],
      description: text.features[2][1],
      path: "/billing",
    },
    {
      icon: MessageSquare,
      title: text.features[3][0],
      description: text.features[3][1],
      path: "/messages",
    },
    {
      icon: Pill,
      title: text.features[4][0],
      description: text.features[4][1],
      path: "/medications",
    },
  ];

  const summaryItems = [
    {
      label: text.summary[0][0],
      value: text.summary[0][1],
      detail: text.summary[0][2],
      icon: Calendar,
    },
    {
      label: text.summary[1][0],
      value: text.summary[1][1],
      detail: text.summary[1][2],
      icon: Activity,
    },
    {
      label: text.summary[2][0],
      value: text.summary[2][1],
      detail: text.summary[2][2],
      icon: DollarSign,
    },
  ];

  const careItems = [
    { title: text.care[0][0], detail: text.care[0][1] },
    { title: text.care[1][0], detail: text.care[1][1] },
    { title: text.care[2][0], detail: text.care[2][1] },
  ];

  return (
    <div
      className="dashboard-page min-h-screen bg-[#eef5ff] text-slate-900 transition-colors duration-300 dark:bg-[#07111f] dark:text-white"
      style={{
        backgroundColor:
          localStorage.getItem("theme") === "dark" ? "#07111f" : "#eef5ff",
      }}
    >
      <HeaderSection />

      <main className="relative min-h-[calc(100vh-105px)] overflow-hidden px-6 py-8 lg:px-8">
        <div
          className="dashboard-bg-image absolute inset-0 bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/assets/dashboard-ai-background.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="dashboard-bg-overlay absolute inset-0 bg-white/65 backdrop-blur-[1px] dark:bg-[#020617]/48" />

        <div className="relative z-10 mx-auto max-w-7xl">
        <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#1E88E5]">
              <ShieldCheck className="h-4 w-4" />
              {text.secure}
            </p>
            <h1 className="text-4xl font-bold leading-tight text-[#172554] dark:text-white">
              {text.welcome}
              {currentUser?.firstName ? `, ${currentUser.firstName}` : ""}
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-700 dark:text-slate-300">
              {text.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate("/appointments/new")}
              className="h-11 rounded-lg bg-[#1E88E5] px-5 font-semibold text-white hover:bg-[#1976d2]"
            >
              {text.newAppointment}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/messages/new")}
              className="h-11 rounded-lg border-slate-300 bg-white px-5 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
            >
              {text.newMessage}
            </Button>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="dashboard-card rounded-lg border border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-[#111827]/90"
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-[#1E88E5] dark:bg-blue-950/40">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-950 dark:text-white">
                      {item.value}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {item.detail}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-[#1e2a4a] dark:text-white">
                {text.quickActions}
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {text.chooseTask}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    onClick={() => navigate(feature.path)}
                    className="dashboard-card group cursor-pointer rounded-lg border border-slate-200 bg-white/95 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[#1E88E5] hover:shadow-md dark:border-slate-700 dark:bg-[#111827]/90"
                  >
                    <CardContent className="flex min-h-[150px] flex-col justify-between p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1E88E5] text-white shadow-sm">
                          <Icon className="h-6 w-6" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#1E88E5]" />
                      </div>
                      <div>
                        <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <aside className="space-y-6">
            <Card className="dashboard-card rounded-lg border border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-[#111827]/90">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1E88E5] dark:bg-blue-950/40">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                      {text.careTimeline}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {text.nextSteps}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {careItems.map((item) => (
                    <div
                      key={item.title}
                      className="border-l-2 border-[#1E88E5] pl-4"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card rounded-lg border border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-[#111827]/90">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                      {text.portalStatus}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {text.updated}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {text.status}
                </p>
              </CardContent>
            </Card>
          </aside>
        </section>
        </div>
      </main>
    </div>
  );
}
