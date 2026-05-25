"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LinkedInGuide from "../../components/onboard/LinkedInGuide";
import { extractPdfText } from "../../lib/pdf-parser";
import { extractUsername, fetchRepoList } from "../../lib/github";
import { setItem } from "../../lib/storage";

export default function OnboardPage() {
  const router = useRouter();
  
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

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setProgressMsg("Validating inputs...");

    try {
      // 1. Validate GitHub URL
      const trimmedUrl = githubUrl.trim();
      if (!trimmedUrl) {
        throw new Error("GitHub profile URL is required.");
      }
      
      const username = extractUsername(trimmedUrl);
      if (!username) {
        throw new Error("Could not extract a valid GitHub username from the URL.");
      }

      if (!targetRole.trim()) {
        throw new Error("Target Role is required to help tailor your CV.");
      }

      // 2. Fetch GitHub Repos (Client-side)
      setProgressMsg(`Connecting to GitHub API for @${username}...`);
      const repos = await fetchRepoList(username, githubToken || undefined);

      if (!repos || repos.length === 0) {
        throw new Error(`No public repositories found for GitHub user "${username}".`);
      }

      // 3. Process LinkedIn PDF if uploaded
      let pdfText = "";
      if (linkedinPdf) {
        setProgressMsg("Parsing LinkedIn PDF client-side...");
        pdfText = await extractPdfText(linkedinPdf);
      }

      // 4. Save metadata to localStorage/sessionStorage
      setItem("sv_github_url", trimmedUrl);
      setItem("sv_github_username", username);
      setItem("sv_repos_list", repos);
      setItem("sv_repos_list_ts", Date.now());
      if (linkedinUrl.trim()) {
        setItem("sv_linkedin_url", linkedinUrl.trim());
      }
      if (githubToken.trim()) {
        setItem("sv_github_token", githubToken.trim());
      }

      // Save user answers & PDF text to session storage for the assemble stage
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

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
              SV
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
              SkillVitae
            </span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Onboard Profile</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Tell us about yourself. We'll crawl your code and credentials to build the foundation.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-start gap-2">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <strong className="font-semibold block mb-0.5">Error occurred:</strong>
                {errorMsg}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="relative h-16 w-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
              </div>
              <p className="text-indigo-400 font-medium">{progressMsg}</p>
              <p className="text-xs text-zinc-500 mt-2">This may take a moment depending on network speeds.</p>
            </div>
          ) : (
            <form onSubmit={handleOnboardSubmit} className="space-y-6">
              {/* Section 1: GitHub & Role */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold tracking-wider text-indigo-400 uppercase">Core Identifiers</h3>
                
                <div>
                  <label htmlFor="github-url" className="block text-xs font-medium text-zinc-400 mb-1.5">
                    GitHub Profile URL *
                  </label>
                  <input
                    id="github-url"
                    type="url"
                    required
                    placeholder="https://github.com/yourusername"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="target-role" className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Target Job Role *
                  </label>
                  <input
                    id="target-role"
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer or ML Research Scientist"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Section 2: Personal Details */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="text-sm font-semibold tracking-wider text-indigo-400 uppercase">Contact Information</h3>
                <p className="text-xs text-zinc-500">Provide defaults in case they are not parsed from LinkedIn.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="full-name" className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Full Name
                    </label>
                    <input
                      id="full-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Location
                    </label>
                    <input
                      id="location"
                      type="text"
                      placeholder="San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: LinkedIn Credentials */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="text-sm font-semibold tracking-wider text-indigo-400 uppercase">LinkedIn Profile</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">
                      Option A: LinkedIn PDF Export (Recommended)
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 rounded-xl cursor-pointer hover:bg-zinc-950/80 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          <svg className="w-8 h-8 mb-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xs text-zinc-400">
                            {linkedinPdf ? (
                              <span className="text-indigo-400 font-semibold">{linkedinPdf.name}</span>
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

                  <LinkedInGuide />

                  <div>
                    <label htmlFor="linkedin-url" className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Option B: Public LinkedIn URL (Fallback)
                    </label>
                    <input
                      id="linkedin-url"
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-medium transition-colors"
                >
                  <svg
                    className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Advanced Settings (GitHub Rate Limits)
                </button>
                
                {showAdvanced && (
                  <div className="mt-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-3">
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      GitHub API limits unauthenticated requests to 60/hour per IP. If you hit limits, provide an optional Personal Access Token (PAT) to boost limits to 5,000/hour.
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
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                Scan Code & Credentials
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

