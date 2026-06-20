"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnimatedLogo from "../../components/ui/AnimatedLogo";
import LoadingScreen from "../../components/ui/LoadingScreen";
import CVEditor from "../../components/editor/CVEditor";
import CVPreview, { CVPreviewRef } from "../../components/editor/CVPreview";
import TemplateSelector from "../../components/editor/TemplateSelector";
import TailoringPanel from "../../components/tailor/TailoringPanel";
import VersionSidebar, { TailoredVersion } from "../../components/tailor/VersionSidebar";
import { CVData, flattenToResumeMode, flattenToCVMode } from "../../lib/cv-utils";
import { getItem, setItem } from "../../lib/storage";
import { computeATSScore, extractKeywords, flattenCVToText } from "../../lib/ats";

export default function TailorPage() {
  const router = useRouter();
  const previewRef = useRef<CVPreviewRef>(null);

  const [baseCV, setBaseCV] = useState<CVData | null>(null);
  const [activeCV, setActiveCV] = useState<CVData | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [versions, setVersions] = useState<TailoredVersion[]>([]);

  const [jobUrl, setJobUrl] = useState("");
  const [fallbackJdText, setFallbackJdText] = useState("");
  const [usingPastedNotice, setUsingPastedNotice] = useState(false);

  const [tailorResults, setTailorResults] = useState<{
    matched: string[];
    missing: string[];
    rewrites: { original: string; rewritten: string }[];
    aiScore: number;
    roleType: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [rightView, setRightView] = useState<"preview" | "insights">("insights");
  const [compareData, setCompareData] = useState<{ v1: TailoredVersion; v2: TailoredVersion } | null>(null);

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
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [margins, setMargins] = useState<"compact" | "normal" | "wide">("normal");
  const [density, setDensity] = useState<"compact" | "normal" | "loose">("normal");

  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const storedBase = getItem<CVData>("sv_cv_base");
    if (!storedBase) {
      router.push("/onboard");
      return;
    }
    setBaseCV(storedBase);
    setActiveCV(JSON.parse(JSON.stringify(storedBase)));

    const storedVersions = getItem<TailoredVersion[]>("sv_cv_tailored") || [];
    setVersions(storedVersions);

    const storedSettings = getItem<{
      template?: "ats-safe" | "classic" | "minimal";
      mode?: "resume" | "cv";
      sectionOrder?: string[];
      fontSize?: "sm" | "md" | "lg";
      margins?: "compact" | "normal" | "wide";
      density?: "compact" | "normal" | "loose";
    }>("sv_settings");

    if (storedSettings) {
      if (storedSettings.template) setTemplate(storedSettings.template);
      if (storedSettings.mode) setMode(storedSettings.mode);
      if (storedSettings.sectionOrder) setSectionOrder(storedSettings.sectionOrder);
      if (storedSettings.fontSize) setFontSize(storedSettings.fontSize);
      if (storedSettings.margins) setMargins(storedSettings.margins);
      if (storedSettings.density) setDensity(storedSettings.density);
    }
    setPageLoading(false);
  }, [router]);

  useEffect(() => {
    if (!baseCV) return;
    setItem("sv_settings", {
      template,
      mode,
      sectionOrder,
      fontSize,
      margins,
      density,
    });
  }, [template, mode, sectionOrder, fontSize, margins, density, baseCV]);

  const handleTailorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseCV) return;

    setIsLoading(true);
    setErrorMsg("");
    setUsingPastedNotice(false);
    setProgressMsg("Scraping job description text...");

    let jdContent = fallbackJdText.trim();

    try {
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

      setActiveCV(results.tailored_cv);

      setTailorResults({
        matched: results.ats_keywords.matched || [],
        missing: results.ats_keywords.missing || [],
        rewrites: results.ats_keywords.suggested_rewrites || [],
        aiScore: results.match_score_ai || 0,
        roleType: results.role_type || "industry",
      });

      if (results.role_type === "academic") {
        setMode("cv");
      } else {
        setMode("resume");
      }

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

    if (activeVersionId) {
      const updatedVersions = versions.map(v =>
        v.id === activeVersionId ? { ...v, cvData: updated } : v
      );
      setVersions(updatedVersions);
      setItem("sv_cv_tailored", updatedVersions);
    }
  };

  const handleApplyRewrite = (original: string, rewritten: string) => {
    if (!activeCV) return;

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

  const handleSaveVersion = () => {
    if (!activeCV || !tailorResults) return;

    const compName = activeCV.experience?.[0]?.company || activeCV.personal?.name || "Company";

    const versionLabel = prompt(
      "Enter a label for this tailored CV version:",
      `${compName} - ${activeCV.personal?.summary ? "Tailored" : "Job Alignment"}`
    );

    if (versionLabel === null) return;

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
      setActiveCV(baseCV ? JSON.parse(JSON.stringify(baseCV)) : null);
      setTailorResults(null);
    } else {
      const target = versions.find(v => v.id === id);
      if (target) {
        setActiveCV(target.cvData);

        const cvTextLower = flattenCVToText(target.cvData).toLowerCase();
        const jdKeywords = extractKeywords(target.jdText || fallbackJdText);
        const matched = jdKeywords.filter(k => cvTextLower.includes(k));
        const missing = jdKeywords.filter(k => !cvTextLower.includes(k));

        setTailorResults({
          matched,
          missing,
          rewrites: [],
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

  const activeCVData = activeCV ? (mode === "resume" ? flattenToResumeMode(activeCV) : flattenToCVMode(activeCV)) : null;
  const baseCVData = baseCV ? (mode === "resume" ? flattenToResumeMode(baseCV) : flattenToCVMode(baseCV)) : null;

  const originalATS = baseCVData && fallbackJdText ? computeATSScore(baseCVData, fallbackJdText) : 0;
  const tailoredATS = activeCVData && fallbackJdText ? computeATSScore(activeCVData, fallbackJdText) : 0;

  if (pageLoading) {
    return (
      <LoadingScreen
        variant="particles"
        message="Loading tailoring workspace..."
        subtext="Preparing your CV data and saved versions."
      />
    );
  }

  if (isLoading) {
    return (
      <LoadingScreen
        variant="dna"
        message={progressMsg}
        subtext="AI is analyzing the job description and optimizing your CV."
        tips={[
          "🎯 We match your experience bullets against the job's required qualifications.",
          "📝 AI rewrites suggest stronger action verbs and quantified achievements.",
          "🔍 Keyword gaps are identified so you know exactly what to add.",
          "⚡ Your original CV is preserved — tailored versions are saved separately.",
        ]}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header bar */}
      <header className="w-full glass-light sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between gap-4 animate-slide-down">
        <div className="flex items-center gap-4">
          <Link href="/editor" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors duration-300 group">
            <svg className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs font-medium">Editor</span>
          </Link>
          <span className="hidden sm:inline h-4 w-[1px] bg-zinc-800" />
          <div className="hidden sm:flex items-center gap-2">
            <AnimatedLogo size="sm" />
            <h1 className="text-sm font-bold bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
              Job Tailoring Workspace
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeCV && tailorResults && (
            <button
              onClick={handleSaveVersion}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/10 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20"
            >
              Save Tailored Version
            </button>
          )}

          {activeCV && (
            <button
              onClick={() => previewRef.current?.downloadPDF()}
              className="px-4 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-semibold cursor-pointer transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-800"
            >
              Download PDF
            </button>
          )}
        </div>
      </header>

      {/* Main split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden animate-fade-in">
        {/* Left Column */}
        <div className="w-full lg:w-[45%] flex flex-col border-r border-zinc-900/50 overflow-y-auto p-6 space-y-6">
          <VersionSidebar
            versions={versions}
            activeVersionId={activeVersionId}
            onSelectVersion={handleSelectVersion}
            onDeleteVersion={handleDeleteVersion}
            onCompareVersions={triggerCompare}
          />

          {/* Job description form */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-[10px] font-bold border border-indigo-500/20">1</div>
              Input Target Job
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
                  className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl px-3 py-2.5 text-xs text-zinc-300 placeholder-zinc-700 transition-all duration-300"
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
                  className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl p-3 text-xs text-zinc-300 placeholder-zinc-700 resize-none transition-all duration-300"
                />
              </div>

              {usingPastedNotice && (
                <p className="text-[10px] text-amber-500 font-medium animate-fade-in">
                  ⚠ URL scraping was blocked. Fell back to your pasted Job Description text.
                </p>
              )}

              {errorMsg && (
                <p className="text-[11px] text-red-500 font-semibold animate-slide-up-sm">
                  Error: {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white text-xs shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50 overflow-hidden group"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                  background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s linear infinite",
                }} />
                <span className="relative z-10">Tailor My CV</span>
              </button>
            </form>
          </div>

          {activeCV && (
            <TemplateSelector
              mode={mode}
              template={template}
              onChangeMode={setMode}
              onChangeTemplate={setTemplate}
              fontSize={fontSize}
              onChangeFontSize={setFontSize}
              margins={margins}
              onChangeMargins={setMargins}
              density={density}
              onChangeDensity={setDensity}
            />
          )}

          {activeCV && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1 flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-purple-500/10 flex items-center justify-center text-purple-400 text-[10px] font-bold border border-purple-500/20">2</div>
                Customize Tailored Content
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

        {/* Right Column */}
        <div className="w-full lg:w-[55%] flex flex-col bg-zinc-950 p-6 overflow-y-auto space-y-4">
          {activeCV && tailorResults ? (
            <>
              {/* Tab toggler */}
              <div className="flex bg-zinc-900/30 p-1 rounded-xl w-64 mx-auto shrink-0">
                <button
                  onClick={() => setRightView("insights")}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-300 ${
                    rightView === "insights" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Insights & Gap
                </button>
                <button
                  onClick={() => setRightView("preview")}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-300 ${
                    rightView === "preview" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-zinc-500 hover:text-zinc-300"
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
                  cv={activeCVData!}
                  mode={mode}
                  template={template}
                  sectionOrder={sectionOrder}
                  fontSize={fontSize}
                  margins={margins}
                  density={density}
                />
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-zinc-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-indigo-500/5 blur-2xl animate-pulse-glow" />
                <svg className="h-16 w-16 text-zinc-700 relative animate-float" style={{ animationDuration: "4s" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-zinc-300 mb-1">Tailor Panel Ready</h3>
              <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                Provide a Job Description URL or text on the left and click &ldquo;Tailor My CV&rdquo; to see ATS gap analysis, matched keywords, and optimized previews.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Modal */}
      {compareData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
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
                className="h-8 w-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-all duration-300"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-left">
              {/* Summary Compare */}
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">Summary Statement Comparison</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800">
                    <div className="font-bold text-zinc-400 mb-1">{compareData.v1.jobTitle}</div>
                    <p className="text-zinc-300 italic">&ldquo;{compareData.v1.cvData.personal?.summary}&rdquo;</p>
                  </div>
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800">
                    <div className="font-bold text-zinc-400 mb-1">{compareData.v2.jobTitle}</div>
                    <p className="text-zinc-300 italic">&ldquo;{compareData.v2.cvData.personal?.summary}&rdquo;</p>
                  </div>
                </div>
              </div>

              {/* Skills Compare */}
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">Skills Differences</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800">
                    <div className="font-bold text-zinc-400 mb-2">{compareData.v1.jobTitle} ({compareData.v1.cvData.skills?.length} tags)</div>
                    <div className="flex flex-wrap gap-1">
                      {compareData.v1.cvData.skills?.map((s: any) => (
                        <span key={s.name} className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px]">
                          {s.name} ({s.level})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800">
                    <div className="font-bold text-zinc-400 mb-2">{compareData.v2.jobTitle} ({compareData.v2.cvData.skills?.length} tags)</div>
                    <div className="flex flex-wrap gap-1">
                      {compareData.v2.cvData.skills?.map((s: any) => (
                        <span key={s.name} className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px]">
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
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800 space-y-4">
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
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800 space-y-4">
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
                className="px-5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold cursor-pointer transition-all duration-300"
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
