type ATSScorePanelProps = {
  score?: number;
};

export default function ATSScorePanel({ score }: ATSScorePanelProps) {
  return (
    <section className="rounded border p-4">
      <h2 className="text-lg font-semibold">ATS Score</h2>
      <p className="mt-2 text-sm text-gray-600">
        {score === undefined ? "No score yet." : `${score} / 100`}
      </p>
    </section>
  );
}
