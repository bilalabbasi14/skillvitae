"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnimatedLogo from "../../components/ui/AnimatedLogo";
import LoadingScreen from "../../components/ui/LoadingScreen";
import RepoSelectionCard from "../../components/RepoSelectionCard";
import { computeRepoScore, fetchSelectedRepoDetails, fetchRepoList, GitHubRepo } from "../../lib/github";
import { getItem, setItem } from "../../lib/storage";

export default function SelectReposPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCrawling, setIsCrawling] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [progressMsg, setProgressMsg] = useState("");

  useEffect(() => {
    const storedUsername = getItem<string>("sv_github_username");
    const storedToken = getItem<string>("sv_github_token") || "";
    const storedRepos = getItem<GitHubRepo[]>("sv_repos_list");

    if (!storedUsername || !storedRepos) {
      router.push("/onboard");
      return;
    }

    setUsername(storedUsername);
    setToken(storedToken);

    const sorted = [...storedRepos].sort((a, b) => computeRepoScore(b) - computeRepoScore(a));
    setRepos(sorted);

    const initialSelected = sorted
      .slice(0, 8)
      .map(r => r.name);

    setSelectedNames(initialSelected);
    setIsLoading(false);
  }, [router]);

  const handleCheckboxChange = (repoName: string, checked: boolean) => {
    if (checked) {
      if (selectedNames.length >= 8) return;
      setSelectedNames([...selectedNames, repoName]);
    } else {
      setSelectedNames(selectedNames.filter(name => name !== repoName));
    }
  };

  const handleRefreshRepos = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const freshRepos = await fetchRepoList(username, token || undefined);
      setRepos(freshRepos.sort((a, b) => computeRepoScore(b) - computeRepoScore(a)));
      setItem("sv_repos_list", freshRepos);
      setItem("sv_repos_list_ts", Date.now());

      const topSelected = freshRepos
        .slice(0, 8)
        .map(r => r.name);
      setSelectedNames(topSelected);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Failed to refresh: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedNames.length === 0) {
      setErrorMsg("Please select at least 1 repository to proceed.");
      return;
    }

    setIsCrawling(true);
    setErrorMsg("");
    setProgressMsg("Fetching READMEs and scanning package dependency files in parallel...");

    try {
      const repoSummaries = await fetchSelectedRepoDetails(username, selectedNames, token || undefined);

      setItem("sv_repos_selected", selectedNames);
      setItem("sv_repos_cache", repoSummaries);
      setItem("sv_repos_cache_ts", Date.now());

      router.push("/building");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Failed crawling repo details: ${msg}`);
      setIsCrawling(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen
        variant="particles"
        message="Loading repositories..."
        subtext="Fetching your GitHub repository data."
      />
    );
  }

  if (isCrawling) {
    return (
      <LoadingScreen
        variant="particles"
        message="Analyzing Repo Architecture"
        subtext={progressMsg}
        tips={[
          "📦 We scan package.json, requirements.txt, and Gradle files for dependency analysis.",
          "📝 README snippets help us understand your project goals and achievements.",
          "🔍 Only public repository data is collected — we never access private repos.",
          "⚡ Dependencies are fetched in parallel for maximum speed.",
        ]}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-[128px] animate-float pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-[128px] animate-float-delayed pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900/50 pb-6 mb-8 gap-4 animate-slide-down">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3 group">
              <AnimatedLogo size="sm" />
              <span className="text-sm font-bold tracking-tight text-zinc-400 group-hover:text-zinc-200 transition-colors">SkillVitae</span>
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent">
              Select Repositories
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Select up to 8 repos that showcase your best work. Sorted by computed relevance.
            </p>
          </div>
          <div className="flex items-center gap-4 animate-fade-in">
            <button
              onClick={handleRefreshRepos}
              className="text-xs text-zinc-500 hover:text-zinc-300 font-medium underline underline-offset-4 cursor-pointer transition-colors duration-300"
            >
              Refresh Repositories
            </button>
            <span className="text-sm font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl animate-pulse-glow">
              {selectedNames.length} of 8 Selected
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-start gap-2 animate-slide-up-sm">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong className="font-semibold block mb-0.5">Error:</strong>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Repos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {repos.map((repo, idx) => (
            <div
              key={repo.name}
              className="animate-slide-up anim-hidden"
              style={{ animationDelay: `${Math.min(idx * 50, 600)}ms` }}
            >
              <RepoSelectionCard
                repo={repo}
                isChecked={selectedNames.includes(repo.name)}
                disabled={selectedNames.length >= 8}
                onChange={(checked) => handleCheckboxChange(repo.name, checked)}
              />
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-zinc-900/50 pt-6 animate-fade-in">
          <Link
            href="/onboard"
            className="flex items-center gap-1.5 px-6 py-3 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 text-zinc-300 font-semibold text-sm transition-all duration-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Onboard
          </Link>

          <button
            onClick={handleConfirmSelection}
            disabled={selectedNames.length === 0}
            className="relative px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none overflow-hidden group"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
              background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s linear infinite",
            }} />
            <span className="relative z-10">Confirm & Crawl Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
