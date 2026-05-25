"use client";

import { CVSkill } from "../../lib/cv-utils";

interface SkillTagProps {
  skill: CVSkill;
  onUpdateLevel: (newLevel: "advanced" | "proficient" | "familiar" | "beginner") => void;
  onRemove: () => void;
}

const LEVEL_COLORS = {
  advanced: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20",
  proficient: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
  familiar: "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
  beginner: "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700",
};

const LEVELS: ("advanced" | "proficient" | "familiar" | "beginner")[] = [
  "beginner",
  "familiar",
  "proficient",
  "advanced",
];

export default function SkillTag({ skill, onUpdateLevel, onRemove }: SkillTagProps) {
  const cycleLevel = () => {
    const currentIndex = LEVELS.indexOf(skill.level);
    const nextIndex = (currentIndex + 1) % LEVELS.length;
    onUpdateLevel(LEVELS[nextIndex]);
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all select-none cursor-pointer ${
        LEVEL_COLORS[skill.level] || LEVEL_COLORS.beginner
      }`}
    >
      <span onClick={cycleLevel} className="capitalize">
        {skill.name} • {skill.level}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-zinc-500 hover:text-red-400 font-bold ml-1 text-[10px] w-3 h-3 flex items-center justify-center rounded-full hover:bg-zinc-950/20"
      >
        ×
      </button>
    </span>
  );
}
