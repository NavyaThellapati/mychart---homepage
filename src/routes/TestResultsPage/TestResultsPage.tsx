import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeaderSection } from "../../components/HeaderSection";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ChevronRight, Download, X } from "lucide-react";
import authService from "../../services/authService";
import { downloadTestReport } from "../../utils/downloadReport";

/**
 * DEV NOTE:
 * Mock test results are assigned to DEV_USER_ID but will be shown to any logged-in user
 * for development purposes. In production, you'd fetch results from an API based on the user's ID.
 */
const DEV_USER_ID = "dev_mock_user";

// ------------------ Helpers ------------------
function formatDateTime(dt: string, includeTime = true) {
  const d = new Date(dt);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime && { hour: "numeric", minute: "2-digit" }),
  });
}

// Parse the last numeric token in a string, e.g. "68 U/L" -> 68
function parseLastNumber(text: string): number {
  const matches = text.match(/-?\d+(\.\d+)?/g);
  if (!matches || matches.length === 0) return NaN;
  return parseFloat(matches[matches.length - 1]);
}

// Determine if analyte result is out of reference range (supports "a-b", "<b", ">a")
function getOutOfRangeClass(result: string, reference: string) {
  const value = parseLastNumber(result);
  if (isNaN(value)) return "";

  const refNums = reference.match(/-?\d+(\.\d+)?/g)?.map(parseFloat) ?? [];
  const trimmed = reference.trim();

  let isOut = false;

  if (trimmed.includes("-") && refNums.length >= 2) {
    const [low, high] = refNums;
    if (!isNaN(low) && !isNaN(high)) isOut = value < low || value > high;
  } else if (trimmed.startsWith("<") && refNums.length >= 1) {
    const high = refNums[0];
    if (!isNaN(high)) isOut = value >= high;
  } else if (trimmed.startsWith(">") && refNums.length >= 1) {
    const low = refNums[0];
    if (!isNaN(low)) isOut = value <= low;
  }

  return isOut ? "text-red-600 font-semibold" : "";
}

// Helper to get status badge styling
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "Normal":
      return "bg-green-100 text-green-700";
    case "Abnormal":
      return "bg-red-100 text-red-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Archived":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// ------------------ Types ------------------
interface Analyte {
  name: string;
  result: string;
  reference: string;
}

interface TestResult {
  id: string;
  userId: string;
  name: string;
  collectedDate: string;
  collectedTime?: string;
  orderedBy: string;
  lab?: string;
  labLocation?: string;
  status: "Normal" | "Abnormal" | "Pending" | "Archived";
  keyValues?: string;
  flaggedNotes?: string;
  analytes?: Analyte[];
  doctorNote?: string;
}

// ------------------ Mock Data (scoped by userId) ------------------
const OTHER_USER_ID = "user_999";

