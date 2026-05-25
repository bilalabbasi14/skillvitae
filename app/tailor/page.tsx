"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CVEditor from "../../components/editor/CVEditor";
import CVPreview, { CVPreviewRef } from "../../components/editor/CVPreview";
import TailoringPanel from "../../components/tailor/TailoringPanel";
import VersionSidebar, { TailoredVersion } from "../../components/tailor/VersionSidebar";
import { CVData } from "../../lib/cv-utils";
import { getItem, setItem } from "../../lib/storage";
import { computeATSScore, extractKeywords, flattenCVToText } from "../../lib/ats";

export default function TailorPage() {
  const router = useRouter();
  const previewRef = useRef<CVPreviewRef>(null);

  // States
  const [baseCV, setBaseCV] = useState<CVData | null>(null);
  const [activeCV, setActiveCV] = useState<CVData | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [versions, setVersions] = useState<TailoredVersion[]>([]);
  
  // Scraper inputs
  const [jobUrl, setJobUrl] = useState("");
  const [fallbackJdText, setFallbackJdText] = useState("");
  const [usingPastedNotice, setUsingPastedNotice] = useState(false);

  // Tailor API results cached
  const [tailorResults, setTailorResults] = useState<{
    matched: string[];
    missing: string[];
    rewrites: { original: string; rewritten: string }[];
    aiScore: number;
    roleType: string;
  } | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Right Column View Mode: "preview" or "insights"
  const [rightView, setRightView] = useState<"preview" | "insights">("insights");

  // Comparison Modal state
  const [compareData, setCompareData] = useState<{ v1: TailoredVersion; v2: TailoredVersion } | null>(null);

  // Editor configuration
  const [template, setTemplate] = useState<"ats-safe" | "classic" | "minimal">("ats-safe");
  const [mode, setMode] = useState<"resume" | "cv">("resume");
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    "experience",
    "projects",
    "education",
    "skills",
    "certifications",
    "languages",
  ]);

  useEffect(() => {
    const storedBase = getItem<CVData>("sv_cv_base");
    if (!storedBase) {
      router.push("/onboard");
      return;
    }
    setBaseCV(storedBase);
    setActiveCV(JSON.parse(JSON.stringify(storedBase))); // clone

    const storedVersions = getItem<TailoredVersion[]>("sv_cv_tailored") || [];
    setVersions(storedVersions);

    const storedSettings = getItem<{
      template?: "ats-safe" | "classic" | "minimal";
      mode?: "resume" | "cv";
      sectionOrder?: string[];
    }>("sv_settings");

    if (storedSettings) {
      if (storedSettings.template) setTemplate(storedSettings.template);
      if (storedSettings.mode) setMode(storedSettings.mode);
      if (storedSettings.sectionOrder) setSectionOrder(storedSettings.sectionOrder);
    }
  }, [router]);

  const handleTailorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseCV) return;

    setIsLoading(true);
    setErrorMsg("");
    setUsingPastedNotice(false);
    setProgressMsg("Scraping job description text...");

    let jdContent = fallbackJdText.trim();

    try {
      // 1. Scrape Job Description URL if provided
      if (jobUrl.trim()) {
        const scrapeRes = await fetch("/api/fetch-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: jobUrl.trim() }),
        });

        if (scrapeRes.ok) {
          const data = await scrapeRes.json();
          if (data.success && data.text) {
            jdContent = data.text;
          } else {
            console.warn("URL scrape failed:", data.error);
            if (!jdContent) {
              throw new Error(`Failed to read job URL. ${data.error || "No fallback description text provided."}`);
            }
            setUsingPastedNotice(true);
          }
        } else {
          console.warn("URL fetch responded with HTTP error");
          if (!jdContent) {
            throw new Error("HTTP error reading URL, and no fallback description text was provided.");
          }
          setUsingPastedNotice(true);
        }
      }

      if (!jdContent) {
        throw new Error("Please paste the job description text or input a valid job URL.");
      }

      // 2. Call tailoring API
      setProgressMsg("Aligning CV experience, sorting keywords, and rewriting highlights...");
      const tailorRes = await fetch("/api/tailor-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseCV,
          jobDescriptionText: jdContent,
        }),
      });

      if (!tailorRes.ok) {
        const errData = await tailorRes.json();
        throw new Error(`Tailoring API failed: ${errData.error || tailorRes.statusText}`);
      }

      const results = await tailorRes.json();

      // Update states
      setActiveCV(results.tailored_cv);
      
      // Cache the tailoring metrics for gap analysis
      setTailorResults({
        matched: results.ats_keywords.matched || [],
        missing: results.ats_keywords.missing || [],
        rewrites: results.ats_keywords.suggested_rewrites || [],
        aiScore: results.match_score_ai || 0,
        roleType: results.role_type || "industry",
      });

      // Default mode toggle based on AI detected role type
      if (results.role_type === "academic") {
        setMode("cv");
      } else {
        setMode("resume");
      }

      // Auto-switch right side view to tailoring insights so they see metrics
      setRightView("insights");

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCVChange = (updated: CVData) => {
    setActiveCV(updated);
    
    // If editing a saved tailored version, update in list
    if (activeVersionId) {
      const updatedVersions = versions.map(v =>
        v.id === activeVersionId ? { ...v, cvData: updated } : v
      );
      setVersions(updatedVersions);
      setItem("sv_cv_tailored", updatedVersions);
    }
  };

  // Interactive rewrite apply action
  const handleApplyRewrite = (original: string, rewritten: string) => {
    if (!activeCV) return;

    // Search experience bullets
    let updated = false;
    const updatedExp = activeCV.experience.map(exp => {
      const bullets = exp.bullets.map(b => {
        if (b.trim().toLowerCase() === original.trim().toLowerCase() || b.includes(original)) {
          updated = true;
          return rewritten;
        }
        return b;
      });
      return { ...exp, bullets };
    });

    // Search projects highlights
    const updatedProjs = activeCV.projects.map(proj => {
      const highlights = proj.highlights.map(hl => {
        if (hl.trim().toLowerCase() === original.trim().toLowerCase() || hl.includes(original)) {
          updated = true;
          return rewritten;
        }
        return hl;
      });
      return { ...proj, highlights };
    });

    if (updated) {
      handleCVChange({
        ...activeCV,
        experience: updatedExp,
        projects: updatedProjs,
      });
      alert("Bullet successfully rewritten in active draft!");
    } else {
      alert("Could not locate the original bullet in CV text. You may have already modified it.");
    }
  };

  // Save active tailored CV as a version
  const handleSaveVersion = () => {
    if (!activeCV || !tailorResults) return;

    const title = activeCV.personal?.summary?.slice(0, 30) || "Tailored Version";
    const compName = activeCV.experience?.[0]?.company || activeCV.personal?.name || "Company";
    
    const versionLabel = prompt(
      "Enter a label for this tailored CV version:",
      `${compName} - ${activeCV.personal?.summary ? "Tailored" : "Job Alignment"}`
    );

    if (versionLabel === null) return; // cancel

    const score = computeATSScore(activeCV, fallbackJdText || jobUrl);

    const newVersion: TailoredVersion = {
      id: "v_" + Date.now(),
      jobTitle: versionLabel,
      companyName: compName,
      dateCreated: Date.now(),
      atsScore: score,
      cvData: JSON.parse(JSON.stringify(activeCV)),
      jdText: fallbackJdText,
    };

    const updated = [newVersion, ...versions];
    setVersions(updated);
    setItem("sv_cv_tailored", updated);
    setActiveVersionId(newVersion.id);
  };

  const handleSelectVersion = (id: string | null) => {
    setActiveVersionId(id);
    if (id === null) {
      // base CV
      setActiveCV(baseCV ? JSON.parse(JSON.stringify(baseCV)) : null);
      setTailorResults(null);
    } else {
      const target = versions.find(v => v.id === id);
      if (target) {
        setActiveCV(target.cvData);
        
        // Re-evaluate keywords/highlights metrics for this version
        const cvTextLower = flattenCVToText(target.cvData).toLowerCase();
        const jdKeywords = extractKeywords(target.jdText || fallbackJdText);
        const matched = jdKeywords.filter(k => cvTextLower.includes(k));
        const missing = jdKeywords.filter(k => !cvTextLower.includes(k));

        setTailorResults({
          matched,
          missing,
          rewrites: [], // Clear suggestions since it's already generated
          aiScore: target.atsScore,
          roleType: "industry",
        });
      }
    }
  };

  const handleDeleteVersion = (id: string) => {
    if (!confirm("Are you sure you want to delete this version?")) return;
    const updated = versions.filter(v => v.id !== id);
    setVersions(updated);
    setItem("sv_cv_tailored", updated);
    if (activeVersionId === id) {
      handleSelectVersion(null);
    }
  };

  const triggerCompare = (v1: TailoredVersion, v2: TailoredVersion) => {
    setCompareData({ v1, v2 });
  };

  // ATS Score calculations for panel
  const originalATS = baseCV && fallbackJdText ? computeATSScore(baseCV, fallbackJdText) : 0;
  const tailoredATS = activeCV && fallbackJdText ? computeATSScore(activeCV, fallbackJdText) : 0;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header bar */}
      <header className="w-full bg-zinc-900/60 border-b border-zinc-900 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/editor" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Editor
          </Link>
          <span className="hidden sm:inline h-4 w-[1px] bg-zinc-800" />
          <h1 className="text-sm font-bold bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Job Tailoring Workspace
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {activeCV && tailorResults && (
            <button
              onClick={handleSaveVersion}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Save Tailored Version
            </button>
          )}

          {activeCV && (
            <button
              onClick={() => previewRef.current?.downloadPDF()}
              className="px-4 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-semibold cursor-pointer"
            >
              Download PDF
            </button>
          )}
        </div>
      </header>

      {/* Main split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Scraping Form & Editor */}
        <div className="w-full lg:w-[45%] flex flex-col border-r border-zinc-900 overflow-y-auto p-6 space-y-6">
          {/* Version sidebar inline at the top */}
          <VersionSidebar
            versions={versions}
            activeVersionId={activeVersionId}
            onSelectVersion={handleSelectVersion}
            onDeleteVersion={handleDeleteVersion}
            onCompareVersions={triggerCompare}
          />

          {/* Job description crawling form */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
              1. Input Target Job
            </h3>
            
            <form onSubmit={handleTailorSubmit} className="space-y-4">
              <div>
                <label htmlFor="job-url" className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Job Posting URL (Scrapes description automatically)
                </label>
                <input
                  id="job-url"
                  type="url"
                  placeholder="https://www.indeed.com/jobs/view..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-zinc-300 placeholder-zinc-700"
                />
              </div>

              <div>
                <label htmlFor="pasted-jd" className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Job Description Text (Fallback / Direct Paste)
                </label>
                <textarea
                  id="pasted-jd"
                  rows={4}
                  placeholder="Paste details, role description, and requirements..."
                  value={fallbackJdText}
                  onChange={(e) => setFallbackJdText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-indigo-500 rounded-xl p-3 text-xs text-zinc-300 placeholder-zinc-700 resize-none"
                />
              </div>

              {usingPastedNotice && (
                <p className="text-[10px] text-amber-500 font-medium">
                  ⚠ URL scraping was blocked. Fell back to your pasted Job Description text.
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white text-xs shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? progressMsg : "Tailor My CV"}
              </button>
            </form>
          </div>

          {/* CV Editor panel loaded with active tailored CV */}
          {activeCV && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">
                2. Customize Tailored Content
              </h3>
              <CVEditor
                cv={activeCV}
                onChange={handleCVChange}
                sectionOrder={sectionOrder}
                onChangeSectionOrder={setSectionOrder}
              />
            </div>
          )}
        </div>

        {/* Right Column: Insights & Live Preview */}
        <div className="w-full lg:w-[55%] flex flex-col bg-zinc-950 p-6 overflow-y-auto space-y-4">
          {activeCV && tailorResults ? (
            <>
              {/* Tab toggler */}
              <div className="flex border-b border-zinc-900 bg-zinc-900/30 p-1 rounded-xl w-64 mx-auto shrink-0">
                <button
                  onClick={() => setRightView("insights")}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                    rightView === "insights" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Insights & Gap
                </button>
                <button
                  onClick={() => setRightView("preview")}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                    rightView === "preview" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Live Preview
                </button>
              </div>

              {rightView === "insights" ? (
                <TailoringPanel
                  originalScore={originalATS}
                  tailoredScore={tailoredATS}
                  aiScore={tailorResults.aiScore}
                  roleType={tailorResults.roleType}
                  matchedKeywords={tailorResults.matched}
                  missingKeywords={tailorResults.missing}
                  suggestedRewrites={tailorResults.rewrites}
                  onApplyRewrite={handleApplyRewrite}
                />
              ) : (
                <CVPreview
                  ref={previewRef}
                  cv={activeCV}
                  mode={mode}
                  template={template}
                  sectionOrder={sectionOrder}
                />
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-zinc-500">
              <svg className="h-16 w-16 text-zinc-800 mb-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-sm font-bold text-zinc-300 mb-1">Tailor Panel Ready</h3>
              <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                Provide a Job Description URL or text on the left and click "Tailor My CV" to see ATS gap analysis, matched keywords, and optimized previews.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Modal Dialog */}
      {compareData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/60">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-100">Compare CV Versions</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Comparing: <span className="text-indigo-400">{compareData.v1.jobTitle}</span> vs <span className="text-purple-400">{compareData.v2.jobTitle}</span>
                </p>
              </div>
              <button
                onClick={() => setCompareData(null)}
                className="text-zinc-500 hover:text-zinc-300 font-bold text-lg"
              >
                ×
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-left">
              {/* Summary Compare */}
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">Summary Statement Comparison</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-850">
                    <div className="font-bold text-zinc-400 mb-1">{compareData.v1.jobTitle}</div>
                    <p className="text-zinc-300 italic">"{compareData.v1.cvData.personal?.summary}"</p>
                  </div>
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-850">
                    <div className="font-bold text-zinc-400 mb-1">{compareData.v2.jobTitle}</div>
                    <p className="text-zinc-300 italic">"{compareData.v2.cvData.personal?.summary}"</p>
                  </div>
                </div>
              </div>

              {/* Skills Compare */}
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">Skills Differences</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-850">
                    <div className="font-bold text-zinc-400 mb-2">{compareData.v1.jobTitle} ({compareData.v1.cvData.skills?.length} tags)</div>
                    <div className="flex flex-wrap gap-1">
                      {compareData.v1.cvData.skills?.map((s: any) => (
                        <span key={s.name} className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                          {s.name} ({s.level})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-850">
                    <div className="font-bold text-zinc-400 mb-2">{compareData.v2.jobTitle} ({compareData.v2.cvData.skills?.length} tags)</div>
                    <div className="flex flex-wrap gap-1">
                      {compareData.v2.cvData.skills?.map((s: any) => (
                        <span key={s.name} className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                          {s.name} ({s.level})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience Bullets Compare */}
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">Experience Bullets Comparison</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-850 space-y-4">
                    <div className="font-bold text-zinc-400">{compareData.v1.jobTitle}</div>
                    {compareData.v1.cvData.experience?.map((exp: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="font-bold text-zinc-300">{exp.company}</div>
                        <ul className="list-disc pl-4 space-y-0.5 text-zinc-500">
                          {exp.bullets?.map((b: string, bIdx: number) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-850 space-y-4">
                    <div className="font-bold text-zinc-400">{compareData.v2.jobTitle}</div>
                    {compareData.v2.cvData.experience?.map((exp: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="font-bold text-zinc-300">{exp.company}</div>
                        <ul className="list-disc pl-4 space-y-0.5 text-zinc-500">
                          {exp.bullets?.map((b: string, bIdx: number) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex justify-end">
              <button
                onClick={() => setCompareData(null)}
                className="px-5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
