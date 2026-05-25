type CVPreviewProps = {
  title?: string;
};

export default function CVPreview({ title }: CVPreviewProps) {
  return (
    <section className="rounded border p-4">
      <h2 className="text-lg font-semibold">{title ?? "Preview"}</h2>
      <p className="mt-2 text-sm text-gray-600">TODO: Render live preview.</p>
    </section>
  );
}
