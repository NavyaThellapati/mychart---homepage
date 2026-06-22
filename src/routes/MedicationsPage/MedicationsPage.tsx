import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HeaderSection } from "../../components/HeaderSection";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ChevronLeft, Pill, Calendar, User, AlertCircle } from "lucide-react";
import authService from "../../services/authService";

// ==================== TYPES ====================
interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  status: "Active" | "Needs Refill" | "Discontinued";
  refillsLeft?: number;
  instructions?: string;
}

// ==================== MOCK DATA ====================
const MOCK_MEDICATIONS: Medication[] = [
  {
    id: "med1",
    name: "Metformin",
    genericName: "Glucophage",
    dosage: "500 mg tablet",
    frequency: "Twice Daily",
    prescribedBy: "Dr. John Templeton",
    startDate: "2024-07-01",
    status: "Active",
    refillsLeft: 3,
    instructions: "Take with meals to reduce stomach upset. Monitor blood sugar levels regularly.",
  },
  {
    id: "med2",
    name: "Atorvastatin",
    genericName: "Lipitor",
    dosage: "10 mg tablet",
    frequency: "Once Daily",
    prescribedBy: "Dr. Lisa Wong",
    startDate: "2024-07-10",
    status: "Needs Refill",
    refillsLeft: 0,
    instructions: "Take in the evening. Avoid grapefruit juice while taking this medication.",
  },
  {
    id: "med3",
    name: "Vitamin D Supplement",
    dosage: "2000 IU",
    frequency: "Once Daily",
    prescribedBy: "Dr. John Templeton",
    startDate: "2024-08-02",
    status: "Active",
    refillsLeft: 5,
    instructions: "Take with food for better absorption.",
  },
  {
    id: "med4",
    name: "Lisinopril",
    genericName: "Prinivil",
    dosage: "10 mg tablet",
    frequency: "Once Daily",
    prescribedBy: "Dr. Sarah Johnson",
    startDate: "2024-06-15",
    status: "Active",
    refillsLeft: 2,
    instructions: "Take in the morning. Monitor blood pressure regularly. May cause dizziness when standing up quickly.",
  },
  {
    id: "med5",
    name: "Omeprazole",
    genericName: "Prilosec",
    dosage: "20 mg capsule",
    frequency: "Once Daily",
    prescribedBy: "Dr. Michael Chen",
    startDate: "2024-05-20",
    status: "Active",
    refillsLeft: 4,
    instructions: "Take 30 minutes before breakfast. Do not crush or chew capsules.",
  },
  {
    id: "med6",
    name: "Levothyroxine",
    genericName: "Synthroid",
    dosage: "75 mcg tablet",
    frequency: "Once Daily",
    prescribedBy: "Dr. Maria Gomez",
    startDate: "2024-04-10",
    status: "Active",
    refillsLeft: 6,
    instructions: "Take on empty stomach, 30-60 minutes before breakfast. Avoid taking with calcium or iron supplements.",
  },
  {
    id: "med7",
    name: "Aspirin",
    dosage: "81 mg tablet",
    frequency: "Once Daily",
    prescribedBy: "Dr. Sarah Johnson",
    startDate: "2024-03-05",
    status: "Active",
    refillsLeft: 8,
    instructions: "Take with food to reduce stomach irritation. Low-dose aspirin for cardiovascular protection.",
  },
  {
    id: "med8",
    name: "Albuterol",
    genericName: "ProAir",
    dosage: "90 mcg inhaler",
    frequency: "As Needed",
    prescribedBy: "Dr. John Miller",
    startDate: "2024-02-18",
    status: "Needs Refill",
    refillsLeft: 0,
    instructions: "Use as needed for shortness of breath or wheezing. Shake well before each use. Rinse mouth after use.",
  },
  {
    id: "med9",
    name: "Gabapentin",
    genericName: "Neurontin",
    dosage: "300 mg capsule",
    frequency: "Three Times Daily",
    prescribedBy: "Dr. Maria Gomez",
    startDate: "2024-01-22",
    status: "Active",
    refillsLeft: 1,
    instructions: "Take with or without food. May cause drowsiness. Do not stop suddenly without consulting your doctor.",
  },
  {
    id: "med10",
    name: "Amlodipine",
    genericName: "Norvasc",
    dosage: "5 mg tablet",
    frequency: "Once Daily",
    prescribedBy: "Dr. Sarah Johnson",
    startDate: "2023-12-10",
    status: "Active",
    refillsLeft: 3,
    instructions: "Take at the same time each day. May cause swelling in ankles or feet. Monitor blood pressure regularly.",
  },
];

