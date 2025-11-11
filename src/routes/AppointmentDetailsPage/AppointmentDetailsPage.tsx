// src/routes/AppointmentDetailsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HeaderSection } from "../../components/HeaderSection";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  ChevronLeft,
  Calendar,
  Stethoscope,
  FileText,
  AlertTriangle,
  Repeat,
  XCircle,
} from "lucide-react";
import authService from "../../services/authService";

// ---- Doctor-specific time slots (same style as NewAppointment) ----
const TIME_SLOTS: Record<string, string[]> = {
  "Cardiology – Dr. Sarah Smith": ["9:00 AM", "11:30 AM", "2:00 PM"],
  "Dermatology – Dr. Karen Davis": ["10:00 AM", "1:00 PM", "3:00 PM"],
  "Pulmonology – Dr. John Miller": ["1:45 PM", "4:00 PM"],
  "Neurology – Dr. Maria Gomez": ["9:30 AM", "12:00 PM", "2:30 PM"],
  "Orthopedics – Dr. Ryan Lee": ["10:15 AM", "12:45 PM", "3:30 PM"],
  "Pediatrics – Dr. Jennifer Brown": ["9:00 AM", "11:00 AM", "1:30 PM"],
  "Psychiatry – Dr. David Wilson": ["10:30 AM", "12:00 PM", "2:30 PM"],
  "General Medicine – Dr. Emily Johnson": ["8:45 AM", "11:15 AM", "2:00 PM"],
};

