import { NextResponse } from "next/server";
import { callWithFallback } from "../../../lib/ai-clients";

export async function POST(request: Request) {
  try {
    const { repoSummaries } = await request.json();
    if (!repoSummaries || !Array.isArray(repoSummaries)) {
      return NextResponse.json({ error: "Missing or invalid repoSummaries" }, { status: 400 });
    }

    const prompt = `You are analyzing a developer's GitHub repositories to extract CV-relevant information.
Here are their repositories as structured JSON:
${JSON.stringify(repoSummaries, null, 2)}

Return ONLY valid JSON with no markdown, no preamble, no explanation. Use this exact structure:
{
  "projects": [
    {
      "repo_name": "exact repo name from input",
      "cv_title": "professional title for CV",
      "cv_description": "one professional sentence describing what it does and why it matters",
      "highlights": [
        "achievement bullet 1 (e.g. Optimized database queries reducing load times by 30%)",
        "achievement bullet 2",
        "achievement bullet 3"
      ],
      "tech": ["Technology1", "Technology2"]
    }
  ]
}

Write a project entry for every repo in the input — the user already selected these intentionally.
Write highlights as achievement statements, not task lists. Incorporate metrics or impact if possible.
Avoid generic or overused words like "leveraged", "utilized", "spearheaded".
`;

    const rawResponse = await callWithFallback(prompt, "gemini");
    
    // Clean up potential markdown code fences from the AI output
    const cleanJsonText = rawResponse.replace(/```json|```/gi, "").trim();
    
    try {
      const parsedData = JSON.parse(cleanJsonText);
      return NextResponse.json(parsedData);
    } catch (jsonErr: unknown) {
      const msg = jsonErr instanceof Error ? jsonErr.message : String(jsonErr);
      console.error("Failed to parse JSON response from Gemini:", rawResponse);
      return NextResponse.json({
        error: "Failed to parse AI response as JSON",
        raw: rawResponse,
        details: msg
      }, { status: 500 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error in analyze-github route:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

