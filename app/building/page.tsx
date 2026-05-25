"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getItem, setItem } from "../../lib/storage";
import { inferProficiency, RepoSummary } from "../../lib/github";

type StepStatus = "idle" | "loading" | "success" | "error";

interface PipelineStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
}

export default function BuildingPage() {
  const router = useRouter();
  const effectRan = useRef(false);

  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: "github",
      label: "Analyzing GitHub Repositories",
      description: "Extracting projects and highlighting achievements using Gemini 1.5 Flash...",
      status: "idle",
    },
    {
      id: "linkedin",
      label: "Parsing LinkedIn Credentials",
      description: "Extracting professional history, education, and credentials using Groq...",
      status: "idle",
    },
    {
      id: "assemble",
      label: "Assembling Consolidated CV",
      description: "Merging all signals and custom inputs into a polished CV structure...",
      status: "idle",
    },
  ]);

  const [errorMessage, setErrorMessage] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const updateStepStatus = (id: string, status: StepStatus) => {
    setSteps(prev =>
      prev.map(step => (step.id === id ? { ...step, status } : step))
    );
  };

  useEffect(() => {
    // Avoid double run in React StrictMode
    if (effectRan.current) return;
    effectRan.current = true;

    const runPipeline = async () => {
      try {
        // 1. Read input data from caches
        const repoSummaries = getItem<RepoSummary[]>("sv_repos_cache");
        const linkedinRawText = window.sessionStorage.getItem("sv_linkedin_raw_text") || "";
        const answersStr = window.sessionStorage.getItem("sv_user_answers");
        const userAnswers = answersStr ? JSON.parse(answersStr) : {};

        if (!repoSummaries || repoSummaries.length === 0) {
          throw new Error("Missing GitHub repository summaries. Please return to repository selection.");
        }

        // 2. Step 1: GitHub Analysis
        setCurrentStepIndex(0);
        updateStepStatus("github", "loading");
        
        const gitAnalysisRes = await fetch("/api/analyze-github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoSummaries }),
        });

        if (!gitAnalysisRes.ok) {
          const errData = await gitAnalysisRes.json();
          throw new Error(`GitHub analysis failed: ${errData.error || gitAnalysisRes.statusText}`);
        }

        const githubAnalysis = await gitAnalysisRes.json();
        updateStepStatus("github", "success");

        // 3. Step 2: LinkedIn PDF Parse (if raw text exists)
        let linkedinData = null;
        if (linkedinRawText) {
          setCurrentStepIndex(1);
          updateStepStatus("linkedin", "loading");

          const liParseRes = await fetch("/api/parse-linkedin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pdfText: linkedinRawText }),
          });

          if (!liParseRes.ok) {
            const errData = await liParseRes.json();
            throw new Error(`LinkedIn parsing failed: ${errData.error || liParseRes.statusText}`);
          }

          linkedinData = await liParseRes.json();
          updateStepStatus("linkedin", "success");
        } else {
          // Skip step if no PDF
          updateStepStatus("linkedin", "success");
        }

        // 4. Compute unique skills list with proficiency levels deterministically
        setCurrentStepIndex(2);
        updateStepStatus("assemble", "loading");

        const allSkillsSet = new Set<string>();
        for (const r of repoSummaries) {
          if (r.primary_language) allSkillsSet.add(r.primary_language);
          for (const dep of r.dependencies) allSkillsSet.add(dep);
          for (const topic of r.topics) allSkillsSet.add(topic);
        }

        const skills = Array.from(allSkillsSet).map(skill => {
          return {
            name: skill,
            level: inferProficiency(skill, repoSummaries),
            source: "github" as const,
          };
        });

        // 5. Step 3: Assemble CV
        const cvAssemblyRes = await fetch("/api/assemble-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            githubAnalysis,
            linkedinData,
            userAnswers,
            skills,
          }),
        });

        if (!cvAssemblyRes.ok) {
          const errData = await cvAssemblyRes.json();
          throw new Error(`CV assembly failed: ${errData.error || cvAssemblyRes.statusText}`);
        }

        const finalCV = await cvAssemblyRes.json();
        updateStepStatus("assemble", "success");

        // 6. Save base CV to localStorage and navigate to editor
        setItem("sv_cv_base", finalCV);
        
        // Save initial empty tailored list
        setItem("sv_cv_tailored", []);

        // Save default settings
        setItem("sv_settings", {
          template: "ats-safe",
          mode: "resume",
          sectionOrder: ["experience", "projects", "education", "skills", "certifications", "languages"],
        });

        setTimeout(() => {
          router.push("/editor");
        }, 1500);

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(msg);
        
        // Mark failed step as error
        setSteps(prev =>
          prev.map((step, idx) => {
            if (idx === currentStepIndex) return { ...step, status: "error" as StepStatus };
            return step;
          })
        );
      }
    };

    runPipeline();
  }, [router]);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs animate-pulse">
              SV
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
              SkillVitae
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Generating Base CV</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Our AI pipelines are mapping your code repos and profile history.
          </p>
        </div>

        {/* Pipeline Container */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <strong className="font-semibold block mb-0.5">Generation Failed:</strong>
                  {errorMessage}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Link
                  href="/select-repos"
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 transition-colors"
                >
                  Adjust Repos
                </Link>
                <Link
                  href="/onboard"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
                >
                  Restart Onboard
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex gap-4 items-start">
                {/* Step indicator status circle */}
                <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                  {step.status === "loading" && (
                    <div className="h-6 w-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                  )}
                  {step.status === "success" && (
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {step.status === "error" && (
                    <div className="h-6 w-6 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  {step.status === "idle" && (
                    <div className="h-6 w-6 rounded-full border-2 border-zinc-800 bg-zinc-950/40 text-zinc-600 flex items-center justify-center text-xs font-semibold">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3
                    className={`text-sm font-bold transition-colors ${
                      step.status === "loading"
                        ? "text-indigo-400"
                        : step.status === "success"
                        ? "text-zinc-200"
                        : step.status === "error"
                        ? "text-red-400"
                        : "text-zinc-500"
                    }`}
                  >
                    {step.label}
                  </h3>
                  {step.status === "loading" && (
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed animate-fade-in">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!errorMessage && steps.every(s => s.status === "success") && (
            <div className="text-center py-2 text-xs text-emerald-400 font-semibold animate-bounce">
              ✓ Base CV generated successfully! Redirecting...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
