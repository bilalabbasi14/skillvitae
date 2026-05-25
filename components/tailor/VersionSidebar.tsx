"use client";

import { useState } from "react";

export interface TailoredVersion {
  id: string;
  jobTitle: string;
  companyName: string;
  dateCreated: number;
  atsScore: number;
  cvData: any;
  jdText: string;
}

interface VersionSidebarProps {
  versions: TailoredVersion[];
  activeVersionId: string | null;
  onSelectVersion: (id: string | null) => void; // null means load base CV
  onDeleteVersion: (id: string) => void;
  onCompareVersions: (v1: TailoredVersion, v2: TailoredVersion) => void;
}

export default function VersionSidebar({
  versions,
  activeVersionId,
  onSelectVersion,
  onDeleteVersion,
  onCompareVersions,
}: VersionSidebarProps) {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      if (selectedForCompare.length >= 2) return; // limit to 2
      setSelectedForCompare([...selectedForCompare, id]);
    } else {
      setSelectedForCompare(selectedForCompare.filter(x => x !== id));
    }
  };

  const handleCompareClick = () => {
    if (selectedForCompare.length !== 2) return;
    const v1 = versions.find(v => v.id === selectedForCompare[0]);
    const v2 = versions.find(v => v.id === selectedForCompare[1]);
    if (v1 && v2) {
      onCompareVersions(v1, v2);
    }
  };

  const clearCompare = () => {
    setSelectedForCompare([]);
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 backdrop-blur-xl shadow-lg space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          CV Versions History
        </h3>
        {selectedForCompare.length === 2 && (
          <button
            onClick={handleCompareClick}
            className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2 py-0.5 rounded cursor-pointer transition-colors"
          >
            Compare (2)
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Base CV Link */}
        <button
          onClick={() => onSelectVersion(null)}
          className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-semibold flex items-center justify-between ${
            activeVersionId === null
              ? "border-indigo-500 bg-indigo-500/5 text-zinc-200"
              : "border-zinc-850 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-950/80 hover:text-zinc-300"
          }`}
        >
          <span>Base CV (Default Profile)</span>
          <span className="text-[10px] text-zinc-500 font-mono">Original</span>
        </button>

        {/* Tailored Versions */}
        {versions.length === 0 ? (
          <p className="text-[10px] text-zinc-600 text-center py-4">No tailored versions saved yet.</p>
        ) : (
          <div className="space-y-2">
            {versions.map(v => {
              const formattedDate = new Date(v.dateCreated).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              const isSelected = activeVersionId === v.id;
              const isChecked = selectedForCompare.includes(v.id);

              return (
                <div
                  key={v.id}
                  className={`group relative p-3 rounded-xl border transition-all flex items-start gap-2.5 text-xs ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/5 text-zinc-200"
                      : "border-zinc-850 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-950/80 hover:text-zinc-300"
                  }`}
                >
                  {/* Compare Checkbox */}
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={selectedForCompare.length >= 2 && !isChecked}
                    onChange={(e) => handleCheckboxChange(v.id, e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    title="Select to compare"
                  />

                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectVersion(v.id)}>
                    <h4 className="font-bold text-zinc-200 truncate pr-6">
                      {v.companyName || "Untitled Co"}
                    </h4>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">{v.jobTitle}</p>
                    
                    <div className="flex items-center justify-between text-[9px] text-zinc-600 mt-2 font-medium">
                      <span>Saved {formattedDate}</span>
                      <span className="bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded font-bold font-mono">
                        ATS {v.atsScore}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteVersion(v.id)}
                    className="absolute top-2 right-2 text-zinc-700 hover:text-red-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                    title="Delete version"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected count info */}
        {selectedForCompare.length > 0 && (
          <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1">
            <span>{selectedForCompare.length} of 2 selected for comparison</span>
            <button onClick={clearCompare} className="underline hover:text-zinc-300">
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
