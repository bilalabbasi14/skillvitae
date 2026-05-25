"use client";

import { useState } from "react";

export default function LinkedInGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/60">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between font-medium text-zinc-900 dark:text-zinc-100"
      >
        <span className="flex items-center gap-2 text-sm">
          <svg
            className="h-5 w-5 text-blue-600 dark:text-blue-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
          How to get your LinkedIn PDF export?
        </span>
        <svg
          className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <ol className="list-decimal pl-4 space-y-1.5">
            <li>
              Go to your{" "}
              <strong className="text-zinc-950 dark:text-zinc-50">LinkedIn Profile</strong> (click your photo at the top → View Profile).
            </li>
            <li>
              Look at your profile introduction section, click the{" "}
              <strong className="text-zinc-950 dark:text-zinc-50">More</strong> button (usually next to "Add profile section" or "Open to").
            </li>
            <li>
              Select <strong className="text-zinc-950 dark:text-zinc-50">Save to PDF</strong> from the dropdown menu.
            </li>
          </ol>
          <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
            Note: LinkedIn limits exports to 10 pages. We process this text client-side directly in your browser. Nothing is stored on our servers.
          </p>
        </div>
      )}
    </div>
  );
}
