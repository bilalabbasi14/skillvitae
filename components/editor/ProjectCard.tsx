type ProjectCardProps = {
  name?: string;
};

export default function ProjectCard({ name }: ProjectCardProps) {
  return (
    <article className="rounded border p-4">
      <h3 className="text-base font-semibold">{name ?? "Project"}</h3>
      <p className="text-sm text-gray-600">TODO: Render project details.</p>
    </article>
  );
}
