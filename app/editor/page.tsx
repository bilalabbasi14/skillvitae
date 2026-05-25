"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CVEditor from "../../components/editor/CVEditor";
import CVPreview, { CVPreviewRef } from "../../components/editor/CVPreview";
import ATSScorePanel from "../../components/editor/ATSScorePanel";
import TemplateSelector from "../../components/editor/TemplateSelector";
import { CVData, flattenToResumeMode, flattenToCVMode } from "../../lib/cv-utils";
import { getItem, setItem } from "../../lib/storage";

export default function EditorPage() {
  const router = useRouter();
  const previewRef = useRef<CVPreviewRef>(null);

  // Core CV states
  const [baseCV, setBaseCV] = useState<CVData | null>(null);
  const [mode, setMode] = useState<"resume" | "cv">("resume");
  const [template, setTemplate] = useState<"ats-safe" | "classic" | "minimal">("ats-safe");
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    "experience",
    "projects",
    "education",
    "skills",
    "certifications",
    "languages",
  ]);

  // JD text for ATS panel
  const [jdText, setJdText] = useState("");

  // Mobile navigation tabs
  const [activeMobileTab, setActiveMobileTab] = useState<"edit" | "preview">("edit");

  // Load initial settings
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedCV = getItem<CVData>("sv_cv_base");
    if (!storedCV) {
      router.push("/onboard");
      return;
    }

    setBaseCV(storedCV);

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

    setIsLoading(false);
  }, [router]);

  // Debounced auto-save base CV to localStorage
  useEffect(() => {
    if (!baseCV) return;

    const delayDebounce = setTimeout(() => {
      setItem("sv_cv_base", baseCV);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [baseCV]);

  // Save settings when they change
  useEffect(() => {
    if (isLoading) return;
    setItem("sv_settings", {
      template,
      mode,
      sectionOrder,
    });
  }, [template, mode, sectionOrder, isLoading]);

  const handleCVChange = (updated: CVData) => {
    setBaseCV(updated);
  };

  const handleJdUpdate = (text: string) => {
    setJdText(text);
  };

  // Export all localStorage backup data as a JSON file
  const handleExportJSON = () => {
    if (!baseCV) return;
    
    const backupData = {
      sv_cv_base: baseCV,
      sv_settings: { template, mode, sectionOrder },
      sv_github_url: getItem("sv_github_url"),
      sv_github_username: getItem("sv_github_username"),
      sv_linkedin_url: getItem("sv_linkedin_url"),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SkillVitae_Backup_${baseCV.personal?.name?.replace(/\s+/g, "_") || "CV"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import backup data from a JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.sv_cv_base) {
            setBaseCV(parsed.sv_cv_base);
            setItem("sv_cv_base", parsed.sv_cv_base);
            
            if (parsed.sv_settings) {
              if (parsed.sv_settings.template) setTemplate(parsed.sv_settings.template);
              if (parsed.sv_settings.mode) setMode(parsed.sv_settings.mode);
              if (parsed.sv_settings.sectionOrder) setSectionOrder(parsed.sv_settings.sectionOrder);
              setItem("sv_settings", parsed.sv_settings);
            }
            if (parsed.sv_github_url) setItem("sv_github_url", parsed.sv_github_url);
            if (parsed.sv_github_username) setItem("sv_github_username", parsed.sv_github_username);
            if (parsed.sv_linkedin_url) setItem("sv_linkedin_url", parsed.sv_linkedin_url);

            alert("Profile successfully restored from backup!");
          } else {
            alert("Invalid backup file: missing base CV data.");
          }
        } catch {
          alert("Error parsing backup file. Make sure it is valid JSON.");
        }
      };
    }
  };

  const handleResetApp = () => {
    if (confirm("Are you sure you want to delete all saved data, CV drafts, and tailored versions? This cannot be undone.")) {
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }
      router.push("/");
    }
  };

  if (isLoading || !baseCV) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
        <div className="relative h-12 w-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-zinc-400 font-medium">Loading profile editor...</p>
      </div>
    );
  }

  // Pre-process visual data based on active mode
  const activeCVData = mode === "resume" ? flattenToResumeMode(baseCV) : flattenToCVMode(baseCV);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header bar */}
      <header className="w-full bg-zinc-900/60 border-b border-zinc-900 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
              SV
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
              SkillVitae
            </span>
          </Link>
          <span className="hidden sm:inline h-4 w-[1px] bg-zinc-800" />
          <span className="hidden sm:inline text-xs text-zinc-400 font-medium">
            Editing Profile: <strong className="text-zinc-200">{baseCV.personal?.name || "Untitled"}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export/Import Buttons */}
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 text-xs font-semibold cursor-pointer"
            title="Download JSON profile backup"
          >
            Backup Profile
          </button>
          
          <label className="px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 text-xs font-semibold cursor-pointer">
            Restore Backup
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handleResetApp}
            className="px-3.5 py-1.5 rounded-lg border border-red-950/20 bg-red-955/10 hover:bg-red-900/40 text-red-400 text-xs font-semibold cursor-pointer"
            title="Clear all local data and restart"
          >
            Reset
          </button>

          {/* Download PDF Trigger */}
          <button
            onClick={() => previewRef.current?.downloadPDF()}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>

          {/* Tailor navigation */}
          <Link
            href="/tailor"
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Tailor for Job
          </Link>
        </div>
      </header>

      {/* Mobile Tab bar toggle */}
      <div className="flex border-b border-zinc-900 bg-zinc-900/30 md:hidden sticky top-[65px] z-40">
        <button
          onClick={() => setActiveMobileTab("edit")}
          className={`flex-1 py-3 text-xs font-bold border-b-2 text-center transition-colors ${
            activeMobileTab === "edit" ? "border-indigo-500 text-zinc-200 bg-zinc-900/50" : "border-transparent text-zinc-500"
          }`}
        >
          Edit Details
        </button>
        <button
          onClick={() => setActiveMobileTab("preview")}
          className={`flex-1 py-3 text-xs font-bold border-b-2 text-center transition-colors ${
            activeMobileTab === "preview" ? "border-indigo-500 text-zinc-200 bg-zinc-900/50" : "border-transparent text-zinc-500"
          }`}
        >
          Preview Document
        </button>
      </div>

      {/* Main Workspace split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left column: Controls & Editor */}
        <div
          className={`w-full md:w-[45%] flex flex-col border-r border-zinc-900 overflow-y-auto p-6 space-y-6 ${
            activeMobileTab === "edit" ? "block" : "hidden md:block"
          }`}
        >
          {/* Template settings */}
          <TemplateSelector
            mode={mode}
            template={template}
            onChangeMode={setMode}
            onChangeTemplate={setTemplate}
          />

          {/* ATS score checker widget */}
          <ATSScorePanel cv={activeCVData} initialJdText={jdText} onJdUpdate={handleJdUpdate} />

          {/* Complete CV fields editor */}
          <CVEditor
            cv={baseCV}
            onChange={handleCVChange}
            sectionOrder={sectionOrder}
            onChangeSectionOrder={setSectionOrder}
          />
        </div>

        {/* Right column: Live Paper Preview */}
        <div
          className={`w-full md:w-[55%] bg-zinc-950 flex flex-col p-6 overflow-y-auto ${
            activeMobileTab === "preview" ? "block" : "hidden md:block"
          }`}
        >
          <CVPreview
            ref={previewRef}
            cv={activeCVData}
            mode={mode}
            template={template}
            sectionOrder={sectionOrder}
          />
        </div>
      </div>
    </div>
  );
}
