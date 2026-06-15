import { NextResponse } from "next/server";
import { callWithFallback } from "../../../lib/ai-clients";

export async function POST(request: Request) {
  try {
    const { baseCV, jobDescriptionText } = await request.json();
    if (!baseCV || !jobDescriptionText) {
      return NextResponse.json({ error: "Missing baseCV or jobDescriptionText" }, { status: 400 });
    }

    const prompt = `You are an expert resume builder and ATS optimizer.
Take this base CV JSON and align/tailor it to the following Job Description (JD).

Base CV JSON:
${JSON.stringify(baseCV, null, 2)}

Job Description:
${jobDescriptionText}

Your task:
1. Tailor the CV: Reorder and prioritize skills matching the JD. Reword bullet points in Experience and Projects to naturally include keywords from the JD without lying. Keep project 'cv_title' strictly to the clean project/product name. Do NOT append roles like 'Contributor', 'Developer', or extra slogans at the end. Write a brand new targeted profile summary. Keep all personal details (name, email, phone, location, linkedin, github) exactly as they are in the Base CV; do not modify or replace them with placeholder text. DO NOT use markdown bold markers (e.g., "**keyword**" or "__keyword__") or asterisks anywhere in the generated summary, bullets, description, or other text fields to highlight tailored terms. Output everything as clean, plain text.
2. Perform keyword gap analysis: Extract keywords present in both (matched), keywords in JD but missing in CV (missing), and suggest 2-3 rewrites for existing bullet points in the CV to incorporate some missing keywords naturally.
3. Make a condensed Resume version (1 page): Select top 3 projects, top 24 skills (grouped by category), and a 2-line summary.
4. Detect the role type: Classify as "industry" (default, e.g. corporate, software developer) or "academic" (e.g. research, academic position).
5. Score the match: Provide a rough AI percentage score (0-100) representing how well the candidate aligns with the JD.

Return ONLY valid JSON matching this exact structure, with no markdown fences, no preamble, and no explanation:
{
  "tailored_cv": {
    // Complete CV JSON matching the base CV schema, with reordered/updated items
    "personal": {
      "name": "User's name",
      "email": "Email",
      "phone": "Phone",
      "location": "Location",
      "linkedin": "LinkedIn link",
      "github": "GitHub link",
      "summary": "New targeted summary matching the JD"
    },
    "skills": [
      { "name": "React.js", "level": "advanced", "source": "github", "category": "Frontend" }
    ],
    "projects": [
      {
        "name": "name",
        "cv_title": "title",
        "description": "description",
        "tech": ["React.js"],
        "repo_url": "link",
        "highlights": ["highlights updated to match keywords"]
      }
    ],
    "experience": [
      {
        "company": "Company",
        "role": "Role",
        "start": "Jan 2020",
        "end": "Present",
        "bullets": ["bullets reworded for keywords"]
      }
    ],
    "education": [
      {
        "institution": "Institution",
        "degree": "Degree",
        "field": "Field",
        "start": "YYYY",
        "end": "YYYY",
        "gpa": "GPA"
      }
    ],
    "certifications": [{ "name": "Name", "issuer": "Issuer", "date": "Date" }],
    "languages": [{ "name": "Language", "level": "Level" }]
  },
  "ats_keywords": {
    "matched": ["React.js", "Node.js"],
    "missing": ["CI/CD", "Agile", "Jest"],
    "suggested_rewrites": [
      {
        "original": "Built authentication system",
        "rewritten": "Implemented JWT-based authentication with role-based access control, ensuring CI/CD safety"
      }
    ]
  },
  "resume_version": {
    "projects": [
      // Top 3 most relevant projects (objects from the projects array)
    ],
    "skills": [
      // Top 24 most relevant skills (objects from the skills array, each including category, name, level, source)
    ],
    "summary": "Condensed 2-line targeted summary"
  },
  "role_type": "industry", // "industry" or "academic"
  "match_score_ai": 75 // integer from 0 to 100
}
`;

    const rawResponse = await callWithFallback(prompt, "gemini");
    
    let cleanJsonText = rawResponse.trim();
    const firstBrace = cleanJsonText.indexOf("{");
    const lastBrace = cleanJsonText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanJsonText = cleanJsonText.substring(firstBrace, lastBrace + 1);
    }
    
    try {
      const parsedData = JSON.parse(cleanJsonText);
      return NextResponse.json(parsedData);
    } catch (jsonErr: unknown) {
      const msg = jsonErr instanceof Error ? jsonErr.message : String(jsonErr);
      console.error("Failed to parse JSON response from Tailor CV:", rawResponse);
      return NextResponse.json({
        error: "Failed to parse AI response as JSON",
        raw: rawResponse,
        details: msg
      }, { status: 500 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error in tailor-cv route:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
