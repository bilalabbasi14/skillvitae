"use client";

import { useState } from "react";

export default function LinkedInGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full rounded-xl glass overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 font-medium text-zinc-100 hover:bg-zinc-800/20 transition-colors duration-200"
      >
        <span className="flex items-center gap-2.5 text-sm">
          <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <svg
              className="h-4 w-4 text-blue-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
          </div>
          How to get your LinkedIn PDF export?
        </span>
        <svg
          className={`h-4 w-4 text-zinc-500 transition-transform duration-300 ${
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

      {/* Animated accordion content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-800/50">
          <ol className="list-none space-y-3 pt-3">
            {[
              {
                step: "1",
                text: (
                  <>
                    Go to your{" "}
                    <strong className="text-zinc-50">LinkedIn Profile</strong> (click
                    your photo at the top → View Profile).
                  </>
                ),
              },
              {
                step: "2",
                text: (
                  <>
                    Look at your profile introduction section, click the{" "}
                    <strong className="text-zinc-50">More</strong> button (usually
                    next to &ldquo;Add profile section&rdquo; or &ldquo;Open to&rdquo;).
                  </>
                ),
              },
              {
                step: "3",
                text: (
                  <>
                    Select{" "}
                    <strong className="text-zinc-50">Save to PDF</strong> from the
                    dropdown menu.
                  </>
                ),
              },
            ].map((item, idx) => (
              <li
                key={item.step}
                className="flex items-start gap-3 text-xs leading-relaxed text-zinc-400"
                style={{
                  animation: isOpen
                    ? `slide-up-sm 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.1}s forwards`
                    : "none",
                  opacity: isOpen ? undefined : 0,
                }}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400 mt-0.5">
                  {item.step}
                </span>
                <span>{item.text}</span>
              </li>
            ))}
          </ol>
          <p className="text-[10px] text-zinc-500 mt-2 pl-9">
            Note: LinkedIn limits exports to 10 pages. We process this text
            client-side directly in your browser. Nothing is stored on our
            servers.
          </p>
        </div>
      </div>
    </div>
  );
}