// ---- helpers ----
function to24h(h12?: string) {
  if (!h12) return "00:00";
  const [time, mer] = h12.trim().split(" ");
  if (!time) return "00:00";
  let [hStr, mStr = "00"] = time.split(":");
  let h = Number(hStr);
  const pm = (mer || "").toUpperCase() === "PM";
  if (pm && h !== 12) h += 12;
  if (!pm && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(mStr).padStart(2, "0")}`;
}

function coerceISO(a: any): string | undefined {
  if (a?.startISO) return a.startISO;
  if (a?.datetime) return a.datetime;
  if (a?.date) return `${a.date}T${to24h(a.time)}:00`;
  return undefined;
}

function formatDateTime(iso?: string) {
  if (!iso) return "Invalid date";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function badge(status: string) {
  switch (status) {
    case "Upcoming":
      return "text-[#1E88E5] bg-[#E7F1FF]";
    case "Attended":
      return "text-green-600 bg-green-50";
    case "Cancelled":
      return "text-red-600 bg-red-50";
    case "Did not show up":
      return "text-orange-600 bg-orange-50";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

type ApptStatus = "Upcoming" | "Attended" | "Did not show up" | "Cancelled";
interface Appointment {
  id: string;
  doctor: string;
  specialty?: string;
  type?: string;
  reason?: string;
  notes?: string;
  status: ApptStatus;
  startISO?: string;
  datetime?: string;
  date?: string;
  time?: string;
}

// Build the unified doctor key used in TIME_SLOTS
function doctorKey(appt: Appointment) {
  return appt.specialty ? `${appt.specialty} – ${appt.doctor}` : appt.doctor;
}

// ---- page ----
export const AppointmentDetailsPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appt, setAppt] = useState<Appointment | null>(null);

  // reschedule modal state
  const [showResched, setShowResched] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("");

  // load for current user only
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    const key = `appointments::${user.id}`;
    const list: Appointment[] = JSON.parse(localStorage.getItem(key) || "[]");
    const found = list.find((a) => a.id === id) || null;
    setAppt(found);
  }, [id, navigate]);

  const iso = useMemo(() => coerceISO(appt || {}), [appt]);
  const when = useMemo(() => formatDateTime(iso), [iso]);

  if (!appt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
        <HeaderSection />
        <main className="flex-1 container mx-auto px-8 py-12 text-center">
          <p className="text-xl text-gray-700">Appointment not found.</p>
          <Button onClick={() => navigate("/appointments")} className="mt-4">
            Back to Appointments
          </Button>
        </main>
      </div>
    );
  }

  // ----- actions -----
  const onCancel = () => {
    if (appt.status !== "Upcoming") return;
    const user = authService.getCurrentUser();
    if (!user) return;
    const key = `appointments::${user.id}`;
    const list: Appointment[] = JSON.parse(localStorage.getItem(key) || "[]");
    const idx = list.findIndex((a) => a.id === appt.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], status: "Cancelled" };
      localStorage.setItem(key, JSON.stringify(list));
    }
    navigate("/appointments?tab=canceled");
  };

  const onRescheduleSave = () => {
    if (!newDate || !newSlot) {
      alert("Please select a date and a time slot.");
      return;
    }
    const user = authService.getCurrentUser();
    if (!user) return;

    const key = `appointments::${user.id}`;
    const list: Appointment[] = JSON.parse(localStorage.getItem(key) || "[]");
    const idx = list.findIndex((a) => a.id === appt.id);
    if (idx === -1) return;

    const startISO = `${newDate}T${to24h(newSlot)}:00`;

    list[idx] = {
      ...list[idx],
      date: newDate,
      time: newSlot,
      startISO,
      status: "Upcoming",
    };

    localStorage.setItem(key, JSON.stringify(list));
    setAppt(list[idx]);
    setShowResched(false);
    alert("✅ Appointment rescheduled successfully.");
  };

  // slots for this doctor
  const slots = TIME_SLOTS[doctorKey(appt)] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <HeaderSection />

      <main className="flex-1 container mx-auto px-8 py-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/appointments")}
            className="flex items-center gap-2 text-black text-lg font-medium mb-8 hover:text-[#1E88E5] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            Back to Appointments
          </button>

          <Card className="rounded-3xl shadow-xl p-8">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#1e2a4a]">
                    {appt.specialty ? `${appt.specialty} – ${appt.doctor}` : appt.doctor}
                  </h1>
                  {appt.type && (
                    <p className="text-gray-600 text-lg mt-1">Appointment Type: {appt.type}</p>
                  )}
                </div>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${badge(appt.status)}`}>
                  {appt.status}
                </span>
              </div>

              {/* Body */}
              <div className="space-y-6 text-gray-800">
                <div className="flex items-center gap-4">
                  <Calendar className="w-6 h-6 text-[#1E88E5]" />
                  <div>
                    <h3 className="font-bold text-xl">Date & Time</h3>
                    <p className="text-lg">{when}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Stethoscope className="w-6 h-6 text-[#1E88E5]" />
                  <div>
                    <h3 className="font-bold text-xl">Department</h3>
                    <p className="text-lg">{appt.specialty || "—"}</p>
                  </div>
                </div>

                {appt.reason && (
                  <div className="flex items-center gap-4">
                    <FileText className="w-6 h-6 text-[#1E88E5]" />
                    <div>
                      <h3 className="font-bold text-xl">Reason for Visit</h3>
                      <p className="text-lg">{appt.reason}</p>
                    </div>
                  </div>
                )}

                {appt.notes && (
                  <div className="flex items-center gap-4">
                    <FileText className="w-6 h-6 text-[#1E88E5]" />
                    <div>
                      <h3 className="font-bold text-xl">Additional Notes</h3>
                      <p className="text-lg">{appt.notes}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 bg-blue-50 border-l-4 border-[#1E88E5] p-4 rounded-lg text-blue-800">
                  <AlertTriangle className="w-6 h-6 text-[#1E88E5] mt-1" />
                  <p>Please arrive 10 minutes early or join the telehealth link if applicable.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-4 mt-10">
                {appt.status === "Upcoming" ? (
                  <>
                    <Button
                      onClick={() => setShowResched(true)}
                      className="flex-1 h-14 bg-[#1E88E5] hover:bg-[#1976d2] text-white font-semibold text-lg rounded-lg"
                    >
                      <Repeat className="w-5 h-5 mr-2" />
                      Reschedule
                    </Button>
                    <Button
                      onClick={onCancel}
                      variant="outline"
                      className="flex-1 h-14 bg-white hover:bg-gray-50 border-2 border-red-300 text-red-600 font-semibold text-lg rounded-lg"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Cancel Appointment
                    </Button>
                  </>
                ) : appt.status === "Cancelled" ? (
                  <Button
                    onClick={() => navigate("/appointments/new")}
                    className="flex-1 h-14 bg-[#1E88E5] hover:bg-[#1976d2] text-white font-semibold text-lg rounded-lg"
                  >
                    Schedule New Appointment
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate("/appointments/new")}
                    className="flex-1 h-14 bg-[#1E88E5] hover:bg-[#1976d2] text-white font-semibold text-lg rounded-lg"
                  >
                    Book Follow-up
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Reschedule Modal */}
      {showResched && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
            <h3 className="text-2xl font-semibold text-[#1e2a4a] mb-4 flex items-center">
              <Repeat className="w-5 h-5 mr-2" /> Reschedule Appointment
            </h3>

            <div className="space-y-5">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full h-12 border border-gray-300 rounded-lg px-4"
                />
              </div>

              {/* Time slot */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Time Slot</label>
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full h-12 border border-gray-300 rounded-lg px-4 bg-white"
                >
                  <option value="">Select a time</option>
                  {slots.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {slots.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    No predefined slots for {doctorKey(appt)}. Add this doctor to TIME_SLOTS if needed.
                  </p>
                )}
              </div>

              {/* Modal actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={onRescheduleSave}
                  className="flex-1 h-12 bg-[#1E88E5] hover:bg-[#1976d2] text-white font-semibold rounded-lg"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowResched(false)}
                  className="flex-1 h-12 border-2 border-gray-300 text-[#111111] font-semibold rounded-lg"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
