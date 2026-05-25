type TemplateSelectorProps = {
  selected?: string;
};

export default function TemplateSelector({ selected }: TemplateSelectorProps) {
  return (
    <section className="rounded border p-4">
      <h2 className="text-lg font-semibold">Template</h2>
      <p className="mt-2 text-sm text-gray-600">
        {selected ? `Selected: ${selected}` : "No template selected yet."}
      </p>
    </section>
  );
}
