import React from "react";

export function InteroperabilityGuide(): JSX.Element {
  return (
    <main className="interoperability-page-bg info-page-bg min-h-screen p-10 bg-[linear-gradient(rgba(245,248,251,0.65),rgba(245,248,251,0.65)),url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center">
      <a href="/" className="text-[#2563eb] font-semibold text-lg">
        ← Back to Home
      </a>

      <section className="mt-8 bg-white/95 rounded-3xl shadow-xl p-10 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1e2a4a] mb-4">
          Interoperability Guide
        </h1>

        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Interoperability helps patients securely access and share healthcare
          information across different hospitals, clinics, and providers. It
          allows medical records, lab results, medications, appointments, and
          visit history to be available in one connected portal.
        </p>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Connected Care
            </h2>
            <p className="text-gray-700">
              View health information from multiple providers in one place.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Secure Sharing
            </h2>
            <p className="text-gray-700">
              Share records safely with doctors, specialists, and care teams.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Better Decisions
            </h2>
            <p className="text-gray-700">
              Providers can make faster decisions when information is clear.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#2563eb] mb-2">
              Patient Control
            </h2>
            <p className="text-gray-700">
              Patients can access and manage their own healthcare information.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}