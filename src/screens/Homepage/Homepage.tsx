import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Calendar,
  FileText,
  CreditCard,
  Clock,
  ShieldCheck,
  MapPin,
} from "lucide-react";

export function Homepage(): JSX.Element {
  const features = [
    {
      icon: Calendar,
      title: "Manage Appointments",
      description: "Schedule, reschedule, or cancel visits easily.",
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
      description: "Pay medical bills quickly and securely.",
      delay: "800ms",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Access your health portal anytime, anywhere.",
      delay: "900ms",
    },
    {
      icon: ShieldCheck,
      title: "Secure Records",
      description: "Keep your medical information safe and private.",
      delay: "1000ms",
    },
    {
      icon: MapPin,
      title: "Care Locations",
      description: "Find doctors and services near your location.",
      delay: "1100ms",
    },
  ];

  return (
    <main
      className="bg-white overflow-hidden w-full min-h-screen relative"
      data-model-id="1:272"
    >
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full">
      <img
  className="w-full h-full object-cover object-center"
  alt="Healthcare background"
  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef"
/>

        {/* Soft overlay for readability */}
        <div className="absolute inset-0 bg-white/25"></div>
      </div>

      {/* Logo */}
      <header className="absolute top-8 left-8 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms] z-10">
        <img
          className="w-64 h-auto object-cover"
          alt="MyChart logo"
          src="https://c.animaapp.com/mhkp6uvn3Dubvu/img/mychart-logo-high-resolution-1-1.png"
        />
      </header>

      {/* Main Content */}
      <section className="absolute top-[12%] right-[4%] flex flex-col gap-5 w-[43%] bg-white/55 backdrop-blur-md p-8 rounded-3xl shadow-xl z-10">
        <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          <h1 className="[font-family:'Inter',Helvetica] font-normal text-5xl tracking-[0] leading-tight mb-5">
            <span className="font-bold text-[#1e2a4a]">Welcome to</span>
            <br />
            <span className="font-bold text-[#2563eb]">My</span>
            <span className="font-bold text-[#e53935]">Chart</span>
          </h1>

          <p className="[font-family:'Inter',Helvetica] font-medium text-[#1e2a4a] text-xl tracking-[0] leading-relaxed mb-2">
            Connecting you to better care anytime
          </p>

          <p className="[font-family:'Inter',Helvetica] font-medium text-[#1e2a4a] text-xl tracking-[0] leading-relaxed">
            Access appointments, lab results, records, and bills in one place
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-4 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
          <Link to="/login">
            <Button className="px-10 h-13 bg-[#2563eb] hover:bg-[#1d4ed8] [font-family:'Inter',Helvetica] font-bold text-white text-lg transition-colors rounded-xl shadow-md">
              Login
            </Button>
          </Link>

          <Link to="/register">
            <Button
              variant="outline"
              className="px-10 h-13 bg-white hover:bg-gray-50 border-2 border-gray-300 [font-family:'Inter',Helvetica] font-bold text-[#111111] text-lg transition-colors rounded-xl shadow-md"
            >
              Create Account
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:500ms]">
          {features.map((feature, index) => (
            <Card
              key={index}
              onClick={() => (window.location.href = "/login")}
              className="cursor-pointer bg-white/95 backdrop-blur-sm border-gray-200 shadow-md hover:shadow-xl transition-[transform,box-shadow] hover:scale-105 translate-y-[-1rem] animate-fade-in opacity-0 rounded-2xl"
              style={
                { "--animation-delay": feature.delay } as React.CSSProperties
              }
            >
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <div className="w-11 h-11 flex items-center justify-center bg-[#2563eb] rounded-xl">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="[font-family:'Inter',Helvetica] font-bold text-[#2563eb] text-sm text-center">
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
      {/* Footer Section */}
{/* Footer Section */}
<footer className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 px-8 py-2 z-20">
  <div className="flex items-center justify-between gap-6">
    
    {/* App Download Buttons */}
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

    {/* Footer Links */}
    <div className="flex items-center gap-7 text-[#4b5563] font-medium text-base">
    <a href="/interoperability-guide" className="text-[#4b5563]">
  Interoperability Guide
</a>

<a href="/faqs" className="text-[#4b5563]">
  FAQs
</a>

<a href="/privacy-policy" className="text-[#4b5563]">
  Privacy Policy
</a>

<a href="/terms-and-conditions" className="text-[#4b5563]">
  Terms and Conditions
</a>

  <a href="#" className="text-[#4b5563]">
    High Contrast Theme
  </a>
</div>
  </div>
</footer>
    </main>
  );
}