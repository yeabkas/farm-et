"use client";

import { useState } from "react";
import { StepWizardForm } from "@/components/forms/StepWizardForm";
import { OnboardingMediaModal } from "@/components/modals/OnboardingMediaModal";

export default function OnboardingPage() {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <OnboardingMediaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
      <StepWizardForm />
    </div>
  );
}
