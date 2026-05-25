type ExperienceEntryProps = {
  company?: string;
  role?: string;
};

export default function ExperienceEntry({ company, role }: ExperienceEntryProps) {
  return (
    <article className="rounded border p-4">
      <h3 className="text-base font-semibold">{role ?? "Role"}</h3>
      <p className="text-sm text-gray-600">{company ?? "Company"}</p>
    </article>
  );
}
