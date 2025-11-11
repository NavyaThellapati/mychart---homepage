import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "lucide-react";
import { HeaderSection } from "../../components/HeaderSection"; // Global Header
import { AppointmentsList } from "./sections/AppointmentsList"; // Renamed AppointmentsSection

export const AppointmentsPage = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen relative flex flex-col">
      <HeaderSection />

      <main
        className="relative flex-1 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://c.animaapp.com/mhkp6uvn3Dubvu/img/whatsapp-image-2025-11-08-at-2-46-10-am.jpeg)",
        }}
      >
        {/* Frosted glass overlay */}
        <div
          className="absolute inset-0 bg-white bg-opacity-70 backdrop-blur-sm"
          style={{
            // Adjust opacity and blur as needed for the frosted glass effect
            backgroundColor: "rgba(255, 255, 255, 0.7)", // White with 70% opacity
            backdropFilter: "blur(1px)", // Soft blur
            WebkitBackdropFilter: "blur(5px)", // For Safari compatibility
          }}
        ></div>

        <div className="relative z-10 flex flex-col px-20 pt-6 pb-20">
          <nav className="flex items-center mb-8">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 [font-family:'Inter',Helvetica] font-medium text-black text-[25px] tracking-[0] leading-[55px] hover:text-[#1e88e5] transition-colors"
            >
              <ChevronLeftIcon className="w-12 h-12" />
              <span>Home</span>
            </Link>
          </nav>

          <div className="flex items-center justify-between mb-12">
            <h1 className="[font-family:'Inter',Helvetica] font-bold text-black text-5xl tracking-[0] leading-[normal]">
              Your Scheduled Appointments
            </h1>

            <button
              onClick={() => navigate("/appointments/new")}
              className="bg-[#1e88e5] hover:bg-[#1976d2] text-white rounded-2xl px-9 h-12 [font-family:'Inter',Helvetica] font-bold text-lg transition-colors"
            >
              New Appointment
            </button>
          </div>

          <AppointmentsList /> {/* Render the renamed AppointmentsList */}
        </div>
      </main>
    </div>
  );
};
