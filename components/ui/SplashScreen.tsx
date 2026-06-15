"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [stage, setStage] = useState<"drawing" | "burst" | "fade">("drawing");

  useEffect(() => {
    // Only show once per session
    const hasSeenSplash = window.sessionStorage.getItem("sv_splash_seen");
    if (hasSeenSplash) {
      setShow(false);
      return;
    }

    // Sequence timing
    const burstTimer = setTimeout(() => setStage("burst"), 1500);
    const fadeTimer = setTimeout(() => setStage("fade"), 2500);
    const hideTimer = setTimeout(() => {
      setShow(false);
      window.sessionStorage.setItem("sv_splash_seen", "true");
    }, 3200);

    return () => {
      clearTimeout(burstTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${
        stage === "fade" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background glow that pulses during burst */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] transition-all duration-1000 ${
          stage === "burst"
            ? "bg-indigo-500/20 scale-150"
            : "bg-indigo-500/0 scale-50"
        }`}
      />

      {/* Main Logo Container */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-24 h-24 mb-6">
          {/* Burst Particles */}
          {stage === "burst" && (
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: i % 2 === 0 ? "#6366f1" : "#a855f7",
                    transform: "translate(-50%, -50%)",
                    animation: `splash-particle 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    ["--angle" as string]: `${i * 30}deg`,
                    ["--distance" as string]: `${60 + Math.random() * 40}px`,
                  }}
                />
              ))}
            </>
          )}

          {/* SVG Logo */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full drop-shadow-2xl"
          >
            {/* Box Background - Fades in at burst */}
            <rect
              width="24"
              height="24"
              rx="6"
              fill="url(#splash-grad)"
              className={`transition-all duration-700 ${
                stage === "burst" ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
              style={{ transformOrigin: "center" }}
            />

            {/* Document Path - Draws itself */}
            <path
              d="M6 3h8.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V21a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"
              stroke={stage === "burst" ? "rgba(255,255,255,0.8)" : "#6366f1"}
              strokeWidth="1"
              strokeLinecap="round"
              fill={stage === "burst" ? "rgba(255,255,255,0.15)" : "transparent"}
              className="transition-colors duration-500"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: stage === "drawing" ? 100 : 0,
                transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), fill 0.5s ease 1.5s",
              }}
            />

            {/* Folded corner */}
            <path
              d="M14 3v5a1 1 0 001 1h5"
              stroke={stage === "burst" ? "rgba(255,255,255,0.6)" : "#818cf8"}
              strokeWidth="1"
              strokeLinecap="round"
              className="transition-colors duration-500 delay-300"
              style={{
                strokeDasharray: 20,
                strokeDashoffset: stage === "drawing" ? 20 : 0,
                transition: "stroke-dashoffset 1s ease 0.5s",
              }}
            />

            {/* Code brackets - Pop in at burst */}
            <g
              className={`transition-all duration-500 transform origin-center ${
                stage === "burst" ? "opacity-100 scale-100" : "opacity-0 scale-50"
              }`}
            >
              <path
                d="M10 12L7.5 15L10 18"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 12L16.5 15L14 18"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            <defs>
              <linearGradient
                id="splash-grad"
                x1="0"
                y1="0"
                x2="24"
                y2="24"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#6366f1" />
                <stop offset="0.5" stopColor="#a855f7" />
                <stop offset="1" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Text */}
        <div className="overflow-hidden h-10 flex items-center">
          <span
            className={`text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 via-indigo-200 to-zinc-400 bg-clip-text text-transparent transform transition-all duration-700 ${
              stage === "burst" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            SkillVitae
          </span>
        </div>
      </div>
      
      {/* Required keyframe added inline for portability or global */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes splash-particle {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(var(--distance)) scale(0);
            opacity: 0;
          }
        }
      `}} />
    </div>
  );
}
