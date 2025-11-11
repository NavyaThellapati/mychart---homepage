import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { HeaderSection } from "../../components/HeaderSection";
import { Check, X } from "lucide-react";
import authService from "../../services/authService";

export const NewAppointment = (): JSX.Element => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser(); // must exist

  // Guard: no user -> send to login
  if (!currentUser) {
    navigate("/login");
  }

  const APPOINTMENT_TYPES = [
    "General Check-up / Annual Physical",
    "New Patient Visit",
    "Follow-up Consultation",
    "Specialist Visit",
    "Immunization / Vaccine",
    "Lab Test / Diagnostic",
    "Telehealth / Online Consultation",
    "Urgent Care / Same-Day Visit",
  ];

  const DOCTORS = [
    "Cardiology – Dr. Sarah Smith",
    "Dermatology – Dr. Karen Davis",
    "Pulmonology – Dr. John Miller",
    "Neurology – Dr. Maria Gomez",
    "Orthopedics – Dr. Ryan Lee",
    "Pediatrics – Dr. Jennifer Brown",
    "Psychiatry – Dr. David Wilson",
    "General Medicine – Dr. Emily Johnson",
  ];

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

  const [appointmentType, setAppointmentType] = useState("");
  const [departmentDoctor, setDepartmentDoctor] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [date, setDate] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const availableSlots = TIME_SLOTS[departmentDoctor] || [];

  const handleSchedule = () => {
    if (!currentUser) return;
    if (!appointmentType || !departmentDoctor || !reasonForVisit || !date || !timeSlot) {
      alert("Please fill all fields including Time Slot.");
      return;
    }

    // Build a safe ISO datetime: YYYY-MM-DD + HH:mm from slot
    const to24h = (s: string) => {
      const [t, mer] = s.split(" ");
      let [h, m] = t.split(":").map(Number);
      const pm = (mer || "").toUpperCase() === "PM";
      if (pm && h !== 12) h += 12;
      if (!pm && h === 12) h = 0;
      return `${String(h).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
    };
    const startISO = `${date}T${to24h(timeSlot)}:00`;

    const newAppt = {
      id: crypto.randomUUID(),
      userId: currentUser.id,           // <—— tie to user
      type: appointmentType,
      doctor: departmentDoctor,
      reason: reasonForVisit,
      date,
      time: timeSlot,
      startISO,                         // normalized ISO
      notes: additionalNotes,
      status: "Upcoming",
      createdAt: new Date().toISOString(),
    };

    const key = `appointments::${currentUser.id}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([newAppt, ...existing]));

    alert(`✅ Appointment scheduled with ${departmentDoctor} on ${date} at ${timeSlot}`);
    navigate("/appointments?tab=upcoming");
  };

  const handleCancel = () => navigate("/appointments?tab=upcoming");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <HeaderSection />
      <main className="container mx-auto px-8 py-12 relative z-10">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex">
          <div className="w-1/2 bg-[#EAF3FF] rounded-l-3xl flex flex-col items-center justify-center p-6">
            <img
              src="https://c.animaapp.com/mhkp6uvn3Dubvu/img/whatsapp-image-2025-11-08-at-2-46-08-am.jpeg"
              alt="Doctor illustration"
              className="object-contain w-full h-auto max-h-[420px]"
            />
            <div className="text-center mt-6">
              <h2 className="text-3xl font-bold text-[#1E88E5] mb-2">Your Health, Our Priority</h2>
              <p className="text-gray-600 text-lg">Easily schedule your next visit with a few clicks.</p>
            </div>
          </div>

          <div className="w-1/2 p-12">
            <h1 className="text-4xl font-bold text-[#1e2a4a] mb-8">Schedule Appointment</h1>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="w-full h-12 border border-gray-300 rounded-lg text-base px-4 bg-white focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select appointment type</option>
                  {APPOINTMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department / Doctor</label>
                <select
                  value={departmentDoctor}
                  onChange={(e) => { setDepartmentDoctor(e.target.value); setTimeSlot(""); }}
                  className="w-full h-12 border border-gray-300 rounded-lg text-base px-4 bg-white focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select department or doctor</option>
                  {DOCTORS.map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>

              {departmentDoctor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full h-12 border border-gray-300 rounded-lg text-base px-4 bg-white focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select a time slot</option>
                    {availableSlots.map((slot) => (<option key={slot} value={slot}>{slot}</option>))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                <Input
                  type="text"
                  placeholder="e.g., Follow-up, New Symptoms"
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  className="h-12 border-gray-300 rounded-lg text-base px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <Input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 border-gray-300 rounded-lg text-base px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <Textarea
                  placeholder="Any other details for your doctor..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="min-h-[100px] border-gray-300 rounded-lg text-base p-4"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleSchedule} className="flex-1 h-14 bg-[#1E88E5] hover:bg-[#1976d2] text-white font-semibold text-lg rounded-lg">
                  <Check className="w-5 h-5 mr-2" /> Schedule Appointment
                </Button>
                <Button onClick={() => navigate("/appointments?tab=upcoming")} variant="outline"
                        className="flex-1 h-14 bg-white hover:bg-gray-50 border-2 border-gray-300 text-[#111111] font-semibold text-lg rounded-lg">
                  <X className="w-5 h-5 mr-2" /> Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
