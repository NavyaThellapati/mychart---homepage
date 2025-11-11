import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "./screens/Homepage";
import { Login } from "./screens/Login";
import { Register } from "./screens/Register";
import { Dashboard } from "./screens/Dashboard";
import { Profile } from "./screens/Profile";
import { Settings } from "./screens/Settings";
import { AppointmentsPage } from "./routes/AppointmentsPage";
import { NewAppointment } from "./routes/NewAppointment";
import { AppointmentDetailsPage } from "./routes/AppointmentDetailsPage";
import { TestResultsPage } from "./routes/TestResultsPage";
import { BillingPage } from "./routes/BillingPage";
import { MessagesPage } from "./routes/MessagesPage";
import { NewMessagePage } from "./routes/NewMessagePage";
import { ReplyMessagePage } from "./routes/ReplyMessagePage"; // Ensure this is correctly imported
import { PayNowPage } from "./routes/PayNowPage";
import { MedicationsPage } from "./routes/MedicationsPage";

export const App = (): JSX.Element => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
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
      </Routes>
    </Router>
  );
};
