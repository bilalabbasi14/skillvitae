type VersionSidebarProps = {
  count?: number;
};

export default function VersionSidebar({ count }: VersionSidebarProps) {
  return (
    <aside className="rounded border p-4">
      <h2 className="text-lg font-semibold">Versions</h2>
      <p className="mt-2 text-sm text-gray-600">
        {count ? `${count} saved versions` : "No saved versions yet."}
      </p>
    </aside>
  );
}
