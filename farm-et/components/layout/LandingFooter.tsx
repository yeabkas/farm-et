import { Tractor } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 py-12 border-t border-gray-800 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Tractor className="w-6 h-6 text-emerald-500" />
          <span className="text-xl font-bold text-white">Farm-ET</span>
        </div>
        <div className="text-gray-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} Farm-ET. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="text-gray-400 hover:text-white transition text-sm">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-white transition text-sm">Terms of Service</a>
          <a href="#" className="text-gray-400 hover:text-white transition text-sm">Contact</a>
        </div>
      </div>
    </footer>
  );
}
