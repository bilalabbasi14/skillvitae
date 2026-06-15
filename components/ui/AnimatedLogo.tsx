"use client";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { wrapper: "h-7 w-7", icon: 14 },
  md: { wrapper: "h-9 w-9", icon: 18 },
  lg: { wrapper: "h-12 w-12", icon: 24 },
  xl: { wrapper: "h-16 w-16", icon: 32 },
};

export default function AnimatedLogo({
  size = "md",
  animate = true,
  className = "",
}: AnimatedLogoProps) {
  const s = sizeMap[size];

  return (
    <div
      className={`${s.wrapper} relative group cursor-pointer ${className}`}
      title="SkillVitae"
    >
      {/* Glow behind */}
      {animate && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500 animate-pulse-glow" />
      )}

      {/* Main container */}
      <div className="relative h-full w-full rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105">
        {/* Shimmer overlay */}
        {animate && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.5s linear infinite",
            }}
          />
        )}

        {/* SVG Icon: Document with code bracket */}
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 24 24"
          fill="none"
          className="relative z-10 drop-shadow-sm"
        >
          {/* Document shape */}
          <path
            d="M6 2h8.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V20a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
            fill="rgba(255,255,255,0.15)"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Folded corner */}
          <path
            d="M14 2v5a1 1 0 001 1h5"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Code brackets */}
          <path
            d="M10 11L7.5 14L10 17"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 11L16.5 14L14 17"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
