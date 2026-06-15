"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  /** Which visual variant to show */
  variant?: "dna" | "particles" | "coderain";
  /** The main status/progress message */
  message?: string;
  /** Optional subtext under the message */
  subtext?: string;
  /** Optional array of fun tips/facts to rotate through */
  tips?: string[];
  /** Tip rotation interval in ms */
  tipInterval?: number;
}

const defaultTips = [
  "💡 SkillVitae processes everything locally — your data never leaves your browser.",
  "🚀 Tip: The more repos you select, the richer your skills section will be.",
  "📊 ATS systems scan for exact keyword matches — we optimize for that.",
  "🔒 Your LinkedIn PDF is parsed client-side. Nothing is uploaded to a server.",
  "⚡ You can tailor the same CV for multiple jobs and save each version.",
  "🎯 Focus on quantifiable achievements — numbers make bullets stand out.",
  "✨ Use the ATS Score panel to identify missing keywords before applying.",
];

export default function LoadingScreen({
  variant = "dna",
  message = "Processing...",
  subtext,
  tips = defaultTips,
  tipInterval = 5000,
}: LoadingScreenProps) {
  const [activeTip, setActiveTip] = useState(0);
  const [tipFade, setTipFade] = useState(true);

  useEffect(() => {
    if (tips.length <= 1) return;

    const interval = setInterval(() => {
      setTipFade(false);
      setTimeout(() => {
        setActiveTip((prev) => (prev + 1) % tips.length);
        setTipFade(true);
      }, 400);
    }, tipInterval);

    return () => clearInterval(interval);
  }, [tips, tipInterval]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/8 rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-[120px] animate-float-delayed pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px] animate-float-slow pointer-events-none" />

      {/* Visual Loader */}
      <div className="relative mb-10 animate-scale-in">
        {variant === "dna" && <DNAHelix />}
        {variant === "particles" && <ParticleMorph />}
        {variant === "coderain" && <CodeRain />}
      </div>

      {/* Message */}
      <div className="text-center max-w-md animate-slide-up relative z-10">
        <p className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">
          {message}
        </p>
        {subtext && (
          <p className="text-xs text-zinc-500 mb-6">{subtext}</p>
        )}
      </div>

      {/* Tips carousel */}
      {tips.length > 0 && (
        <div className="mt-8 max-w-sm text-center relative z-10 animate-fade-in delay-1000 anim-hidden">
          <div className="glass rounded-2xl px-6 py-4">
            <p
              className={`text-xs text-zinc-400 leading-relaxed transition-all duration-400 ${
                tipFade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              {tips[activeTip]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================
   DNA HELIX VARIANT
   ============================================ */

function DNAHelix() {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Central glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-2xl animate-pulse-glow" />

      {/* Orbiting dots */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background:
              i % 2 === 0
                ? "linear-gradient(135deg, #6366f1, #818cf8)"
                : "linear-gradient(135deg, #a855f7, #c084fc)",
            animation: `dna-1 ${1.5 + i * 0.15}s ease-in-out ${i * 0.2}s infinite`,
            left: `${15 + i * 13}%`,
            top: "50%",
            boxShadow:
              i % 2 === 0
                ? "0 0 12px rgba(99, 102, 241, 0.5)"
                : "0 0 12px rgba(168, 85, 247, 0.5)",
          }}
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`b-${i}`}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background:
              i % 2 === 0
                ? "linear-gradient(135deg, #a855f7, #c084fc)"
                : "linear-gradient(135deg, #6366f1, #818cf8)",
            animation: `dna-2 ${1.5 + i * 0.15}s ease-in-out ${i * 0.2}s infinite`,
            left: `${15 + i * 13}%`,
            top: "50%",
            boxShadow:
              i % 2 === 0
                ? "0 0 12px rgba(168, 85, 247, 0.5)"
                : "0 0 12px rgba(99, 102, 241, 0.5)",
          }}
        />
      ))}

      {/* Connecting lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`line-${i}`}
          className="absolute h-[1px] bg-gradient-to-r from-indigo-500/30 to-purple-500/30"
          style={{
            width: "2px",
            left: `${17 + i * 13}%`,
            top: "50%",
            height: "20px",
            transform: "translateY(-50%)",
            animation: `fade-in 0.5s ease ${i * 0.2}s forwards`,
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================
   PARTICLE MORPH VARIANT
   ============================================ */

function ParticleMorph() {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Central morphing blob */}
      <div
        className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 animate-morph"
        style={{
          boxShadow: "0 0 40px rgba(99, 102, 241, 0.3), 0 0 80px rgba(168, 85, 247, 0.15)",
        }}
      />

      {/* Orbiting particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: i % 2 === 0 ? "#6366f1" : "#a855f7",
            animation: `orbit ${2.5 + i * 0.5}s linear ${i * 0.3}s infinite${
              i % 2 === 0 ? "" : " reverse"
            }`,
            transformOrigin: "center center",
            left: "calc(50% - 4px)",
            top: "calc(50% - 4px)",
            boxShadow: `0 0 8px ${i % 2 === 0 ? "rgba(99, 102, 241, 0.6)" : "rgba(168, 85, 247, 0.6)"}`,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================
   CODE RAIN VARIANT
   ============================================ */

const CODE_CHARS = "{}[]()<>=/;:const let var function return import export async await".split("");

function CodeRain() {
  return (
    <div className="relative w-40 h-32 overflow-hidden rounded-2xl">
      {/* Fading overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 z-10 pointer-events-none" />

      {/* Rain columns */}
      {Array.from({ length: 10 }).map((_, col) => (
        <div
          key={col}
          className="code-rain-col"
          style={{
            left: `${col * 10}%`,
            ["--fall-duration" as string]: `${3 + Math.random() * 4}s`,
            ["--fall-delay" as string]: `${Math.random() * 3}s`,
            color: col % 3 === 0 ? "rgba(99, 102, 241, 0.4)" : "rgba(168, 85, 247, 0.3)",
            fontSize: `${10 + Math.random() * 4}px`,
          }}
        >
          {Array.from({ length: 12 }).map((_, row) => (
            <div key={row} className="leading-5">
              {CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]}
            </div>
          ))}
        </div>
      ))}

      {/* Central overlay icon */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="w-14 h-14 rounded-2xl bg-zinc-950/80 backdrop-blur-sm border border-zinc-800/50 flex items-center justify-center animate-pulse-glow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-indigo-400">
            <path
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
