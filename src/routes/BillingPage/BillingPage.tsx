import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HeaderSection } from "../../components/HeaderSection";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ChevronLeft, Download, CreditCard } from "lucide-react";
import authService from "../../services/authService";
import { downloadPaymentBill, downloadOutstandingBill } from "../../utils/downloadBill";

// ---------- Types ----------
interface Bill {
  id: string;
  provider: string;
  amount: number;
  dueDate: string;
  status: "Pending" | "Paid" | "Overdue";
}

interface PaymentHistory {
  id: string;
  date: string;
  invoice: string;
  department: string;
  amount: number;
  status: "Pending" | "Paid";
}

// ---------- Storage Keys ----------
const MOCK_BILLS_KEY = "mock_bills";
const MOCK_PAYMENT_HISTORY_KEY = "mock_payment_history";

// ---------- Initial Seeds (idempotent) ----------
if (!localStorage.getItem(MOCK_BILLS_KEY)) {
  const initialBills: Bill[] = [
    {
      id: "bill1",
      provider: "USF Health - Radiology",
      amount: 180.0,
      dueDate: "2025-11-30",
      status: "Pending",
    },
    {
      id: "bill2",
      provider: "General Practice - Dr. Smith",
      amount: 75.0,
      dueDate: "2025-12-15",
      status: "Pending",
    },
    {
      id: "bill3",
      provider: "Physical Therapy",
      amount: 120.0,
      dueDate: "2025-10-01",
      status: "Overdue",
    },
  ];
  localStorage.setItem(MOCK_BILLS_KEY, JSON.stringify(initialBills));
}

if (!localStorage.getItem(MOCK_PAYMENT_HISTORY_KEY)) {
  const initialPaymentHistory: PaymentHistory[] = [
    // NOTE: We intentionally do NOT seed pay1 (Invoice #30220) anymore.
    { id: "pay2", date: "2025-09-12", invoice: "Invoice #31000", department: "Physiology", amount: 240.0, status: "Paid" },
    { id: "pay3", date: "2025-08-02", invoice: "Invoice #30935", department: "Imaging", amount: 260.0, status: "Paid" },
  ];
  localStorage.setItem(MOCK_PAYMENT_HISTORY_KEY, JSON.stringify(initialPaymentHistory));
}

// ---------- Helpers ----------
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// One-time cleanup: permanently remove the previously-seeded Radiology $120.00 (Invoice #30220)
const PAYMENT_TO_REMOVE = {
  id: "pay1",
  invoice: "Invoice #30220",
  department: "Radiology",
  amount: 120.0,
};

function loadBills(): Bill[] {
  return JSON.parse(localStorage.getItem(MOCK_BILLS_KEY) || "[]");
}

function loadAndCleanPaymentHistory(): PaymentHistory[] {
  const raw = localStorage.getItem(MOCK_PAYMENT_HISTORY_KEY);
  const list: PaymentHistory[] = raw ? JSON.parse(raw) : [];

  const cleaned = list.filter(
    (p) =>
      p.id !== PAYMENT_TO_REMOVE.id &&
      !(p.invoice === PAYMENT_TO_REMOVE.invoice &&
        p.department === PAYMENT_TO_REMOVE.department &&
        Number(p.amount) === PAYMENT_TO_REMOVE.amount)
  );

  if (cleaned.length !== list.length) {
    localStorage.setItem(MOCK_PAYMENT_HISTORY_KEY, JSON.stringify(cleaned));
  }
  return cleaned;
}

