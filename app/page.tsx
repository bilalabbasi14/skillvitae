import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />

      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-900 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            SV
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            SkillVitae
          </span>
        </div>
        <Link
          href="/onboard"
          className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-200 transition-all duration-200 shadow-sm"
        >
          Launch App
        </Link>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center relative z-10">
        {/* Badge */}
        <div className="mb-6 px-3 py-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full tracking-wide uppercase animate-pulse">
          ATS-Optimized CV & Resume Builder
        </div>

        {/* Hero Headline */}
        <h1 className="max-w-4xl text-center text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-8 bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Create Resumes and CVs Built From Your{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Actual Code
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl text-center text-lg text-zinc-400 leading-relaxed mb-12">
          Stop typing your skills manually. SkillVitae parses your public GitHub repositories
          and LinkedIn profile, infers your competencies from real artifacts, and lets you tailor
          them to any job posting with actionable ATS feedback.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-24 w-full justify-center items-center">
          <Link
            href="/onboard"
            className="flex h-14 px-8 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all hover:scale-[1.02] active:scale-[0.98] duration-200 w-full sm:w-auto"
          >
            Build Your Resume
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <a
            href="#features"
            className="flex h-14 px-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700 text-zinc-300 font-medium transition-all duration-200 w-full sm:w-auto"
          >
            How it works
          </a>
        </div>

        {/* Features Grid */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-zinc-900 pt-16">
          <div className="relative group p-8 rounded-2xl border border-zinc-900 bg-zinc-950 hover:border-zinc-800 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform duration-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-zinc-50 group-hover:text-indigo-300 transition-colors duration-200">
              GitHub-Driven Extraction
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We list and score your public repositories. We read READMEs and dependency files
              (package.json, requirements.txt, Gradle) to infer actual skills and proficiencies.
            </p>
          </div>

          <div className="relative group p-8 rounded-2xl border border-zinc-900 bg-zinc-950 hover:border-zinc-800 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform duration-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-zinc-50 group-hover:text-purple-300 transition-colors duration-200">
              LinkedIn PDF Parser
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Upload your official LinkedIn PDF export. We parse it completely client-side in
              your browser to assemble structured work experience, education, and language sections.
            </p>
          </div>

          <div className="relative group p-8 rounded-2xl border border-zinc-900 bg-zinc-950 hover:border-zinc-800 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform duration-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-zinc-50 group-hover:text-emerald-300 transition-colors duration-200">
              ATS Feedback & Tailoring
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Paste a job URL or description. We calculate a real-time, deterministic ATS score
              based on keyword match, sections, and dates, with clear checklists to follow.
            </p>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-zinc-900 py-8 text-center text-xs text-zinc-600 bg-zinc-950 mt-auto">
        <p>&copy; {new Date().getFullYear()} SkillVitae. Persisted locally in your browser. No data leaves your machine.</p>
      </footer>
    </div>
  );
}

