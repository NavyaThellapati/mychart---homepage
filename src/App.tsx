import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MyChartChatbot } from "./components/MyChartChatbot";

const lazyNamed = <T extends Record<string, React.ComponentType<any>>, K extends keyof T>(
  importer: () => Promise<T>,
  exportName: K
) =>
  lazy(async () => ({
    default: (await importer())[exportName],
  }));

const Homepage = lazyNamed(() => import("./screens/Homepage"), "Homepage");
const Login = lazyNamed(() => import("./screens/Login"), "Login");
const Register = lazyNamed(() => import("./screens/Register"), "Register");
const Dashboard = lazyNamed(() => import("./screens/Dashboard"), "Dashboard");
const Profile = lazyNamed(() => import("./screens/Profile"), "Profile");
const Settings = lazyNamed(() => import("./screens/Settings"), "Settings");
const AppointmentsPage = lazyNamed(() => import("./routes/AppointmentsPage"), "AppointmentsPage");
const NewAppointment = lazyNamed(() => import("./routes/NewAppointment"), "NewAppointment");
const AppointmentDetailsPage = lazyNamed(
  () => import("./routes/AppointmentDetailsPage"),
  "AppointmentDetailsPage"
);
const TestResultsPage = lazyNamed(() => import("./routes/TestResultsPage"), "TestResultsPage");
const BillingPage = lazyNamed(() => import("./routes/BillingPage"), "BillingPage");
const MessagesPage = lazyNamed(() => import("./routes/MessagesPage"), "MessagesPage");
const NewMessagePage = lazyNamed(() => import("./routes/NewMessagePage"), "NewMessagePage");
const ReplyMessagePage = lazyNamed(() => import("./routes/ReplyMessagePage"), "ReplyMessagePage");
const PayNowPage = lazyNamed(() => import("./routes/PayNowPage"), "PayNowPage");
const MedicationsPage = lazyNamed(() => import("./routes/MedicationsPage"), "MedicationsPage");
const InteroperabilityGuide = lazyNamed(
  () => import("./screens/InteroperabilityGuide"),
  "InteroperabilityGuide"
);
const FAQs = lazyNamed(() => import("./screens/FAQs"), "FAQs");
const PrivacyPolicy = lazyNamed(() => import("./screens/PrivacyPolicy"), "PrivacyPolicy");
const TermsConditions = lazyNamed(() => import("./screens/TermsConditions"), "TermsConditions");
const ForgotPassword = lazy(() => import("./screens/Login/ForgotPassword"));

function PageSkeleton(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 dark:bg-[#020817]">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-12 w-56 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export const App = (): JSX.Element => {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  return (
    <Router>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          <Route
            path="/interoperability-guide"
            element={<InteroperabilityGuide />}
          />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsConditions />} />

          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/appointments/new" element={<NewAppointment />} />
          <Route path="/appointments/:id" element={<AppointmentDetailsPage />} />
          <Route path="/test-results" element={<TestResultsPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/pay-now" element={<PayNowPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/new" element={<NewMessagePage />} />
          <Route path="/messages/reply" element={<ReplyMessagePage />} />
          <Route path="/medications" element={<MedicationsPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Suspense>
      <MyChartChatbot />
    </Router>
  );
};