const MOCK_TEST_RESULTS: TestResult[] = [
  {
    id: "tr1",
    userId: DEV_USER_ID,
    name: "Complete Blood Count (CBC)",
    collectedDate: "2025-01-15T09:00:00",
    orderedBy: "Dr. Emily Johnson",
    lab: "LabCorp",
    labLocation: "Main Street Medical Center",
    status: "Normal",
    keyValues: "WBC 6.1, Hgb 13.8, Platelets 220",
    analytes: [
      { name: "WBC", result: "6.1 K/uL", reference: "4.5-11.0 K/uL" },
      { name: "RBC", result: "4.5 M/uL", reference: "4.0-5.5 M/uL" },
      { name: "Hemoglobin", result: "13.8 g/dL", reference: "12.0-15.5 g/dL" },
      { name: "Hematocrit", result: "41.2%", reference: "36.0-46.0%" },
      { name: "Platelets", result: "220 K/uL", reference: "150-450 K/uL" },
      { name: "MCV", result: "88 fL", reference: "80-100 fL" },
    ],
    doctorNote: "All values within normal limits. No action required. Continue routine monitoring.",
  },
  {
    id: "tr2",
    userId: DEV_USER_ID,
    name: "Comprehensive Metabolic Panel (CMP)",
    collectedDate: "2025-01-15T09:15:00",
    orderedBy: "Dr. Emily Johnson",
    lab: "LabCorp",
    labLocation: "Main Street Medical Center",
    status: "Abnormal",
    keyValues: "ALT High (68 U/L)",
    flaggedNotes: "ALT High (68 U/L) - Follow-up recommended",
    analytes: [
      { name: "Glucose", result: "98 mg/dL", reference: "70-99 mg/dL" },
      { name: "BUN", result: "15 mg/dL", reference: "7-20 mg/dL" },
      { name: "Creatinine", result: "0.9 mg/dL", reference: "0.57-1.00 mg/dL" },
      { name: "Sodium", result: "140 mEq/L", reference: "136-145 mEq/L" },
      { name: "Potassium", result: "4.2 mEq/L", reference: "3.5-5.0 mEq/L" },
      { name: "Chloride", result: "102 mEq/L", reference: "98-107 mEq/L" },
      { name: "CO2", result: "25 mEq/L", reference: "23-29 mEq/L" },
      { name: "Calcium", result: "9.5 mg/dL", reference: "8.5-10.5 mg/dL" },
      { name: "ALT", result: "68 U/L", reference: "0-44 U/L" },
      { name: "AST", result: "34 U/L", reference: "0-40 U/L" },
      { name: "Alkaline Phosphatase", result: "72 U/L", reference: "40-130 U/L" },
      { name: "Total Bilirubin", result: "0.8 mg/dL", reference: "0.1-1.2 mg/dL" },
      { name: "Total Protein", result: "7.2 g/dL", reference: "6.0-8.3 g/dL" },
      { name: "Albumin", result: "4.5 g/dL", reference: "3.5-5.5 g/dL" },
    ],
    doctorNote:
      "Slightly elevated ALT observed. This may indicate mild liver inflammation. Recommend repeat test in 3 months and review medications that may affect liver enzymes. Consider lifestyle modifications including reduced alcohol intake and weight management if applicable.",
  },
  {
    id: "tr3",
    userId: DEV_USER_ID,
    name: "Lipid Panel",
    collectedDate: "2024-12-10T08:30:00",
    orderedBy: "Dr. Sarah Smith",
    lab: "Quest Diagnostics",
    labLocation: "Downtown Health Plaza",
    status: "Normal",
    keyValues: "Total Cholesterol 180, LDL 102, HDL 58",
    analytes: [
      { name: "Total Cholesterol", result: "180 mg/dL", reference: "<200 mg/dL" },
      { name: "HDL Cholesterol", result: "58 mg/dL", reference: ">40 mg/dL" },
      { name: "LDL Cholesterol", result: "102 mg/dL", reference: "<100 mg/dL" },
      { name: "Triglycerides", result: "130 mg/dL", reference: "<150 mg/dL" },
      { name: "VLDL Cholesterol", result: "26 mg/dL", reference: "5-40 mg/dL" },
      { name: "Non-HDL Cholesterol", result: "122 mg/dL", reference: "<130 mg/dL" },
    ],
    doctorNote:
      "Lipid profile within healthy ranges. LDL is slightly above optimal but acceptable. Continue current diet and exercise regimen. Recheck in 12 months.",
  },
  {
    id: "tr4",
    userId: DEV_USER_ID,
    name: "Thyroid Function Panel",
    collectedDate: "2024-11-28T10:00:00",
    orderedBy: "Dr. Maria Gomez",
    lab: "LabCorp",
    labLocation: "Main Street Medical Center",
    status: "Normal",
    keyValues: "TSH 2.1, Free T4 1.2",
    analytes: [
      { name: "TSH", result: "2.1 mIU/L", reference: "0.4-4.0 mIU/L" },
      { name: "Free T4", result: "1.2 ng/dL", reference: "0.8-1.8 ng/dL" },
      { name: "Free T3", result: "3.2 pg/mL", reference: "2.3-4.2 pg/mL" },
    ],
    doctorNote: "Thyroid function is normal. No treatment needed at this time.",
  },
  {
    id: "tr5",
    userId: DEV_USER_ID,
    name: "Hemoglobin A1C",
    collectedDate: "2024-11-20T09:45:00",
    orderedBy: "Dr. Emily Johnson",
    lab: "Quest Diagnostics",
    labLocation: "Downtown Health Plaza",
    status: "Normal",
    keyValues: "HbA1c 5.4%",
    analytes: [
      { name: "Hemoglobin A1C", result: "5.4%", reference: "<5.7%" },
    ],
    doctorNote: "Excellent glucose control. No signs of diabetes. Continue healthy lifestyle habits.",
  },
  {
    id: "tr6",
    userId: DEV_USER_ID,
    name: "Vitamin D, 25-Hydroxy",
    collectedDate: "2024-10-15T14:00:00",
    orderedBy: "Dr. David Wilson",
    lab: "LabCorp",
    labLocation: "Main Street Medical Center",
    status: "Archived",
    keyValues: "Vitamin D 35 ng/mL",
    analytes: [
      { name: "Vitamin D, 25-OH", result: "35 ng/mL", reference: "30-100 ng/mL" }
    ],
    doctorNote: "Vitamin D levels are sufficient. No supplementation needed at this time.",
  },
  {
    id: "tr7",
    userId: DEV_USER_ID,
    name: "Urinalysis",
    collectedDate: "2024-10-05T11:30:00",
    orderedBy: "Dr. Ryan Lee",
    lab: "Quest Diagnostics",
    labLocation: "Downtown Health Plaza",
    status: "Normal",
    keyValues: "Clear, pH 6.0, No abnormalities",
    analytes: [
      { name: "Color", result: "Yellow", reference: "Yellow" },
      { name: "Appearance", result: "Clear", reference: "Clear" },
      { name: "Specific Gravity", result: "1.015", reference: "1.005-1.030" },
      { name: "pH", result: "6.0", reference: "4.5-8.0" },
      { name: "Protein", result: "Negative", reference: "Negative" },
      { name: "Glucose", result: "Negative", reference: "Negative" },
      { name: "Ketones", result: "Negative", reference: "Negative" },
      { name: "Blood", result: "Negative", reference: "Negative" },
    ],
    doctorNote: "Urinalysis shows no abnormalities. Kidney function appears normal.",
  },
  {
    id: "tr8",
    userId: DEV_USER_ID,
    name: "Iron Panel",
    collectedDate: "2024-09-22T08:00:00",
    orderedBy: "Dr. Jennifer Brown",
    lab: "LabCorp",
    labLocation: "Main Street Medical Center",
    status: "Normal",
    keyValues: "Iron 85, Ferritin 120",
    analytes: [
      { name: "Iron", result: "85 mcg/dL", reference: "60-170 mcg/dL" },
      { name: "TIBC", result: "350 mcg/dL", reference: "250-450 mcg/dL" },
      { name: "Transferrin Saturation", result: "24%", reference: "20-50%" },
      { name: "Ferritin", result: "120 ng/mL", reference: "30-400 ng/mL" },
    ],
    doctorNote: "Iron stores are adequate. No evidence of iron deficiency or overload.",
  },
  {
    id: "tr9",
    userId: DEV_USER_ID,
    name: "COVID-19 PCR Test",
    collectedDate: "2024-09-10T13:00:00",
    orderedBy: "Dr. Emily Johnson",
    lab: "Quest Diagnostics",
    labLocation: "Downtown Health Plaza",
    status: "Archived",
    keyValues: "Negative",
    analytes: [
      { name: "SARS-CoV-2 RNA", result: "Not Detected", reference: "Not Detected" },
    ],
    doctorNote: "Test result is negative for COVID-19. No further action needed.",
  },
  {
    id: "tr10",
    userId: DEV_USER_ID,
    name: "Prostate-Specific Antigen (PSA)",
    collectedDate: "2024-08-18T09:30:00",
    orderedBy: "Dr. Ryan Lee",
    lab: "LabCorp",
    labLocation: "Main Street Medical Center",
    status: "Normal",
    keyValues: "PSA 1.2 ng/mL",
    analytes: [
      { name: "Total PSA", result: "1.2 ng/mL", reference: "<4.0 ng/mL" },
      { name: "Free PSA", result: "0.3 ng/mL", reference: ">0.25 ng/mL" },
      { name: "Free/Total PSA Ratio", result: "25%", reference: ">25%" },
    ],
    doctorNote: "PSA levels are within normal range. Continue annual screening.",
  },
  {
    id: "tr11",
    userId: DEV_USER_ID,
    name: "Liver Function Test (LFT)",
    collectedDate: "2024-07-25T10:15:00",
    orderedBy: "Dr. Sarah Smith",
    lab: "Quest Diagnostics",
    labLocation: "Downtown Health Plaza",
    status: "Pending",
    keyValues: "Results pending",
    analytes: [],
    doctorNote: "Test results are being processed. Expected within 24-48 hours.",
  },
  {
    id: "trX",
    userId: OTHER_USER_ID,
    name: "TSH (Other User)",
    collectedDate: "2025-04-12T08:00:00",
    orderedBy: "Dr. Not You",
    status: "Pending",
    keyValues: "Ignore me in UI",
  },
];

