"use client";

import { GitHubRepo } from "../lib/github";

interface RepoSelectionCardProps {
  repo: GitHubRepo;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
}

export default function RepoSelectionCard({
  repo,
  isChecked,
  onChange,
  disabled,
}: RepoSelectionCardProps) {
  const formattedDate = new Date(repo.updated_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <label
      className={`relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
        isChecked
          ? "border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/5"
          : "border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40"
      } ${repo.fork ? "opacity-60 hover:opacity-80" : ""}`}
    >
      {/* Checkbox placement */}
      <div className="flex items-center h-5 mt-0.5">
        <input
          type="checkbox"
          checked={isChecked}
          disabled={disabled && !isChecked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <h3 className="text-sm font-bold text-zinc-100 truncate max-w-[200px] sm:max-w-[280px]">
            {repo.name}
          </h3>
          
          {/* Fork badge */}
          {repo.fork && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
              <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742L12 8.562l3.316 2.18m0 0a3 3 0 101.367-5.543 3 3 0 00-1.367 5.543zM12 8.562v10m0 0a3 3 0 101.996-2.829M12 18.562a3 3 0 11-1.996-2.83" />
              </svg>
              Fork
            </span>
          )}
        </div>

        {/* Repo Description */}
        <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-normal min-h-[32px]">
          {repo.description || "No description provided."}
        </p>

        {/* Repo Metadata */}
        <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-medium">
          {repo.language && (
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500/80" />
              {repo.language}
            </span>
          )}

          <span className="flex items-center gap-0.5">
            <svg className="h-3.5 w-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {repo.stargazers_count}
          </span>

          <span className="ml-auto">Updated {formattedDate}</span>
        </div>
      </div>
    </label>
  );
}
