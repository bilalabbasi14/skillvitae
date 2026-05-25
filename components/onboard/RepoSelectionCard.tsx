type RepoSelectionCardProps = {
  name?: string;
  language?: string;
  stars?: number;
  isFork?: boolean;
};

export default function RepoSelectionCard({
  name,
  language,
  stars,
  isFork,
}: RepoSelectionCardProps) {
  return (
    <article className="rounded border p-4">
      <h3 className="text-base font-semibold">{name ?? "Repository"}</h3>
      <p className="text-sm text-gray-600">
        {language ?? "Language"} • {stars ?? 0} stars
      </p>
      {isFork ? (
        <p className="mt-2 text-xs text-gray-500">Fork</p>
      ) : null}
    </article>
  );
}
