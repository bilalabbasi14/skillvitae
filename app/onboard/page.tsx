"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnimatedLogo from "../../components/ui/AnimatedLogo";
import ConstellationBg from "../../components/ui/ConstellationBg";
import LoadingScreen from "../../components/ui/LoadingScreen";
import LinkedInGuide from "../../components/onboard/LinkedInGuide";
import { extractPdfText } from "../../lib/pdf-parser";
import { extractUsername, fetchRepoList } from "../../lib/github";
import { setItem } from "../../lib/storage";

const STEPS = [
  { id: "github", label: "GitHub & Role", icon: "code" },
  { id: "contact", label: "Contact Info", icon: "user" },
  { id: "linkedin", label: "LinkedIn", icon: "linkedin" },
] as const;

export default function OnboardPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  // Form states
  const [githubUrl, setGithubUrl] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinPdf, setLinkedinPdf] = useState<File | null>(null);

  // Advanced Settings (PAT)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [githubToken, setGithubToken] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [progressMsg, setProgressMsg] = useState("");

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLinkedinPdf(e.target.files[0]);
    }
  };

  const canProceedStep0 = githubUrl.trim().length > 0 && targetRole.trim().length > 0;

  const handleNext = () => {
    if (activeStep === 0 && !canProceedStep0) {
      setErrorMsg("GitHub URL and Target Role are required.");
      return;
    }
    setErrorMsg("");
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setErrorMsg("");
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setProgressMsg("Validating inputs...");

    try {
      const trimmedUrl = githubUrl.trim();
      if (!trimmedUrl) throw new Error("GitHub profile URL is required.");

      const username = extractUsername(trimmedUrl);
      if (!username) throw new Error("Could not extract a valid GitHub username from the URL.");
      if (!targetRole.trim()) throw new Error("Target Role is required to help tailor your CV.");

      setProgressMsg(`Connecting to GitHub API for @${username}...`);
      const repos = await fetchRepoList(username, githubToken || undefined);
      if (!repos || repos.length === 0) throw new Error(`No public repositories found for GitHub user "${username}".`);

      let pdfText = "";
      if (linkedinPdf) {
        setProgressMsg("Parsing LinkedIn PDF client-side...");
        pdfText = await extractPdfText(linkedinPdf);
      }

      setItem("sv_github_url", trimmedUrl);
      setItem("sv_github_username", username);
      setItem("sv_repos_list", repos);
      setItem("sv_repos_list_ts", Date.now());
      if (linkedinUrl.trim()) setItem("sv_linkedin_url", linkedinUrl.trim());
      if (githubToken.trim()) setItem("sv_github_token", githubToken.trim());

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("sv_linkedin_raw_text", pdfText);
        window.sessionStorage.setItem(
          "sv_user_answers",
          JSON.stringify({
            targetRole: targetRole.trim(),
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            location: location.trim(),
          })
        );
      }

      setProgressMsg("Onboarding complete. Redirecting...");
      router.push("/select-repos");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen
        variant="coderain"
        message={progressMsg}
        subtext="This may take a moment depending on network speeds."
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Constellation background — subtle variant for inner page */}
      <ConstellationBg nodeCount={40} intensity="subtle" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
            <AnimatedLogo size="sm" />
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-50 via-indigo-200 to-zinc-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-purple-300 transition-all duration-500">
              SkillVitae
            </span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-300 bg-clip-text text-transparent">
            Onboard Your Profile
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Tell us about yourself. We&apos;ll crawl your code and credentials to build the foundation.
          </p>
        </div>

        {/* ============================================
            STEP PROGRESS BAR
            ============================================ */}
        <div className="mb-8 animate-slide-up anim-hidden">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out rounded-full"
                style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {STEPS.map((step, idx) => (
              <div key={step.id} className="relative flex flex-col items-center z-10 flex-1">
                <button
                  type="button"
                  onClick={() => { if (idx < activeStep) setActiveStep(idx); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    idx < activeStep
                      ? "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                      : idx === activeStep
                      ? "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 scale-110 ring-4 ring-indigo-500/20"
                      : "bg-zinc-900/80 text-zinc-600 border border-zinc-800"
                  }`}
                >
                  {idx < activeStep ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </button>
                <span className={`mt-2 text-[11px] font-medium transition-colors duration-300 ${
                  idx <= activeStep ? "text-zinc-200" : "text-zinc-600"
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================
            FORM CARD
            ============================================ */}
        <div className="glass rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/5 animate-scale-in">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-start gap-2 animate-slide-up-sm">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <strong className="font-semibold block mb-0.5">Error occurred:</strong>
                {errorMsg}
              </div>
            </div>
          )}

          <form onSubmit={handleOnboardSubmit}>
            {/* ======== STEP 0: GitHub & Role ======== */}
            <div className={`transition-all duration-500 ${activeStep === 0 ? "block animate-slide-in-right" : "hidden"}`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold tracking-wider text-indigo-400 uppercase">Core Identifiers</h3>
                </div>

                <div className="animate-slide-up-sm anim-hidden delay-100">
                  <label htmlFor="github-url" className="block text-xs font-medium text-zinc-400 mb-1.5">
                    GitHub Profile URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="github-url"
                    type="url"
                    required
                    placeholder="https://github.com/yourusername"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all duration-300"
                  />
                </div>

                <div className="animate-slide-up-sm anim-hidden delay-200">
                  <label htmlFor="target-role" className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Target Job Role <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="target-role"
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer or ML Research Scientist"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all duration-300"
                  />
                </div>

                <div className="animate-slide-up-sm anim-hidden delay-300">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-medium transition-colors"
                  >
                    <svg className={`h-3 w-3 transition-transform duration-300 ${showAdvanced ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    Advanced Settings (GitHub Rate Limits)
                  </button>

                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showAdvanced ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
                    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-3">
                      <p className="text-[11px] text-zinc-500 leading-normal">
                        GitHub API limits unauthenticated requests to 60/hour per IP. Provide an optional PAT for 5,000/hour.
                      </p>
                      <div>
                        <label htmlFor="github-token" className="block text-[10px] font-medium text-zinc-400 mb-1">
                          GitHub Personal Access Token (Optional)
                        </label>
                        <input
                          id="github-token"
                          type="password"
                          placeholder="ghp_..."
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ======== STEP 1: Contact Info ======== */}
            <div className={`transition-all duration-500 ${activeStep === 1 ? "block animate-slide-in-right" : "hidden"}`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold tracking-wider text-purple-400 uppercase">Contact Information</h3>
                </div>
                <p className="text-xs text-zinc-500 -mt-2">Provide defaults in case they are not parsed from LinkedIn.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="animate-slide-up-sm anim-hidden delay-100">
                    <label htmlFor="full-name" className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label>
                    <input id="full-name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all duration-300" />
                  </div>
                  <div className="animate-slide-up-sm anim-hidden delay-200">
                    <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address</label>
                    <input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all duration-300" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="animate-slide-up-sm anim-hidden delay-300">
                    <label htmlFor="phone" className="block text-xs font-medium text-zinc-400 mb-1.5">Phone Number</label>
                    <input id="phone" type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all duration-300" />
                  </div>
                  <div className="animate-slide-up-sm anim-hidden delay-400">
                    <label htmlFor="location" className="block text-xs font-medium text-zinc-400 mb-1.5">Location</label>
                    <input id="location" type="text" placeholder="San Francisco, CA" value={location} onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* ======== STEP 2: LinkedIn ======== */}
            <div className={`transition-all duration-500 ${activeStep === 2 ? "block animate-slide-in-right" : "hidden"}`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold tracking-wider text-blue-400 uppercase">LinkedIn Profile</h3>
                </div>

                <div className="animate-slide-up-sm anim-hidden delay-100">
                  <label className="block text-xs font-medium text-zinc-400 mb-2">
                    Option A: LinkedIn PDF Export (Recommended)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-950/40 rounded-xl cursor-pointer hover:bg-zinc-950/80 transition-all duration-300 group relative overflow-hidden">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                        background: "linear-gradient(90deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05), rgba(99,102,241,0.05))",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 2s linear infinite",
                      }} />
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 relative z-10">
                        <svg className="w-8 h-8 mb-3 text-zinc-500 group-hover:text-indigo-400 transition-colors duration-300 group-hover:scale-110 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-xs text-zinc-400">
                          {linkedinPdf ? (
                            <span className="text-indigo-400 font-semibold flex items-center gap-1.5">
                              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              {linkedinPdf.name}
                            </span>
                          ) : (
                            <span>Click to upload your LinkedIn profile PDF</span>
                          )}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-1">PDF max 10MB</p>
                      </div>
                      <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfChange} />
                    </label>
                  </div>
                </div>

                <div className="animate-slide-up-sm anim-hidden delay-200">
                  <LinkedInGuide />
                </div>

                <div className="animate-slide-up-sm anim-hidden delay-300">
                  <label htmlFor="linkedin-url" className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Option B: Public LinkedIn URL (Fallback)
                  </label>
                  <input
                    id="linkedin-url"
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* ============================================
                NAVIGATION BUTTONS
                ============================================ */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800/30">
              {activeStep > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 text-zinc-300 font-medium text-sm transition-all duration-300 hover:border-zinc-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 text-zinc-300 font-medium text-sm transition-all duration-300 hover:border-zinc-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Home
                </Link>
              )}

              {activeStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Continue
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  className="relative flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                    background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s linear infinite",
                  }} />
                  <span className="relative z-10">Scan Code & Credentials</span>
                  <svg className="h-5 w-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
