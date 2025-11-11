import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Calendar, FileText, CreditCard } from "lucide-react";

export function Homepage(): JSX.Element {
  const features = [
    {
      icon: Calendar,
      title: "Manage Appointments",
      description: "Easily schedule, reschedule, or cancel visits.",
      delay: "600ms",
    },
    {
      icon: FileText,
      title: "View Lab Results",
      description: "Check your latest test results anytime.",
      delay: "700ms",
    },
    {
      icon: CreditCard,
      title: "Pay Bills",
      description: "Quickly pay securely with one click.",
      delay: "800ms",
    },
  ];

  return (
    <main
      className="bg-white overflow-hidden w-full min-h-screen relative"
      data-model-id="1:272"
    >
      <div className="absolute top-0 left-0 w-full h-full">
        <img
          className="w-full h-full object-cover"
          alt="Healthcare professional"
          src="https://c.animaapp.com/mhkp6uvn3Dubvu/img/chatgpt-image-oct-15--2025--05-26-42-pm-1.png"
        />
      </div>

      <header className="absolute top-8 left-8 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms]">
        <img
          className="w-64 h-auto object-cover"
          alt="MyChart logo"
          src="https://c.animaapp.com/mhkp6uvn3Dubvu/img/mychart-logo-high-resolution-1-1.png"
        />
      </header>

      <section className="absolute top-[15%] right-[1%] flex flex-col gap-6 w-[42%]">
        <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          <h1 className="[font-family:'Inter',Helvetica] font-normal text-6xl tracking-[0] leading-tight mb-6">
            <span className="font-bold text-[#1e2a4a]">Welcome to</span>
            <br />
            <span className="font-bold text-[#1e88e5]">My</span>
            <span className="font-bold text-[#e53935]">Chart</span>
          </h1>
          <p className="[font-family:'Inter',Helvetica] font-medium text-[#1e2a4a] text-2xl tracking-[0] leading-relaxed mb-2">
            Connecting you to better care anytime
          </p>
          <p className="[font-family:'Inter',Helvetica] font-medium text-[#1e2a4a] text-2xl tracking-[0] leading-relaxed">
            Access Appointments, lab results and bills in one place
          </p>
        </div>

        <div className="flex gap-4 mt-8 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
          <Link to="/login">
            <Button className="px-12 h-14 bg-[#1e88e5] hover:bg-[#1976d2] [font-family:'Inter',Helvetica] font-bold text-white text-xl transition-colors rounded-xl">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button
              variant="outline"
              className="px-12 h-14 bg-white hover:bg-gray-50 border-2 border-gray-300 [font-family:'Inter',Helvetica] font-bold text-[#111111] text-xl transition-colors rounded-xl"
            >
              Create Account
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-12 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:500ms]">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`bg-white/95 backdrop-blur-sm border-gray-200 shadow-md hover:shadow-lg transition-[transform,box-shadow] hover:scale-105 translate-y-[-1rem] animate-fade-in opacity-0`}
              style={
                { "--animation-delay": feature.delay } as React.CSSProperties
              }
            >
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <div className="w-12 h-12 flex items-center justify-center bg-[#1e88e5] rounded-lg">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="[font-family:'Inter',Helvetica] font-bold text-[#1e88e5] text-sm text-center">
                  {feature.title}
                </h3>
                <p className="[font-family:'Inter',Helvetica] font-normal text-gray-600 text-xs text-center leading-tight">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
