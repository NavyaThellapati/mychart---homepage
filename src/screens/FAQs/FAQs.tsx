import React from "react";

export function FAQs(): JSX.Element {
  const faqs = [
    {
      question: "What can I do in this patient portal?",
      answer:
        "You can manage appointments, view lab results, check medications, send messages, review visit history, and view billing information in one place.",
    },
    {
      question: "Do I need an account to access my health information?",
      answer:
        "Yes. Users need to sign in to access private health information such as lab results, appointments, medications, and billing details.",
    },
    {
      question: "Can I schedule appointments online?",
      answer:
        "Yes. You can schedule new appointments, view upcoming visits, and check appointment details from the Appointments section.",
    },
    {
      question: "Can I reschedule or cancel an appointment?",
      answer:
        "Yes. Upcoming appointments can include options to reschedule or cancel, depending on provider availability.",
    },
    {
      question: "Where can I view my lab results?",
      answer:
        "Lab results can be viewed from the Test Results section after signing in to the portal.",
    },
    {
      question: "What does abnormal lab result mean?",
      answer:
        "An abnormal result means the value is outside the usual reference range. It does not always mean something serious, so patients should review the doctor's notes or message their provider.",
    },
    {
      question: "Can I message my doctor?",
      answer:
        "Yes. The Messages section allows patients to communicate with their care team about non-emergency questions.",
    },
    {
      question: "Can I request a prescription refill?",
      answer:
        "Yes. The Medications section can show active medications, dosage instructions, refill status, and refill request options.",
    },
    {
      question: "Where can I see my current medications?",
      answer:
        "Current and past medications can be viewed in the Medications section, including dosage, frequency, prescribing doctor, and instructions.",
    },
    {
      question: "Can I view my visit history?",
      answer:
        "Yes. The Visit History section shows previous appointments, diagnosis details, prescriptions, notes, and follow-up instructions.",
    },
    {
      question: "Is billing information available in the portal?",
      answer:
        "Yes. Patients can view bills, insurance coverage details, patient responsibility, due dates, and payment options.",
    },
    {
      question: "Can I pay medical bills online?",
      answer:
        "Yes. The Billing section can include online payment options such as card payment, bank account payment, or payment plan options.",
    },
    {
      question: "What should I do if my bill looks incorrect?",
      answer:
        "Patients should review the bill details, insurance coverage, and patient responsibility amount, then contact billing support or their provider's office if something looks wrong.",
    },
    {
      question: "Is my health information secure?",
      answer:
        "The portal is designed to show private health information only after login. In a real system, authentication, encryption, and secure access controls would protect patient data.",
    },
    {
      question: "Can I access the portal on mobile?",
      answer:
        "Yes. The portal is designed to be responsive so patients can access key features from desktop, tablet, or mobile devices.",
    },
    {
      question: "What should I do in a medical emergency?",
      answer:
        "This portal is not for emergencies. For urgent or life-threatening situations, patients should call emergency services or go to the nearest emergency room.",
    },
  ];

  return (
<main className="min-h-screen p-10 bg-[linear-gradient(rgba(245,248,251,0.65),rgba(245,248,251,0.65)),url('https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center">      <a href="/" className="text-[#2563eb] font-semibold text-lg">
        ← Back to Home
      </a>

      <section className="mt-8 bg-white/95 rounded-3xl shadow-xl p-10 max-w-5xl mx-auto">
              <h1 className="text-4xl font-bold text-[#1e2a4a] mb-4">
          Frequently Asked Questions
        </h1>

        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Find answers to common questions about using the MyChart patient portal.
        </p>

        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-blue-50 border border-blue-100 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-[#2563eb] mb-2">
                {faq.question}
              </h2>
              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}