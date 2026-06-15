"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnimatedLogo from "../../components/ui/AnimatedLogo";
import { getItem, setItem } from "../../lib/storage";
import { inferProficiency, RepoSummary } from "../../lib/github";

type StepStatus = "idle" | "loading" | "success" | "error";

interface PipelineStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
}

const FUN_FACTS = [
  "💡 SkillVitae uses Gemini 1.5 Flash for GitHub analysis — lightning-fast AI inference.",
  "📊 The average developer has 30+ public repos but only 5-8 are truly resume-worthy.",
  "🎯 Resumes tailored to job descriptions get 3x more callbacks than generic ones.",
  "🔍 ATS systems reject ~75% of resumes before a human ever sees them.",
  "⚡ We process your LinkedIn PDF entirely client-side — zero server uploads.",
  "🏆 Quantified achievements (\"Reduced load time by 40%\") outperform vague descriptions.",
  "🌍 SkillVitae stores everything in localStorage — your data never leaves your browser.",
];

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
  const [activeFact, setActiveFact] = useState(0);
  const [factFade, setFactFade] = useState(true);

  const updateStepStatus = (id: string, status: StepStatus) => {
    setSteps(prev =>
      prev.map(step => (step.id === id ? { ...step, status } : step))
    );
  };

  // Rotate fun facts
  useEffect(() => {
    const interval = setInterval(() => {
      setFactFade(false);
      setTimeout(() => {
        setActiveFact(prev => (prev + 1) % FUN_FACTS.length);
        setFactFade(true);
      }, 400);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const runPipeline = async () => {
      try {
        const repoSummaries = getItem<RepoSummary[]>("sv_repos_cache");
        const linkedinRawText = window.sessionStorage.getItem("sv_linkedin_raw_text") || "";
        const answersStr = window.sessionStorage.getItem("sv_user_answers");
        const userAnswers = answersStr ? JSON.parse(answersStr) : {};

        if (!repoSummaries || repoSummaries.length === 0) {
          throw new Error("Missing GitHub repository summaries. Please return to repository selection.");
        }

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
          updateStepStatus("linkedin", "success");
        }

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

        const githubUrl = getItem<string>("sv_github_url") || "";

        const cvAssemblyRes = await fetch("/api/assemble-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            githubAnalysis,
            linkedinData,
            userAnswers,
            skills,
            githubUrl,
          }),
        });

        if (!cvAssemblyRes.ok) {
          const errData = await cvAssemblyRes.json();
          throw new Error(`CV assembly failed: ${errData.error || cvAssemblyRes.statusText}`);
        }

        const finalCV = await cvAssemblyRes.json();
        updateStepStatus("assemble", "success");

        setItem("sv_cv_base", finalCV);
        setItem("sv_cv_tailored", []);
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

  const allDone = steps.every(s => s.status === "success");

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[140px] animate-float pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[120px] animate-float-delayed pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] animate-float-slow pointer-events-none" />

      {/* Particle dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-indigo-400/15 animate-particle-float"
            style={{
              left: `${5 + (i * 5) % 90}%`,
              top: `${10 + (i * 11) % 80}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-down">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <AnimatedLogo size="md" />
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
              SkillVitae
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-300 bg-clip-text text-transparent">
            Generating Base CV
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Our AI pipelines are mapping your code repos and profile history.
          </p>
        </div>

        {/* Pipeline Container */}
        <div className="glass rounded-2xl p-6 shadow-xl space-y-6 animate-scale-in">
          {errorMessage && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex flex-col gap-3 animate-slide-up-sm">
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

          {/* Pipeline Steps */}
          <div className="space-y-1">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex gap-4 items-start p-4 rounded-xl transition-all duration-500 ${
                  step.status === "loading"
                    ? "bg-indigo-500/5 border border-indigo-500/10"
                    : step.status === "success"
                    ? "bg-emerald-500/5"
                    : step.status === "error"
                    ? "bg-red-500/5"
                    : ""
                }`}
                style={{
                  animation: `slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.15}s forwards`,
                  opacity: 0,
                }}
              >
                {/* Step indicator */}
                <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                  {step.status === "loading" && (
                    <div className="relative h-7 w-7">
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      <div className="absolute inset-0 rounded-full bg-indigo-500/5 animate-pulse-glow" />
                    </div>
                  )}
                  {step.status === "success" && (
                    <div className="h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce-in">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {step.status === "error" && (
                    <div className="h-7 w-7 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center animate-scale-in">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  {step.status === "idle" && (
                    <div className="h-7 w-7 rounded-full border-2 border-zinc-800 bg-zinc-950/40 text-zinc-600 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3
                    className={`text-sm font-bold transition-colors duration-500 ${
                      step.status === "loading"
                        ? "text-indigo-400"
                        : step.status === "success"
                        ? "text-emerald-300"
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
                  {step.status === "success" && (
                    <p className="text-xs text-emerald-500/60 mt-1 animate-fade-in">
                      Completed successfully
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-zinc-800/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
              style={{
                width: `${(steps.filter(s => s.status === "success").length / steps.length) * 100}%`,
              }}
            />
          </div>

          {/* All done message */}
          {!errorMessage && allDone && (
            <div className="text-center py-2 animate-bounce-in">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Base CV generated successfully! Redirecting...
              </div>
            </div>
          )}
        </div>

        {/* Fun facts carousel */}
        {!errorMessage && !allDone && (
          <div className="mt-8 animate-fade-in delay-1000 anim-hidden">
            <div className="glass rounded-2xl px-6 py-4 text-center">
              <p
                className={`text-xs text-zinc-400 leading-relaxed transition-all duration-400 ${
                  factFade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                {FUN_FACTS[activeFact]}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
