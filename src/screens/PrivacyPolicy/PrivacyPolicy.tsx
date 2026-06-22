import React from "react";

export function PrivacyPolicy(): JSX.Element {
  return (
    <main className="info-page-bg min-h-screen p-10 bg-[linear-gradient(rgba(245,248,251,0.65),rgba(245,248,251,0.65)),url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center">
      <a href="/" className="text-[#2563eb] font-semibold text-lg">
        ← Back to Home
      </a>

      <section className="mt-8 bg-white/95 rounded-3xl shadow-xl p-10 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1e2a4a] mb-4">
          Privacy Policy
        </h1>

        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Your privacy is important. This page explains how this patient portal
          protects and handles user information.
        </p>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Information We Collect
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The portal may collect basic account details such as name, email,
              phone number, appointment information, test results, medications,
              visit history, and billing-related information.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              How Information Is Used
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Information is used to help patients manage healthcare tasks such
              as scheduling appointments, viewing records, messaging providers,
              checking medications, and reviewing bills.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Data Protection
            </h2>
            <p className="text-gray-700 leading-relaxed">
              In a real healthcare system, patient data should be protected using
              secure login, encryption, access controls, and privacy-compliant
              storage practices.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Sharing Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Health information should only be shared with authorized care
              teams, providers, or services when required for patient care,
              billing, or legal compliance.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Patient Control
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Patients should be able to access their records, review their
              information, and manage how their healthcare data is used within
              the portal.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}