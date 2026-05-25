"use client";

import { CVData } from "../../lib/cv-utils";

interface RewriteSuggestion {
  original: string;
  rewritten: string;
}

interface TailoringPanelProps {
  originalScore: number;
  tailoredScore: number;
  aiScore: number;
  roleType: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestedRewrites: RewriteSuggestion[];
  onApplyRewrite: (original: string, rewritten: string) => void;
}

export default function TailoringPanel({
  originalScore,
  tailoredScore,
  aiScore,
  roleType,
  matchedKeywords,
  missingKeywords,
  suggestedRewrites,
  onApplyRewrite,
}: TailoringPanelProps) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 backdrop-blur-xl shadow-lg space-y-6 text-left">
      {/* 1. Score comparisons */}
      <div>
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
          Score Optimization Comparison
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/40 text-center">
            <div className="text-zinc-500 text-[10px] uppercase font-bold">Before</div>
            <div className="text-2xl font-black text-red-400 mt-1">{originalScore}</div>
            <div className="text-[9px] text-zinc-500">Original ATS</div>
          </div>
          <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-center">
            <div className="text-indigo-400 text-[10px] uppercase font-bold">After</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">+{tailoredScore - originalScore > 0 ? "" : ""}{tailoredScore}</div>
            <div className="text-[9px] text-emerald-500">Optimized ATS</div>
          </div>
          <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/40 text-center">
            <div className="text-zinc-500 text-[10px] uppercase font-bold">AI Match</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">{aiScore}%</div>
            <div className="text-[9px] text-zinc-500">{roleType} role</div>
          </div>
        </div>
      </div>

      {/* 2. Keywords comparison */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <div>
          <h4 className="text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Matched Keywords ({matchedKeywords.length})
          </h4>
          {matchedKeywords.length === 0 ? (
            <p className="text-[10px] text-zinc-500">No matched keywords found yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {matchedKeywords.map(k => (
                <span key={k} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono">
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Missing Keywords ({missingKeywords.length})
          </h4>
          {missingKeywords.length === 0 ? (
            <p className="text-[10px] text-emerald-400">All key terms satisfied! Perfect alignment.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {missingKeywords.map(k => (
                <span key={k} className="bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-mono">
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Bullet Point suggestions */}
      {suggestedRewrites && suggestedRewrites.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
            Suggested Bullet Rewrites
          </h4>
          <p className="text-[10px] text-zinc-500 leading-normal">
            These rewrites incorporate missing keywords naturally. Click "Apply" to instantly swap them.
          </p>

          <div className="space-y-3">
            {suggestedRewrites.map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/40 text-xs space-y-2 relative group">
                <div>
                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Original:</span>
                  <p className="text-zinc-500 italic mt-0.5">"{s.original}"</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Suggested:</span>
                  <p className="text-zinc-300 mt-0.5 font-medium">"{s.rewritten}"</p>
                </div>
                <button
                  onClick={() => onApplyRewrite(s.original, s.rewritten)}
                  className="w-full mt-1.5 py-1 px-3 bg-zinc-900 border border-zinc-800 hover:border-indigo-500 hover:text-indigo-400 text-zinc-400 font-semibold text-[10px] rounded-lg transition-colors cursor-pointer"
                >
                  Apply Rewrite to CV
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
