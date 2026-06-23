import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeaderSection } from "../../components/HeaderSection";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  UserRound,
  X,
} from "lucide-react";
import authService from "../../services/authService";
import { downloadTestReport } from "../../utils/downloadReport";
import { useTheme } from "../../contexts/ThemeContext";

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

  const refNums = reference.match(/\d+(\.\d+)?/g)?.map(parseFloat) ?? [];
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
const getStatusBadgeClass = (status: string, isDark: boolean) => {
  switch (status) {
    case "Normal":
      return isDark ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/25" : "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Abnormal":
      return isDark ? "bg-rose-400/15 text-rose-300 border-rose-400/25" : "bg-rose-50 text-rose-700 border-rose-200";
    case "Pending":
      return isDark ? "bg-amber-400/15 text-amber-200 border-amber-400/25" : "bg-amber-50 text-amber-700 border-amber-200";
    case "Archived":
      return isDark ? "bg-slate-500/20 text-slate-300 border-slate-500/30" : "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return isDark ? "bg-slate-500/20 text-slate-300 border-slate-500/30" : "bg-slate-100 text-slate-600 border-slate-200";
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
  const { isDarkMode } = useTheme();
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
    const selectedIsVisible = filteredResults.some((result) => result.id === selectedTest?.id);
    if (filteredResults.length > 0 && !selectedIsVisible) {
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
        currentUser ?? undefined
      );
      setShowDownloadModal(false);
      alert(`Report downloaded successfully as ${downloadFormat.toUpperCase()}!`);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  const resultCounts = {
    all: myResults.length,
    abnormal: myResults.filter((result) => result.status === "Abnormal").length,
    pending: myResults.filter((result) => result.status === "Pending").length,
    archived: myResults.filter((result) => result.status === "Archived").length,
  };

  const pageText = isDarkMode ? "text-slate-100" : "text-slate-950";
  const mutedText = isDarkMode ? "text-slate-300" : "text-slate-600";
  const panelClass = isDarkMode
    ? "border-slate-700/80 bg-[#101d2d]/95"
    : "border-slate-200 bg-white/95";

  return (
    <div className={`min-h-screen relative flex flex-col ${isDarkMode ? "bg-[#07111f]" : "bg-slate-50"}`}>
      <div
        className="fixed inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'url(https://c.animaapp.com/mhkp6uvn3Dubvu/img/chatgpt-image-nov-10-2025-03_07_15-pm.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <HeaderSection />

      <main className="relative z-10 mx-auto w-full max-w-[1680px] flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className={`mb-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:text-[#1E88E5] ${mutedText}`}
        >
          Home <ChevronRight className="h-4 w-4" /> Test Results
        </button>

        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase text-[#1E88E5]">
              <FileText className="h-4 w-4" /> Health records
            </div>
            <h1 className={`text-3xl font-bold sm:text-4xl ${pageText}`}>Test Results</h1>
            <p className={`mt-2 max-w-2xl text-base ${mutedText}`}>
              Review laboratory reports, reference ranges, and notes from your care team.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[420px]">
            {[
              { label: "Available", value: resultCounts.all, icon: FileText, tone: "text-[#1E88E5]" },
              { label: "Needs review", value: resultCounts.abnormal, icon: AlertTriangle, tone: "text-rose-500" },
              { label: "Pending", value: resultCounts.pending, icon: Clock3, tone: "text-amber-500" },
            ].map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className={`border px-4 py-3 ${panelClass}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold uppercase ${mutedText}`}>{label}</span>
                  <Icon className={`h-4 w-4 ${tone}`} />
                </div>
                <p className={`mt-1 text-2xl font-bold ${pageText}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`mb-6 flex gap-1 overflow-x-auto border-b ${isDarkMode ? "border-slate-700" : "border-slate-200"}`} role="tablist" aria-label="Test result filters">
          {(["All Results", "Abnormal", "Pending", "Archived"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              role="tab"
              aria-selected={tab === activeTab}
              className={`-mb-px flex min-w-max items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === activeTab
                  ? "border-[#1E88E5] text-[#1E88E5]"
                  : `border-transparent hover:text-[#1E88E5] ${mutedText}`
              }`}
            >
              {tab}
              <span className={`min-w-6 border px-1.5 py-0.5 text-center text-xs ${isDarkMode ? "border-slate-600 bg-slate-800" : "border-slate-200 bg-slate-100"}`}>
                {tab === "All Results"
                  ? resultCounts.all
                  : tab === "Abnormal"
                    ? resultCounts.abnormal
                    : tab === "Pending"
                      ? resultCounts.pending
                      : resultCounts.archived}
              </span>
            </button>
          ))}
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(360px,0.85fr)_minmax(560px,1.15fr)]">
          <section aria-label="Test result list" className={`min-w-0 overflow-hidden border ${panelClass}`}>
            <div className={`flex items-center justify-between border-b px-5 py-4 ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
              <div>
                <h2 className={`text-lg font-bold ${pageText}`}>{activeTab}</h2>
                <p className={`text-sm ${mutedText}`}>{filteredResults.length} reports</p>
              </div>
              <CalendarDays className="h-5 w-5 text-[#1E88E5]" />
            </div>

            {myId && filteredResults.length > 0 ? (
              <div className={`divide-y ${isDarkMode ? "divide-slate-700" : "divide-slate-200"}`}>
                {filteredResults.map((test) => (
                <button
                  key={test.id}
                  type="button"
                  onClick={() => setSelectedTest(test)}
                  className={`relative w-full px-5 py-5 text-left transition-colors ${
                    selectedTest?.id === test.id
                      ? isDarkMode ? "bg-[#152a40]" : "bg-blue-50"
                      : isDarkMode ? "hover:bg-slate-800/70" : "hover:bg-slate-50"
                  }`}
                >
                  {selectedTest?.id === test.id && <span className="absolute inset-y-0 left-0 w-1 bg-[#1E88E5]" />}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className={`text-base font-bold ${pageText}`}>{test.name}</h3>
                      <p className={`mt-1 flex items-center gap-1.5 text-sm ${mutedText}`}>
                        <CalendarDays className="h-4 w-4 shrink-0" /> {formatDateTime(test.collectedDate, false)}
                      </p>
                    </div>
                      <span
                        className={`shrink-0 border px-2.5 py-1 text-xs font-bold ${getStatusBadgeClass(
                          test.status, isDarkMode
                        )}`}
                      >
                        {test.status}
                      </span>
                  </div>
                  <p className={`mt-3 line-clamp-1 text-sm ${mutedText}`}>{test.keyValues || "No result summary available"}</p>
                  <div className={`mt-3 flex items-center justify-between gap-3 text-xs ${mutedText}`}>
                    <span className="flex min-w-0 items-center gap-1.5"><UserRound className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{test.orderedBy}</span></span>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </div>
                  {test.flaggedNotes && (
                    <p className={`mt-3 border-l-2 border-rose-500 pl-3 text-sm font-semibold ${isDarkMode ? "text-rose-300" : "text-rose-700"}`}>
                      {test.flaggedNotes}
                    </p>
                  )}
                </button>
              ))}
              </div>
            ) : myId ? (
              <div className={`px-6 py-16 text-center ${mutedText}`}>
                <FileText className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                No {activeTab.toLowerCase()} test results found.
              </div>
            ) : (
              <div className={`px-6 py-16 text-center ${mutedText}`}>
                Loading test results...
              </div>
            )}
          </section>

          <section aria-label="Selected result details" className="min-w-0 xl:sticky xl:top-6">
            {selectedTest ? (
              <Card className={`overflow-hidden rounded-md border shadow-xl ${panelClass}`}>
                <CardContent className="p-0">
                  <div className={`flex flex-col justify-between gap-4 border-b px-6 py-5 sm:flex-row sm:items-start ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                    <div>
                      <p className="mb-1 text-sm font-bold uppercase text-[#1E88E5]">Result details</p>
                      <h2 className={`text-2xl font-bold ${pageText}`}>{selectedTest.name}</h2>
                    </div>
                    <span
                      className={`w-fit border px-3 py-1.5 text-sm font-bold ${getStatusBadgeClass(
                        selectedTest.status, isDarkMode
                      )}`}
                    >
                      {selectedTest.status}
                    </span>
                  </div>

                  <div className={`grid gap-px border-b sm:grid-cols-3 ${isDarkMode ? "border-slate-700 bg-slate-700" : "border-slate-200 bg-slate-200"}`}>
                    {[
                      { icon: CalendarDays, label: "Collected", value: formatDateTime(selectedTest.collectedDate, true) },
                      { icon: UserRound, label: "Ordered by", value: selectedTest.orderedBy },
                      { icon: Building2, label: "Laboratory", value: selectedTest.lab ? `${selectedTest.lab}${selectedTest.labLocation ? ` · ${selectedTest.labLocation}` : ""}` : "Not provided" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className={`min-w-0 px-5 py-4 ${isDarkMode ? "bg-[#101d2d]" : "bg-white"}`}>
                        <p className={`flex items-center gap-2 text-xs font-bold uppercase ${mutedText}`}><Icon className="h-4 w-4 text-[#1E88E5]" />{label}</p>
                        <p className={`mt-1 truncate text-sm font-semibold ${pageText}`} title={value}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {selectedTest.analytes && selectedTest.analytes.length > 0 && (
                    <div className="px-6 py-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className={`text-lg font-bold ${pageText}`}>Analytes</h3>
                        <span className={`text-sm ${mutedText}`}>{selectedTest.analytes.length} values</span>
                      </div>
                      <div className={`overflow-x-auto border ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                          <thead className={isDarkMode ? "bg-slate-800" : "bg-slate-50"}>
                            <tr className={mutedText}>
                              <th className="px-4 py-3 font-bold">Analyte</th>
                              <th className="px-4 py-3 font-bold">Result</th>
                              <th className="px-4 py-3 font-bold">Reference range</th>
                              <th className="px-4 py-3 font-bold">Status</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDarkMode ? "divide-slate-700" : "divide-slate-200"}`}>
                            {selectedTest.analytes.map((analyte, index) => {
                              const outOfRange = Boolean(getOutOfRangeClass(analyte.result, analyte.reference));
                              return (
                                <tr key={index} className={isDarkMode ? "hover:bg-slate-800/60" : "hover:bg-slate-50"}>
                                  <td className={`px-4 py-3 font-semibold ${pageText}`}>{analyte.name}</td>
                                  <td className={`px-4 py-3 font-bold ${outOfRange ? (isDarkMode ? "text-rose-300" : "text-rose-700") : pageText}`}>{analyte.result}</td>
                                  <td className={`px-4 py-3 ${mutedText}`}>{analyte.reference}</td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${outOfRange ? (isDarkMode ? "text-rose-300" : "text-rose-700") : (isDarkMode ? "text-emerald-300" : "text-emerald-700")}`}>
                                      {outOfRange ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                      {outOfRange ? "Review" : "In range"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedTest.doctorNote && (
                    <div className={`mx-6 mb-5 border-l-4 border-[#1E88E5] px-5 py-4 ${isDarkMode ? "bg-blue-400/10 text-slate-200" : "bg-blue-50 text-slate-700"}`}>
                      <p className={`mb-1 font-bold ${pageText}`}>Care team note</p>
                      <p className="text-sm leading-6">{selectedTest.doctorNote}</p>
                    </div>
                  )}

                  <div className={`flex justify-end border-t px-6 py-5 ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                    <Button
                      onClick={() => setShowDownloadModal(true)}
                      className="h-11 bg-[#1E88E5] px-5 text-sm font-bold text-white hover:bg-[#1976d2]"
                    >
                      <Download className="mr-2 h-4 w-4" /> Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={`border px-6 py-16 text-center ${panelClass} ${mutedText}`}>
                <FileText className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                Select a test to view details.
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className={`w-full max-w-md rounded-md border p-6 shadow-2xl ${panelClass}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${pageText}`}>Download Report</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDownloadModal(false)}
                className={isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-500 hover:text-slate-800"}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className={`mb-3 block text-sm font-semibold ${pageText}`}>
                  Download Format
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDownloadFormat("pdf")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${
                      downloadFormat === "pdf"
                        ? "border-[#1E88E5] bg-blue-50 text-[#1E88E5]"
                        : isDarkMode
                          ? "border-slate-600 text-slate-200 hover:border-slate-400"
                          : "border-slate-300 text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => setDownloadFormat("csv")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${
                      downloadFormat === "csv"
                        ? "border-[#1E88E5] bg-blue-50 text-[#1E88E5]"
                        : isDarkMode
                          ? "border-slate-600 text-slate-200 hover:border-slate-400"
                          : "border-slate-300 text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    CSV
                  </button>
                </div>
              </div>

              {/* Include Options */}
              <div>
                <label className={`mb-3 block text-sm font-semibold ${pageText}`}>
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
                    <span className={mutedText}>Test Results & Analytes</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDoctorNotes}
                      onChange={(e) => setIncludeDoctorNotes(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]"
                    />
                    <span className={mutedText}>Doctor's Notes</span>
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
                  className={`h-12 flex-1 rounded-md border-2 font-semibold ${isDarkMode ? "border-slate-600 text-slate-200 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
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
