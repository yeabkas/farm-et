"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface OnboardingMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingMediaModal({ isOpen, onClose }: OnboardingMediaModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl bg-linear-to-br from-[#d49e1740] via-[#83c80b5c] to-[#10b98157] p-6">
        <DialogHeader>
          <DialogTitle className= "font-mono ">Welcome to FARM-ET your presonal Farm Management System</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full rounded-lg bg-gray-100 flex items-center justify-center border">
          <p className="text-sm font-mono text-gray-500">[ Embedded Media / Intro Video Viewport ]</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}