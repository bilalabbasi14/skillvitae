"use client";

interface TemplateSelectorProps {
  mode: "resume" | "cv";
  template: "ats-safe" | "classic" | "minimal";
  onChangeMode: (mode: "resume" | "cv") => void;
  onChangeTemplate: (template: "ats-safe" | "classic" | "minimal") => void;
}

export default function TemplateSelector({
  mode,
  template,
  onChangeMode,
  onChangeTemplate,
}: TemplateSelectorProps) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 backdrop-blur-xl shadow-lg space-y-4">
      {/* Resume vs CV Toggle */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Output Mode
        </label>
        <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => onChangeMode("resume")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "resume"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Resume (Strict 1 Page)
          </button>
          <button
            type="button"
            onClick={() => onChangeMode("cv")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "cv"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            CV (Comprehensive)
          </button>
        </div>
        <p className="text-[10px] text-zinc-500 mt-1.5 leading-normal">
          {mode === "resume"
            ? "Enforces a strict 1-page layout, trimes skills to top 8, projects to top 3, and flags height overflows."
            : "No length restrictions. Displays all projects, full list of skills, and complete profile summaries."}
        </p>
      </div>

      {/* Template Selectors */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Design Template
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onChangeTemplate("ats-safe")}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
              template === "ats-safe"
                ? "border-indigo-500 bg-indigo-500/5 text-zinc-100"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            <span className="text-xs font-bold">ATS-Safe</span>
            <span className="text-[8px] text-zinc-500 mt-0.5">High Compliance</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTemplate("classic")}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
              template === "classic"
                ? "border-indigo-500 bg-indigo-500/5 text-zinc-100"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            <span className="text-xs font-bold">Classic</span>
            <span className="text-[8px] text-zinc-500 mt-0.5">Human Standard</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTemplate("minimal")}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
              template === "minimal"
                ? "border-indigo-500 bg-indigo-500/5 text-zinc-100"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            <span className="text-xs font-bold">Minimal</span>
            <span className="text-[8px] text-zinc-500 mt-0.5">Sleek & Clean</span>
          </button>
        </div>

        <div className="mt-2 text-[10px] text-zinc-500 leading-normal pl-0.5">
          {template === "ats-safe" && (
            <span className="text-emerald-400">✓ Enforces: single-column layout, no tables, no images, standard Arial font. Best for automatic parsers.</span>
          )}
          {template === "classic" && (
            <span>Enforces: dual-column details section, serif fonts (Times New Roman), elegant sidebar layout. Recommended for direct email applications.</span>
          )}
          {template === "minimal" && (
            <span>Enforces: ample margin space, Calibri font, clean lines, compact grid lists. Good for design, product, or creative roles.</span>
          )}
        </div>
      </div>
    </div>
  );
}
