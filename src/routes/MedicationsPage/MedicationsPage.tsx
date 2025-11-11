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
      return "bg-green-100 text-green-700";
    case "Needs Refill":
      return "bg-yellow-100 text-yellow-700";
    case "Discontinued":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
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
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background with gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#E3F2FD] to-[#F0F4FF]"
      />

      {/* Decorative illustration on the right */}
      

      <HeaderSection />

      <main className="flex-1 container mx-auto px-8 py-12 relative z-10">
        {/* Back to Home */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-black text-lg font-medium mb-8 hover:text-[#1E88E5] transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
          Home
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-black mb-3">Medications</h1>
          <p className="text-xl text-gray-600">
            View your current prescriptions, dosages, and refill history
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column: Current Medications List */}
          <div className="col-span-2 space-y-6">
            <h2 className="text-3xl font-bold text-black mb-6">Current Medications</h2>

            {medications.map((med) => (
              <Card
                key={med.id}
                onClick={() => setSelectedMed(med)}
                className={`rounded-3xl shadow-lg cursor-pointer transition-all hover:shadow-xl bg-white/95 backdrop-blur-sm ${
                  selectedMed?.id === med.id ? "ring-4 ring-[#1E88E5]" : ""
                }`}
              >
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {med.name} {med.genericName && `(${med.genericName})`}
                      </h3>
                      <p className="text-lg text-gray-700 mb-2">
                        {med.dosage} - {med.frequency}
                      </p>
                      <p className="text-base text-gray-600 flex items-center gap-2">
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

                  <div className="flex items-center justify-between text-base text-gray-600 pt-4 border-t border-gray-200">
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
          <div className="col-span-1 space-y-6">
            {/* Selected Medication Details */}
            {selectedMed && (
              <Card className="rounded-3xl shadow-lg bg-white/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-black">
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

                  <div className="space-y-4 text-base text-gray-700">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Dosage</p>
                      <p>{selectedMed.dosage} - {selectedMed.frequency}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Prescribed By</p>
                      <p>{selectedMed.prescribedBy}</p>
                    </div>

                    {selectedMed.instructions && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="font-semibold text-gray-900 mb-2">Details</p>
                        <p className="text-sm leading-relaxed">{selectedMed.instructions}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reminders Card */}
            <Card className="rounded-3xl shadow-lg bg-blue-50/95 backdrop-blur-sm border-2 border-[#1E88E5]">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-[#1E88E5]" />
                  <h3 className="text-2xl font-bold text-[#1E88E5]">Reminders</h3>
                </div>
                <ul className="space-y-3">
                  {REMINDERS.map((reminder, index) => (
                    <li key={index} className="flex items-start gap-3 text-base text-gray-800">
                      <span className="w-2 h-2 rounded-full bg-[#1E88E5] mt-2 flex-shrink-0" />
                      <span>{reminder}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
