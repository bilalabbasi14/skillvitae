import { NextResponse } from "next/server";
import { callWithFallback } from "../../../lib/ai-clients";

export async function POST(request: Request) {
  try {
    const { pdfText } = await request.json();
    if (!pdfText || typeof pdfText !== "string") {
      return NextResponse.json({ error: "Missing or invalid pdfText" }, { status: 400 });
    }

    const prompt = `Extract structured professional information from this LinkedIn profile export.
Return ONLY valid JSON, no markdown, no extra text. Fill in empty strings if information is not found.

Use this exact structure:
{
  "experience": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "start": "Mon YYYY (e.g. Jan 2020)",
      "end": "Mon YYYY or Present",
      "bullets": ["responsibility or achievement statement"]
    }
  ],
  "education": [
    {
      "institution": "Institution Name",
      "degree": "e.g. Bachelor of Science",
      "field": "e.g. Computer Science",
      "start": "YYYY",
      "end": "YYYY",
      "gpa": "e.g. 3.8/4.0 or empty"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Org",
      "date": "Mon YYYY or YYYY"
    }
  ],
  "languages": [
    {
      "name": "Language Name",
      "level": "e.g. Professional Working, Native, Professional, etc."
    }
  ],
  "volunteering": [
    {
      "org": "Organization Name",
      "role": "Volunteer Role",
      "dates": "e.g. 2019 - 2021"
    }
  ]
}

LinkedIn PDF text:
${pdfText}
`;

    const rawResponse = await callWithFallback(prompt, "groq");
    
    // Clean up potential markdown code fences from the AI output
    const cleanJsonText = rawResponse.replace(/```json|```/gi, "").trim();
    
    try {
      const parsedData = JSON.parse(cleanJsonText);
      return NextResponse.json(parsedData);
    } catch (jsonErr: unknown) {
      const msg = jsonErr instanceof Error ? jsonErr.message : String(jsonErr);
      console.error("Failed to parse JSON response from LinkedIn Parser:", rawResponse);
      return NextResponse.json({
        error: "Failed to parse AI response as JSON",
        raw: rawResponse,
        details: msg
      }, { status: 500 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error in parse-linkedin route:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