// ---------- Component ----------
export function BillingPage(): JSX.Element {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);

    // Initial load
    setBills(loadBills());
    setPaymentHistory(loadAndCleanPaymentHistory());

    // Keep in sync if another tab updates storage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === MOCK_BILLS_KEY || event.key === MOCK_PAYMENT_HISTORY_KEY) {
        setBills(loadBills());
        setPaymentHistory(loadAndCleanPaymentHistory());
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  const handlePayNow = (bill: Bill) => {
    navigate("/pay-now", { state: { bill } });
  };

  const handleDownloadBill = (bill: Bill) => downloadOutstandingBill(bill, currentUser);
  const handleDownloadPaymentReceipt = (payment: PaymentHistory) =>
    downloadPaymentBill(payment, currentUser);

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E3F2FD] to-white" />

      {/* Right-side illustration (blend to remove white background) */}
      <img
        src="https://c.animaapp.com/mhkp6uvn3Dubvu/img/image_6.png"
        alt="Woman holding bill"
        aria-hidden="true"
        style={{ mixBlendMode: "multiply" }}
        className="
          pointer-events-none select-none
          absolute z-0
          right-[-40px]
          top-[300px]
          w-[700px]
          md:w-[750px] lg:w-[800px]
          object-contain opacity-90
        "
      />

      {/* Soft overlay for readability */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px] z-[1]" />

      <HeaderSection />

      {/* Extra right padding to keep main content left of the art */}
      <main className="relative z-10 container mx-auto px-8 py-12 pr-[420px]">
        {/* Back link */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-black text-lg font-medium mb-8 hover:text-[#1E88E5] transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
          Home
        </Link>

        <div className="max-w-5xl">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-black mb-3">Billing & Payments</h1>
            <p className="text-xl text-gray-600">
              View your balance, Payment history, and securely pay your bills online
            </p>
          </div>

          {/* Outstanding Bills */}
          <div className="relative mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">Outstanding Bills</h2>
            {bills.filter((b) => b.status !== "Paid").length > 0 ? (
              bills
                .filter((b) => b.status !== "Paid")
                .map((bill) => (
                  <Card
                    key={bill.id}
                    className="relative z-10 rounded-3xl shadow-lg bg-white/95 backdrop-blur-sm mb-4"
                  >
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {bill.provider}
                          </h3>
                          <p className="text-lg text-gray-600">Due by: {formatDate(bill.dueDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-red-600 mb-2">
                            ${bill.amount.toFixed(2)}
                          </p>
                          <span
                            className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
                              bill.status === "Pending"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {bill.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          onClick={() => handlePayNow(bill)}
                          className="flex-1 h-12 bg-[#1E88E5] hover:bg-[#1976d2] text-white font-semibold text-lg rounded-xl"
                        >
                          <CreditCard className="w-5 h-5 mr-2" />
                          Pay Now
                        </Button>
                        <Button
                          onClick={() => handleDownloadBill(bill)}
                          variant="outline"
                          className="h-12 px-6 border-2 border-gray-300 text-gray-700 font-semibold text-lg rounded-xl hover:bg-gray-50"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download Bill
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">No outstanding bills.</div>
            )}
          </div>

          {/* Payment History */}
          <div>
            <h2 className="text-3xl font-bold text-black mb-6">Payment History</h2>
            <Card className="rounded-3xl shadow-lg bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-6 gap-4 px-8 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="font-bold text-gray-900">Date</div>
                  <div className="font-bold text-gray-900">Invoice</div>
                  <div className="font-bold text-gray-900">Department</div>
                  <div className="font-bold text-gray-900">Amount</div>
                  <div className="font-bold text-gray-900">Status</div>
                  <div className="font-bold text-gray-900">Action</div>
                </div>

                {paymentHistory.map((payment, index) => (
                  <div
                    key={payment.id}
                    className={`grid grid-cols-6 gap-4 px-8 py-5 ${
                      index !== paymentHistory.length - 1 ? "border-b border-gray-100" : ""
                    } hover:bg-gray-50 transition-colors`}
                  >
                    <div className="text-gray-900">{formatDate(payment.date)}</div>
                    <div className="text-gray-900">{payment.invoice}</div>
                    <div className="text-gray-900">{payment.department}</div>
                    <div className="text-gray-900 font-semibold">
                      ${payment.amount.toFixed(2)}
                    </div>
                    <div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          payment.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    <div>
                      <Button
                        onClick={() => handleDownloadPaymentReceipt(payment)}
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
