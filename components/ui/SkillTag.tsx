type SkillTagProps = {
  name?: string;
  level?: string;
};

export default function SkillTag({ name, level }: SkillTagProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
      <span>{name ?? "Skill"}</span>
      <span className="text-xs text-gray-500">{level ?? "level"}</span>
    </span>
  );
}