const REMINDERS = [
  "Monitor blood sugar daily.",
  "Schedule lab follow-up before next visit",
  "Continue all re-prescribed medications.",
];

// ==================== HELPER FUNCTIONS ====================
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-1 dark:ring-emerald-400/25";
    case "Needs Refill":
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-1 dark:ring-amber-400/25";
    case "Discontinued":
      return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
    default:
      return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
  }
}

// ==================== COMPONENT ====================
export function MedicationsPage(): JSX.Element {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser?.();
    if (!user) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  // Auto-select first medication
  useEffect(() => {
    if (medications.length > 0 && !selectedMed) {
      setSelectedMed(medications[0]);
    }
  }, [medications, selectedMed]);

  return (
    <div className="medications-page relative flex min-h-screen flex-col overflow-hidden bg-slate-50 dark:bg-[#020617]">
      {/* Background with gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#E3F2FD] to-[#F0F4FF] dark:bg-none dark:bg-[#020617]"
      />

      {/* Decorative illustration on the right */}
      

      <HeaderSection />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        {/* Back to Home */}
        <Link
          to="/dashboard"
          className="mb-7 flex items-center gap-2 text-base font-semibold text-slate-700 transition-colors hover:text-[#1E88E5] dark:text-blue-300 dark:hover:text-blue-200"
        >
          <ChevronLeft className="w-6 h-6" />
          Home
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-3 text-4xl font-bold text-slate-950 dark:text-white">Medications</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            View your current prescriptions, dosages, and refill history
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          {/* Left Column: Current Medications List */}
          <div className="space-y-4">
            <h2 className="mb-5 text-2xl font-bold text-slate-950 dark:text-white">Current Medications</h2>

            {medications.map((med) => (
              <Card
                key={med.id}
                onClick={() => setSelectedMed(med)}
                className={`cursor-pointer rounded-lg border bg-white/95 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:bg-slate-900/90 dark:hover:border-blue-500/60 ${
                  selectedMed?.id === med.id
                    ? "border-[#1E88E5] ring-2 ring-[#1E88E5]/30 dark:bg-slate-800/95"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="mb-1 text-xl font-bold text-slate-950 dark:text-white">
                        {med.name} {med.genericName && `(${med.genericName})`}
                      </h3>
                      <p className="mb-2 text-base text-slate-700 dark:text-slate-200">
                        {med.dosage} - {med.frequency}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <User className="w-4 h-4" />
                        Prescribed by, {med.prescribedBy}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(
                        med.status
                      )}`}
                    >
                      {med.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Start Date: {formatDate(med.startDate)}</span>
                    </div>
                    {med.refillsLeft !== undefined && (
                      <span className="font-medium">
                        Refills Left: {med.refillsLeft}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Column: Selected Medication Details + Reminders */}
          <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
            {/* Selected Medication Details */}
            {selectedMed && (
              <Card className="rounded-lg border border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                      {selectedMed.name}
                    </h2>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(
                        selectedMed.status
                      )}`}
                    >
                      {selectedMed.status}
                    </span>
                  </div>

                  <div className="space-y-4 text-base text-slate-700 dark:text-slate-200">
                    <div>
                      <p className="mb-1 font-semibold text-slate-950 dark:text-slate-100">Dosage</p>
                      <p>{selectedMed.dosage} - {selectedMed.frequency}</p>
                    </div>

                    <div>
                      <p className="mb-1 font-semibold text-slate-950 dark:text-slate-100">Prescribed By</p>
                      <p>{selectedMed.prescribedBy}</p>
                    </div>

                    {selectedMed.instructions && (
                      <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                        <p className="mb-2 font-semibold text-slate-950 dark:text-slate-100">Details</p>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{selectedMed.instructions}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reminders Card */}
            <Card className="rounded-lg border border-blue-200 bg-blue-50/95 shadow-sm backdrop-blur-sm dark:border-blue-500/30 dark:bg-blue-950/35">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-[#1E88E5]" />
                  <h3 className="text-xl font-bold text-[#1565C0] dark:text-blue-300">Reminders</h3>
                </div>
                <ul className="space-y-3">
                  {REMINDERS.map((reminder, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-[#1E88E5] mt-2 flex-shrink-0" />
                      <span>{reminder}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
