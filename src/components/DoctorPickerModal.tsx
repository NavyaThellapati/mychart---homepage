import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Recipient {
  id: string;
  name: string;
  type: "doctor" | "department";
  specialty?: string;
}

interface DoctorPickerModalProps {
  onSelect: (recipient: Recipient) => void;
  onClose: () => void;
}

const MOCK_DOCTORS: Recipient[] = [
  { id: "doc1", name: "Dr. Sarah Johnson", type: "doctor", specialty: "Radiology" },
  { id: "doc2", name: "Dr. Emily Johnson", type: "doctor", specialty: "Physiology" },
  { id: "doc3", name: "Dr. Michael Chen", type: "doctor", specialty: "Allergist" },
  { id: "doc4", name: "Dr. John Miller", type: "doctor", specialty: "Pulmonology" },
  { id: "doc5", name: "Dr. Maria Gomez", type: "doctor", specialty: "Neurology" },
];

const MOCK_DEPARTMENTS: Recipient[] = [
  { id: "dept1", name: "Billing Department", type: "department", specialty: "Billing & Payments" },
  { id: "dept2", name: "Appointments Desk", type: "department", specialty: "Scheduling" },
  { id: "dept3", name: "IT Support", type: "department", specialty: "Technical Assistance" },
];

export function DoctorPickerModal({ onSelect, onClose }: DoctorPickerModalProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDoctors = useMemo(() => {
    if (!searchTerm) return MOCK_DOCTORS;
    return MOCK_DOCTORS.filter((doc) =>
      `${doc.name} ${doc.specialty}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return MOCK_DEPARTMENTS;
    return MOCK_DEPARTMENTS.filter((dept) =>
      `${dept.name} ${dept.specialty}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#1E88E5] text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Choose Recipient</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search doctors or departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 border-gray-300 rounded-lg text-base"
            />
          </div>
        </div>

        {/* Recipient List */}
        <div className="p-6 max-h-[400px] overflow-y-auto space-y-6">
          {/* Doctors */}
          {filteredDoctors.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Doctors</h3>
              <div className="space-y-2">
                {filteredDoctors.map((doc) => (
                  <Button
                    key={doc.id}
                    onClick={() => onSelect(doc)}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4 text-left border-gray-200 hover:bg-blue-50 hover:border-[#1E88E5] transition-colors"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-gray-900">{doc.name}</span>
                      <span className="text-sm text-gray-600">{doc.specialty}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Departments */}
          {filteredDepartments.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Departments</h3>
              <div className="space-y-2">
                {filteredDepartments.map((dept) => (
                  <Button
                    key={dept.id}
                    onClick={() => onSelect(dept)}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4 text-left border-gray-200 hover:bg-blue-50 hover:border-[#1E88E5] transition-colors"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-gray-900">{dept.name}</span>
                      <span className="text-sm text-gray-600">{dept.specialty}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {filteredDoctors.length === 0 && filteredDepartments.length === 0 && (
            <p className="text-center text-gray-500 py-8">No matching recipients found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
