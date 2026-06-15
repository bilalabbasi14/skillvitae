"use client";

import Link from "next/link";
import AnimatedLogo from "../components/ui/AnimatedLogo";
import ConstellationBg from "../components/ui/ConstellationBg";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* ============================================
          INTERACTIVE CONSTELLATION BACKGROUND
          ============================================ */}
      <ConstellationBg nodeCount={70} intensity="full" />

      {/* ============================================
          HEADER — Logo + Name only
          ============================================ */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-center relative z-50 animate-slide-down">
        <Link href="/" className="flex items-center gap-2.5 group">
          <AnimatedLogo size="md" />
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-zinc-50 via-indigo-200 to-zinc-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-purple-300 transition-all duration-500">
            SkillVitae
          </span>
        </Link>
      </header>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center justify-center relative z-10">
        {/* Animated badge */}
        <div className="mb-8 animate-bounce-in">
          <div className="px-4 py-1.5 text-xs font-semibold text-indigo-300 glass rounded-full tracking-wide uppercase flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            ATS-Optimized CV & Resume Builder
          </div>
        </div>

        {/* Hero headline — dramatic staggered reveal */}
        <h1 className="max-w-5xl text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-8">
          <span className="block overflow-hidden">
            <span className="block animate-text-reveal anim-hidden" style={{ animationDelay: "0.2s" }}>
              Your Code Tells a Story.
            </span>
          </span>
          <span className="block overflow-hidden mt-2">
            <span className="block animate-text-reveal anim-hidden" style={{ animationDelay: "0.5s" }}>
              Let{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ backgroundSize: "200% 100%", animation: "gradient-shift 4s ease infinite" }}>
                  AI Write Your Resume
                </span>
                {/* Underline glow */}
                <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-60" style={{ animation: "shimmer 2s linear infinite", backgroundSize: "200% 100%" }} />
              </span>
            </span>
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl text-center text-base sm:text-lg text-zinc-400 leading-relaxed mb-12 animate-slide-up anim-hidden" style={{ animationDelay: "0.8s" }}>
          Connect your GitHub. Upload your LinkedIn. SkillVitae&apos;s AI reads your
          real code, infers skills from actual projects, and builds a resume that
          ATS systems love — in minutes.
        </p>

        {/* CTA — single prominent button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-24 justify-center items-center animate-scale-in anim-hidden" style={{ animationDelay: "1s" }}>
          <Link
            href="/onboard"
            className="relative flex h-14 px-10 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-semibold text-lg shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-[1.04] active:scale-[0.97] duration-300 overflow-hidden group"
          >
            {/* Moving shimmer */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
              background: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.2) 50%, transparent 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s linear infinite",
            }} />
            <span className="relative z-10">Build Your Resume</span>
            <svg
              className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <a
            href="#features"
            className="flex h-14 px-8 items-center justify-center rounded-2xl glass text-zinc-300 font-medium transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-800/40 group gap-2"
          >
            See How It Works
            <svg className="h-4 w-4 text-zinc-500 group-hover:translate-y-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>

        {/* ============================================
            FEATURES SECTION — 3D perspective cards
            ============================================ */}
        <section id="features" className="w-full pt-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 animate-slide-up anim-hidden" style={{ animationDelay: "0.3s" }}>
              Three Steps to a{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Perfect Resume
              </span>
            </h2>
            <p className="text-sm text-zinc-500 max-w-lg mx-auto animate-slide-up anim-hidden" style={{ animationDelay: "0.5s" }}>
              From raw code to recruiter-ready in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 perspective-[1200px]">
            {/* Feature 1 */}
            <div className="group animate-slide-up anim-hidden" style={{ animationDelay: "0.6s" }}>
              <div className="relative p-8 rounded-2xl glass hover-lift transition-all duration-500 group-hover:border-indigo-500/30 h-full">
                {/* Animated top border */}
                <div className="absolute top-0 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  {/* Icon with pulse ring */}
                  <div className="relative h-14 w-14 mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-ping opacity-0 group-hover:opacity-20" style={{ animationDuration: "2s" }} />
                    <div className="relative h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-black text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors duration-300">01</span>
                    <h3 className="text-lg font-bold text-zinc-50 group-hover:text-indigo-300 transition-colors duration-300">
                      Connect GitHub
                    </h3>
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed">
                    We scan your public repos — READMEs, package.json, requirements.txt, Gradle files — to extract real skills, frameworks, and proficiency levels.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group animate-slide-up anim-hidden" style={{ animationDelay: "0.8s" }}>
              <div className="relative p-8 rounded-2xl glass hover-lift transition-all duration-500 group-hover:border-purple-500/30 h-full">
                <div className="absolute top-0 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="relative h-14 w-14 mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-purple-500/20 animate-ping opacity-0 group-hover:opacity-20" style={{ animationDuration: "2s" }} />
                    <div className="relative h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-black text-purple-500/20 group-hover:text-purple-500/40 transition-colors duration-300">02</span>
                    <h3 className="text-lg font-bold text-zinc-50 group-hover:text-purple-300 transition-colors duration-300">
                      Import LinkedIn
                    </h3>
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Upload your LinkedIn PDF export. We parse it entirely in your browser to extract work history, education, certifications, and languages.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group animate-slide-up anim-hidden" style={{ animationDelay: "1s" }}>
              <div className="relative p-8 rounded-2xl glass hover-lift transition-all duration-500 group-hover:border-emerald-500/30 h-full">
                <div className="absolute top-0 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="relative h-14 w-14 mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping opacity-0 group-hover:opacity-20" style={{ animationDuration: "2s" }} />
                    <div className="relative h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-black text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors duration-300">03</span>
                    <h3 className="text-lg font-bold text-zinc-50 group-hover:text-emerald-300 transition-colors duration-300">
                      Tailor & Score
                    </h3>
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Paste any job posting. Get a real-time ATS score, keyword gap analysis, and AI-rewritten bullet points optimized for that specific role.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            STATS / TRUST STRIP
            ============================================ */}
        <section className="w-full mt-20 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: "100%", label: "Client-Side", icon: "🔒" },
              { value: "AI", label: "Powered Analysis", icon: "⚡" },
              { value: "ATS", label: "Score Checker", icon: "📊" },
              { value: "Free", label: "No Sign-Up", icon: "✨" },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-5 text-center hover-lift animate-slide-up anim-hidden group"
                style={{ animationDelay: `${1.2 + idx * 0.15}s` }}
              >
                <div className="text-2xl mb-2 group-hover:scale-125 transition-transform duration-300">{stat.icon}</div>
                <div className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-[11px] text-zinc-500 font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================
            BOTTOM CTA
            ============================================ */}
        <section className="w-full mt-8 mb-8">
          <div className="relative rounded-3xl overflow-hidden p-12 text-center" style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 50%, rgba(99,102,241,0.08) 100%)",
            border: "1px solid rgba(99,102,241,0.15)",
          }}>
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-3xl opacity-30" style={{
              background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.1), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 4s linear infinite",
            }} />

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                Stop Typing Skills.{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Start Proving Them.
                </span>
              </h2>
              <p className="text-sm text-zinc-400 mb-8 max-w-md mx-auto">
                Your GitHub commits and LinkedIn experience say more than a list of buzzwords ever could.
              </p>
              <Link
                href="/onboard"
                className="inline-flex h-12 px-8 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
              >
                Get Started Now
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="w-full border-t border-zinc-900/30 py-8 text-center text-xs text-zinc-600 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AnimatedLogo size="sm" animate={false} />
            <span className="font-medium text-zinc-500">SkillVitae</span>
          </div>
          <p>&copy; {new Date().getFullYear()} SkillVitae. Everything runs locally in your browser. No data leaves your machine.</p>
        </div>
      </footer>
    </div>
  );
}
