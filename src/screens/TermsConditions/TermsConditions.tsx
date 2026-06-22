import React from "react";

export function TermsConditions(): JSX.Element {
  return (
    <main className="terms-page-bg info-page-bg min-h-screen p-10 bg-[linear-gradient(rgba(245,248,251,0.65),rgba(245,248,251,0.65)),url('https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center">
      <a href="/" className="text-[#2563eb] font-semibold text-lg">
        ← Back to Home
      </a>

      <section className="mt-8 bg-white/95 rounded-3xl shadow-xl p-10 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1e2a4a] mb-4">
          Terms and Conditions
        </h1>

        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          These terms explain the general rules for using this healthcare patient
          portal.
        </p>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Portal Use
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This portal is designed to help patients access appointments, lab
              results, medications, messages, billing details, and visit history
              in one place.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Account Responsibility
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Users are responsible for keeping their login details private and
              for making sure their account information is accurate and up to
              date.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Medical Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Information shown in the portal is for patient access and care
              management. Patients should contact their healthcare provider for
              medical advice, diagnosis, or treatment decisions.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Emergency Use
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This portal is not intended for emergencies. In urgent or
              life-threatening situations, patients should call emergency
              services or visit the nearest emergency room.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Billing and Payments
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Billing details are provided to help patients review charges,
              insurance coverage, patient responsibility, due dates, and
              available payment options.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These terms may be updated as the portal adds new features or
              improves existing services.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}