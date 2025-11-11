import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { HeaderSection } from "../../components/HeaderSection";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ChevronLeft, CreditCard } from "lucide-react";
import authService from "../../services/authService";

// Define localStorage keys for consistency
const MOCK_BILLS_KEY = "mock_bills";
const MOCK_PAYMENT_HISTORY_KEY = "mock_payment_history";

export function PayNowPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { bill } = location.state || {}; // Get bill details from navigation state

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardOwner, setCardOwner] = useState("");
  const [address, setAddress] = useState("1234, HCI st, Springfield, IL 33613"); // Pre-filled as per design
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);

    if (!bill) {
      setError("No bill selected for payment.");
    }
  }, [navigate, bill]);

  const handlePayNow = async () => {
    setError("");
    if (!bill) {
      setError("No bill selected for payment.");
      return;
    }
    if (!cardNumber || !expiryDate || !cvv || !cardOwner || !address || !agreeToTerms) {
      setError("Please fill in all payment details and agree to the terms.");
      return;
    }

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

      // 1. Update the bill status in the stored bills
      const storedBills = JSON.parse(localStorage.getItem(MOCK_BILLS_KEY) || "[]");
      const updatedBills = storedBills.map((b: any) =>
        b.id === bill.id ? { ...b, status: "Paid" } : b
      );
      localStorage.setItem(MOCK_BILLS_KEY, JSON.stringify(updatedBills));

      // 2. Add a new entry to the payment history
      const storedPaymentHistory = JSON.parse(localStorage.getItem(MOCK_PAYMENT_HISTORY_KEY) || "[]");
      const newPaymentEntry = {
        id: `pay-${Date.now()}`, // Unique ID for payment history
        date: new Date().toISOString().split('T')[0],
        invoice: `Invoice #${Math.floor(Math.random() * 100000)}`, // Random invoice number
        department: bill.provider.split(' - ')[0].trim(), // Extract department from provider
        amount: bill.amount,
        status: "Paid",
      };
      localStorage.setItem(MOCK_PAYMENT_HISTORY_KEY, JSON.stringify([newPaymentEntry, ...storedPaymentHistory]));

      alert(`Payment of $${bill.amount.toFixed(2)} for ${bill.provider} processed successfully!`);
      navigate("/billing"); // Go back to billing page
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!bill) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Error: No Bill Selected</h1>
        <p className="text-lg text-gray-700 mb-6">
          Please go back to the <Link to="/billing" className="text-[#1E88E5] hover:underline">Billing & Payments</Link> page and select a bill to pay.
        </p>
        <Button onClick={() => navigate("/billing")} className="bg-[#1E88E5] hover:bg-[#1976d2] text-white px-6 py-3 rounded-lg">
          Go to Billing
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background with new gradient image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://c.animaapp.com/mhkp6uvn3Dubvu/img/image_10.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Soft overlay for readability */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-[1]" />

      <HeaderSection />

      <main className="flex-1 container mx-auto px-8 py-12 relative z-10">
        {/* Back to Billing */}
        <Link
          to="/billing"
          className="flex items-center gap-2 text-black text-lg font-medium mb-8 hover:text-[#1E88E5] transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
          Billing
        </Link>

        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-12">
          {/* Left Side - Billing Summary */}
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
            <h1 className="text-3xl font-bold text-black mb-6">MyChart Payment</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Billing Summary</h2>

            {/* Payment Method Icons */}
            <div className="flex items-center justify-between mb-6">
              <img src="https://c.animaapp.com/mhkp6uvn3Dubvu/img/image_9.png" alt="Payment Methods" className="w-[420px] md:w-[300px] lg:w-[300px] h-auto object-contain drop-shadow-md" />
            </div>

            {/* Card Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card</label>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    type="text"
                    placeholder="Card number"
                    value={cardNumber}
                    onChange={(e) => {
                      const input = e.target.value.replace(/\D/g, ''); // Remove non-digits
                      const formatted = input.replace(/(\d{4})(?=\d)/g, '$1 '); // Add space every 4 digits
                      setCardNumber(formatted);
                    }}
                    maxLength={19} // 16 digits + 3 spaces
                    className="col-span-2 h-12 border-gray-300 rounded-lg text-base px-4"
                  />
          <Input
            type="text"
            placeholder="MM / YY"
            value={expiryDate}
            onChange={(e) => {
              const input = e.target.value.replace(/\D/g, ''); // Remove non-digits
              let formatted = input;
              if (input.length > 2) {
                formatted = input.substring(0, 2) + ' / ' + input.substring(2, 4);
              }
              setExpiryDate(formatted);
            }}
            maxLength={7} // MM / YY (5 chars) + 2 for spaces
            className="h-12 border-gray-300 rounded-lg text-base px-4"
          />
          <Input
            type="text"
            placeholder="CVV"
            value={cvv}
            onChange={(e) => {
              const input = e.target.value.replace(/\D/g, ''); // Remove non-digits
              setCvv(input);
            }}
            maxLength={4} // CVV is usually 3 or 4 digits
            className="h-12 border-gray-300 rounded-lg text-base px-4"
          />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Owner</label>
                <Input
                  type="text"
                  placeholder="Name on the Card"
                  value={cardOwner}
                  onChange={(e) => setCardOwner(e.target.value)}
                  className="h-12 border-gray-300 rounded-lg text-base px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <Input
                  type="text"
                  placeholder="1234, HCI st, Springfield, IL 33613"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-12 border-gray-300 rounded-lg text-base px-4"
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the{" "}
                  <Link to="/terms" className="text-[#1E88E5] hover:underline">
                    terms & conditions
                  </Link>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handlePayNow}
                disabled={!agreeToTerms || loading || !bill}
                className="w-full h-14 bg-[#1E88E5] hover:bg-[#1976d2] text-white font-semibold text-lg rounded-xl mt-6"
              >
                {loading ? "Processing Payment..." : `Pay Now $${bill?.amount.toFixed(2) || "0.00"}`}
              </Button>
            </div>
          </div>

          {/* Right Side - Current Payment Summary */}
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-lg h-fit">
            <h2 className="text-3xl font-bold text-black mb-6">Current Payment</h2>
            {bill ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg text-gray-700">Service</p>
                  <p className="text-lg font-medium text-gray-900">{bill.provider}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-lg text-gray-700">Amount Due</p>
                  <p className="text-2xl font-bold text-red-600">${bill.amount.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No bill selected.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
