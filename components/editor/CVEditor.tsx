type CVEditorProps = {
  title?: string;
};

export default function CVEditor({ title }: CVEditorProps) {
  return (
    <section className="rounded border p-4">
      <h2 className="text-lg font-semibold">{title ?? "CV Editor"}</h2>
      <p className="mt-2 text-sm text-gray-600">TODO: Build editor fields.</p>
    </section>
  );
}
