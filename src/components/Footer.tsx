import React from "react";
import { Terminal } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-5xl mx-auto py-10 mt-14 sm:mt-20 border-t border-zinc-200/80 px-4 sm:px-0 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
      <div className="flex items-center gap-2">
        <Terminal className="w-3.5 h-3.5 text-zinc-800" />
        <span>Designed & built for high-performance B2B operations</span>
      </div>

      <div className="flex items-center gap-4">
        <span>Monochrome Aesthetic</span>
        <span>·</span>
        <span>&copy; {new Date().getFullYear()} Alexander V.</span>
      </div>
    </footer>
  );
};
