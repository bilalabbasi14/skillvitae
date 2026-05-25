"use client";

import { useState } from "react";
import { CVData } from "../../lib/cv-utils";
import {
  computeATSScore,
  extractKeywords,
  flattenCVToText,
  checkDateConsistency,
  extractAllBullets,
} from "../../lib/ats";

interface ATSScorePanelProps {
  cv: CVData;
  initialJdText?: string;
  onJdUpdate?: (text: string) => void;
}

export default function ATSScorePanel({ cv, initialJdText = "", onJdUpdate }: ATSScorePanelProps) {
  const [jdText, setJdText] = useState(initialJdText);
  const [showJdInput, setShowJdInput] = useState(!initialJdText);

  const handleJdChange = (text: string) => {
    setJdText(text);
    if (onJdUpdate) {
      onJdUpdate(text);
    }
  };

  const hasJd = jdText.trim().length > 0;
  
  // Computations
  const score = hasJd ? computeATSScore(cv, jdText) : 0;
  const jdKeywords = hasJd ? extractKeywords(jdText) : [];
  const cvTextLower = flattenCVToText(cv).toLowerCase();
  
  const matchedKeywords = jdKeywords.filter(k => cvTextLower.includes(k));
  const missingKeywords = jdKeywords.filter(k => !cvTextLower.includes(k));

  const hasWork = cvTextLower.includes("experience") || cvTextLower.includes("employment") || cvTextLower.includes("history");
  const hasEdu = cvTextLower.includes("education") || cvTextLower.includes("academic");
  const hasSkills = cvTextLower.includes("skills") || cvTextLower.includes("technologies") || cvTextLower.includes("expertise");

  const datesConsistent = checkDateConsistency(cv);
  
  const bullets = extractAllBullets(cv);
  const measuredBullets = bullets.filter(b => /\d/.test(b));

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <h2 className="text-sm font-bold tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Real-time ATS Evaluator
        </h2>
        
        {hasJd && (
          <button
            onClick={() => setShowJdInput(!showJdInput)}
            className="text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-2"
          >
            {showJdInput ? "Hide JD Text" : "Edit JD Text"}
          </button>
        )}
      </div>

      {/* JD Paste input panel */}
      {showJdInput && (
        <div className="mb-4">
          <label htmlFor="jd-textarea" className="block text-[11px] font-medium text-zinc-400 mb-1">
            Paste Job Description (JD) text here:
          </label>
          <textarea
            id="jd-textarea"
            rows={4}
            value={jdText}
            onChange={(e) => handleJdChange(e.target.value)}
            placeholder="Paste raw JD text to calculate keywords match and score..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none transition-colors resize-none"
          />
        </div>
      )}

      {!hasJd ? (
        <div className="text-center py-6 text-zinc-500 text-xs">
          <svg className="h-8 w-8 mx-auto mb-2 text-zinc-700 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Paste a Job Description above to evaluate your ATS compatibility score.
        </div>
      ) : (
        <div className="space-y-5">
          {/* Score Circle & Metrics */}
          <div className="flex items-center gap-6">
            {/* Circular Progress Ring */}
            <div className="relative shrink-0 h-20 w-20 flex items-center justify-center">
              <svg className="absolute transform -rotate-90 w-full h-full">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  strokeWidth="6"
                  stroke="#18181b"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  strokeWidth="6"
                  stroke={score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"}
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - score / 100)}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="text-center">
                <span className="text-xl font-extrabold text-zinc-100">{score}</span>
                <span className="text-[10px] text-zinc-500 block -mt-1">/100</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-200">ATS Match Rating</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {score >= 70
                  ? "Great compatibility! Your CV contains strong keyword alignments."
                  : score >= 50
                  ? "Moderate fit. Incorporate more missing keywords to reach 75+."
                  : "Needs work. Refine headers, add metrics, and incorporate keywords."}
              </p>
            </div>
          </div>

          {/* Checklist details */}
          <div className="space-y-3 pt-3 border-t border-zinc-800 text-xs">
            {/* Keywords Match */}
            <div className="flex justify-between items-start">
              <span className="font-semibold text-zinc-300">Keywords matched:</span>
              <span className={`font-bold ${missingKeywords.length === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                {matchedKeywords.length} of {jdKeywords.length}
              </span>
            </div>

            {missingKeywords.length > 0 && (
              <div className="pl-3 py-1 border-l-2 border-amber-500/20 text-[11px] text-zinc-400">
                <span className="text-amber-500 font-semibold block mb-1">Missing keywords:</span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {missingKeywords.slice(0, 12).map(keyword => (
                    <span key={keyword} className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                      {keyword}
                    </span>
                  ))}
                  {missingKeywords.length > 12 && (
                    <span className="text-zinc-600 self-center text-[10px] ml-1">+{missingKeywords.length - 12} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Required Sections */}
            <div className="space-y-1.5">
              <span className="font-semibold text-zinc-300 block">Required Sections:</span>
              <div className="grid grid-cols-3 gap-2">
                <div className={`p-2 rounded-lg border text-center ${hasWork ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-red-500/20 bg-red-500/5 text-red-400"}`}>
                  <div className="font-bold">Experience</div>
                  <div className="text-[10px]">{hasWork ? "✓ Present" : "✗ Missing"}</div>
                </div>
                <div className={`p-2 rounded-lg border text-center ${hasSkills ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-red-500/20 bg-red-500/5 text-red-400"}`}>
                  <div className="font-bold">Skills</div>
                  <div className="text-[10px]">{hasSkills ? "✓ Present" : "✗ Missing"}</div>
                </div>
                <div className={`p-2 rounded-lg border text-center ${hasEdu ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-red-500/20 bg-red-500/5 text-red-400"}`}>
                  <div className="font-bold">Education</div>
                  <div className="text-[10px]">{hasEdu ? "✓ Present" : "✗ Missing"}</div>
                </div>
              </div>
            </div>

            {/* Date Consistency */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-zinc-300">Date format consistency:</span>
              <span className={`font-bold flex items-center gap-1 ${datesConsistent ? "text-emerald-400" : "text-red-400"}`}>
                {datesConsistent ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Consistent
                  </>
                ) : (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                    Inconsistent
                  </>
                )}
              </span>
            </div>
            {!datesConsistent && (
              <p className="text-[10px] text-red-400/80 -mt-1 leading-normal pl-1">
                ✗ Fix dates to use identical notation styles (e.g. all "Jan 2023" or all "2023").
              </p>
            )}

            {/* Measurable Achievements */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-300">Measurable bullets:</span>
                <span className="font-bold text-zinc-400">
                  {measuredBullets.length} of {bullets.length}
                </span>
              </div>
              
              <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${bullets.length > 0 ? (measuredBullets.length / bullets.length) * 100 : 0}%` }}
                />
              </div>
              
              {bullets.length > 0 && measuredBullets.length < bullets.length * 0.4 && (
                <p className="text-[10px] text-amber-400/80 leading-normal">
                  ⚠ Try incorporating numeric results, counts, or impact percentages into more bullets.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
