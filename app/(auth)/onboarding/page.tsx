"use client";

import { useState } from "react";
import { StepWizardForm } from "@/components/forms/StepWizardForm";
import { OnboardingMediaModal } from "@/components/modals/OnboardingMediaModal";

export default function OnboardingPage() {
  const [showMediaModal, setShowMediaModal] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Welcome to Farm-ET</h1>
        <p className="text-gray-600">Let&apos;s set up your farm operational details in just a few steps.</p>
        
        <button
          onClick={() => setShowMediaModal(true)}
          className="text-sm font-semibold text-green-600 hover:text-green-700 underline"
        >
          📹 Watch Getting Started Video Guide
        </button>

        <div className="mt-6 text-left">
          <StepWizardForm />
        </div>
      </div>

      <OnboardingMediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
      />
    </main>
  );
}