// ------------------ Component ------------------
export const TestResultsPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] =
    useState<"All Results" | "Abnormal" | "Pending" | "Archived">("All Results");
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "csv">("pdf");
  const [includeAnalytes, setIncludeAnalytes] = useState(true);
  const [includeDoctorNotes, setIncludeDoctorNotes] = useState(true);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const myId = useMemo(() => {
    const idFromAuth =
      (currentUser && (currentUser.id || currentUser.uid || currentUser.userId || currentUser.email)) ||
      null;

    if (idFromAuth) return idFromAuth;
    return DEV_USER_ID;
  }, [currentUser]);

  const myResults = useMemo(() => {
    if (!myId) return [];
    
    return MOCK_TEST_RESULTS.filter((t) => {
      if (t.userId === DEV_USER_ID) return true;
      return t.userId === myId;
    });
  }, [myId]);

  const filteredResults = useMemo(() => {
    let results = myResults;
    if (activeTab === "Abnormal") {
      results = results.filter((t) => t.status === "Abnormal");
    } else if (activeTab === "Pending") {
      results = results.filter((t) => t.status === "Pending");
    } else if (activeTab === "Archived") {
      results = results.filter((t) => t.status === "Archived");
    }
    return results;
  }, [myResults, activeTab]);

  useEffect(() => {
    if (filteredResults.length > 0 && !selectedTest) {
      setSelectedTest(filteredResults[0]);
    } else if (filteredResults.length === 0) {
      setSelectedTest(null);
    }
  }, [filteredResults, selectedTest]);

  const handleDownloadReport = () => {
    if (!selectedTest) {
      alert("Please select a test result first.");
      return;
    }

    try {
      downloadTestReport(
        selectedTest,
        {
          format: downloadFormat,
          includeAnalytes,
          includeDoctorNotes,
        },
        currentUser
      );
      setShowDownloadModal(false);
      alert(`Report downloaded successfully as ${downloadFormat.toUpperCase()}!`);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#E3F2FD] to-white"
        style={{
          backgroundImage: 'url(https://c.animaapp.com/mhkp6uvn3Dubvu/img/chatgpt-image-nov-10-2025-03_07_15-pm.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      
      <HeaderSection />

      <main className="flex-1 container mx-auto px-8 py-12 relative z-10">
        <div className="text-gray-600 text-sm mb-6">
          Home <ChevronRight className="inline-block w-4 h-4 mx-1" /> Test Results
        </div>

        <h1 className="text-4xl font-bold text-[#1e2a4a] mb-8">Test Results</h1>

        <div className="border-b border-gray-200 mb-8 flex gap-8 text-lg">
          {(["All Results", "Abnormal", "Pending", "Archived"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 -mb-px font-semibold transition-colors ${
                tab === activeTab ? "text-[#1E88E5] border-b-2 border-[#1E88E5]" : "text-gray-600 hover:text-[#1E88E5]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-8">
          <div className="w-1/2 space-y-4">
            {myId && filteredResults.length > 0 ? (
              filteredResults.map((test) => (
                <Card
                  key={test.id}
                  onClick={() => setSelectedTest(test)}
                  className={`cursor-pointer rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all bg-white/95 backdrop-blur-sm ${
                    selectedTest?.id === test.id ? "border-[#1E88E5] ring-2 ring-[#1E88E5]" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{test.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                          test.status
                        )}`}
                      >
                        {test.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Collected: {formatDateTime(test.collectedDate, false)} • Ordered by: {test.orderedBy}
                    </p>
                    {test.keyValues && (
                      <p className="text-sm text-gray-600 mt-1">Key values: {test.keyValues}</p>
                    )}
                    {test.flaggedNotes && (
                      <p className="text-sm text-red-600 mt-1">Flagged: {test.flaggedNotes}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : myId ? (
              <div className="text-center py-16 text-gray-500">
                No {activeTab.toLowerCase()} test results found.
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                Loading test results...
              </div>
            )}
          </div>

          <div className="w-1/2">
            {selectedTest ? (
              <Card className="rounded-2xl border border-gray-200 shadow-lg p-6 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Result Preview</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                        selectedTest.status
                      )}`}
                    >
                      {selectedTest.status}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#1e2a4a] mb-3">{selectedTest.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Collected {formatDateTime(selectedTest.collectedDate, true)}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">Ordered by {selectedTest.orderedBy}</p>
                  {selectedTest.lab && (
                    <p className="text-sm text-gray-600 mb-4">
                      Lab: {selectedTest.lab} {selectedTest.labLocation && `— ${selectedTest.labLocation}`}
                    </p>
                  )}

                  {selectedTest.analytes && selectedTest.analytes.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Key Analytes</h3>
                      <div className="grid grid-cols-3 gap-2 text-sm text-gray-800">
                        <span className="font-semibold">Analyte</span>
                        <span className="font-semibold">Result</span>
                        <span className="font-semibold">Reference</span>
                        {selectedTest.analytes.map((analyte, index) => (
                          <React.Fragment key={index}>
                            <span>{analyte.name}</span>
                            <span className={getOutOfRangeClass(analyte.result, analyte.reference)}>
                              {analyte.result}
                            </span>
                            <span>{analyte.reference}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTest.doctorNote && (
                    <div className="bg-blue-50 border-l-4 border-[#1E88E5] p-4 rounded-lg text-blue-800 text-sm mt-4">
                      <p className="font-semibold mb-1">Doctor note:</p>
                      <p>{selectedTest.doctorNote}</p>
                    </div>
                  )}

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => setShowDownloadModal(true)}
                      className="bg-[#1E88E5] hover:bg-[#1976d2] text-white px-6 py-3 rounded-lg text-base"
                    >
                      <Download className="w-5 h-5 mr-2" /> Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-16 text-gray-500">Select a test to view details.</div>
            )}
          </div>
        </div>
      </main>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Download Report</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDownloadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Download Format
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDownloadFormat("pdf")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${
                      downloadFormat === "pdf"
                        ? "border-[#1E88E5] bg-blue-50 text-[#1E88E5]"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => setDownloadFormat("csv")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${
                      downloadFormat === "csv"
                        ? "border-[#1E88E5] bg-blue-50 text-[#1E88E5]"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    CSV
                  </button>
                </div>
              </div>

              {/* Include Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Include in Report
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAnalytes}
                      onChange={(e) => setIncludeAnalytes(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]"
                    />
                    <span className="text-gray-700">Test Results & Analytes</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDoctorNotes}
                      onChange={(e) => setIncludeDoctorNotes(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]"
                    />
                    <span className="text-gray-700">Doctor's Notes</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleDownloadReport}
                  className="flex-1 h-12 bg-[#1E88E5] hover:bg-[#1976d2] text-white font-semibold text-base rounded-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => setShowDownloadModal(false)}
                  variant="outline"
                  className="flex-1 h-12 border-2 border-gray-300 text-gray-700 font-semibold text-base rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
