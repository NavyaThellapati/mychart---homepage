import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Calendar, ClipboardList, DollarSign, Pill, MessageSquare,
  User, ChevronDown, UserCircle, Palette, LogOut, Settings, HeartPulse
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import authService from "../../services/authService";
import { HeaderSection } from "../../components/HeaderSection";

export function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  /** Static UI data */
  const features = [
    { icon: Calendar,       title: "Appointments",       description: "View schedule or reschedule visits", path: "/appointments" },
    { icon: ClipboardList,  title: "Test Results",       description: "Check your recent results", path: "/test-results" },
    { icon: DollarSign,     title: "Billing & Payments", description: "View bills and make secure payments", path: "/billing" },
    { icon: MessageSquare,  title: "Messages",           description: "Communicate with your care team", path: "/messages" },
    { icon: Pill,           title: "Medications",        description: "Review and manage your subscriptions", path: "/medications" },
  ];

  return (
    <div
      className={`
        min-h-screen relative overflow-hidden transition-colors duration-300
        bg-gradient-to-b from-[#E7F1FF] to-[#F9FCFF]
        dark:from-[#0F172A] dark:to-[#0B1220]
      `}
    >
      {/* Background illustration (non-interactive) */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply dark:mix-blend-normal"
        style={{
          backgroundImage:
            'url(https://c.animaapp.com/mhkp6uvn3Dubvu/img/whatsapp_image_2025-11-06_at_10-00-17_am-removebg-preview.png)',
          backgroundSize: "64%",
          backgroundPosition: "center 60%",
          backgroundRepeat: "no-repeat",
          opacity: 0.5,
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0) 100%)",
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0) 100%)",
        }}
      />

      <HeaderSection /> {/* Use the global HeaderSection */}

      {/* Main */}
      <main className="container mx-auto px-8 py-16 relative z-10">
        <div className="text-left mb-16">
          <h1 className="text-6xl font-bold mb-4 text-[#1e2a4a] dark:text-white transition-colors">
            Welcome back{currentUser?.firstName ? `, ${currentUser.firstName}` : ""}!!!
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 transition-colors">
            Your health information at a glance.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Top row */}
          <div className="grid grid-cols-4 gap-8 mb-8 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {features.slice(0, 4).map((f, i) => {
              const Icon = f.icon;
              return (
                <Card
                  key={i}
                  onClick={() => f.path && navigate(f.path)}
                  className="rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg
                             hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer
                             bg-white/90 dark:bg-[#111827]/90 backdrop-blur"
                >
                  <CardContent className="flex flex-col items-center text-center p-8">
                    <div className="w-20 h-20 rounded-2xl bg-[#1E88E5] flex items-center justify-center mb-5 shadow-md">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{f.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Center card */}
          <div className="flex justify-center">
            <Card 
              onClick={() => features[4].path && navigate(features[4].path)}
              className="w-full max-w-sm rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg
                             hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer
                             bg-white/90 dark:bg-[#111827]/90 backdrop-blur">
              <CardContent className="flex flex-col items-center text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-[#1E88E5] flex items-center justify-center mb-5 shadow-md">
                  <Pill className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{features[4].title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{features[4].description}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
