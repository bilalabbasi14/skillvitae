import { NextResponse } from "next/server";
import { callWithFallback } from "../../../lib/ai-clients";

export async function POST(request: Request) {
  try {
    const { githubAnalysis, linkedinData, userAnswers, skills } = await request.json();

    const prompt = `Assemble a complete structured CV JSON by combining a user's GitHub repository analysis, LinkedIn profile data, custom profile entries, and pre-computed skills list.

Here is the input data:
1. GitHub Analysis (Projects):
${JSON.stringify(githubAnalysis || {}, null, 2)}

2. LinkedIn Profile Data (Experience, Education, Certifications, Languages, Volunteering):
${JSON.stringify(linkedinData || {}, null, 2)}

3. User Answers & Personal Info (Target role, contact details, custom summary):
${JSON.stringify(userAnswers || {}, null, 2)}

4. Pre-computed Skills:
${JSON.stringify(skills || [], null, 2)}

Your task is to merge and polish this data into a professional CV.
Key Requirements:
- Write a professional summary paragraph (in "personal.summary") targeted at the target role: "${userAnswers?.targetRole || 'Software Engineer'}". Make it 3-4 sentences, concise, and impact-oriented.
- Ensure all project descriptions (from GitHub Analysis) sound natural, technical, and human (not AI-generated). Preserve the repository titles, URLs, highlights, and tech stacks.
- Ensure all experience bullet points are written as impact statements (Action + Context + Result) if possible. Avoid generic resume phrases and words like "leveraged", "utilized", "spearheaded", "passionate", "detail-oriented".
- Format all dates in Experience and Education consistently (e.g., "Jan 2023" or "2023").
- Extract ALL skills comprehensively from the projects (descriptions, highlights, tech), work experiences, and pre-computed raw skills. Do not just output the few raw dependencies. Extract languages, frameworks, libraries, tools, database engines, mobile SDKs, design tools, testing methodologies, and architectural concepts mentioned or inferred.
- Categorize each skill into one of these standard categories in the "category" field:
  * "Languages" (e.g. JavaScript, Kotlin, Java, Python, C/C++, PHP, SQL, HTML, CSS, TypeScript)
  * "Frontend" (e.g. React.js, Next.js, HTML5, CSS3, Tailwind CSS, XML (Android UI))
  * "Backend" (e.g. Node.js, Express.js, REST APIs, FastAPI, scikit-learn)
  * "Databases" (e.g. MySQL, PostgreSQL, Supabase, Firebase Realtime DB, SQLite)
  * "Mobile" (e.g. Android (Kotlin/XML), Jetpack compose, Retrofit, Agora SDK)
  * "Design & Prototyping" (e.g. Figma (UI/UX design, wireframing, prototyping))
  * "Tools" (e.g. Git, GitHub, Firebase, Docker, Web Push API, Google Classroom API, Vercel, Clever Cloud, Streamlit)
  * "Testing" (e.g. Black-Box & White-Box Testing, Unit Testing with JUnit, Jest, Cypress)
  * "Concepts" (e.g. Offline-first architecture, PWA, API design, version control, real-time sync, AI/ML, OOP, Data Structures, ML pipelines, ensemble methods, NLP, Agile Methodology, system system, software architecture)
- Return ONLY valid JSON matching this exact schema, with no markdown fences, no preamble, and no explanation:
{
  "personal": {
    "name": "User's full name",
    "email": "Email address",
    "phone": "Phone number",
    "location": "Location (City, Country/State)",
    "linkedin": "LinkedIn profile URL",
    "github": "GitHub profile URL",
    "summary": "Targeted professional summary"
  },
  "skills": [
    { "name": "React.js", "level": "advanced", "source": "github", "category": "Frontend" }
  ],
  "projects": [
    {
      "name": "exact repo name",
      "cv_title": "professional title for CV",
      "description": "one professional sentence describing what it does and why it matters",
      "tech": ["React.js", "TypeScript"],
      "repo_url": "URL to the repository",
      "highlights": ["achievement bullet 1", "achievement bullet 2"]
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "start": "Mon YYYY",
      "end": "Mon YYYY or Present",
      "bullets": ["quantified achievement statement", "responsibility statement"]
    }
  ],
  "education": [
    {
      "institution": "Institution Name",
      "degree": "Degree (e.g. BS)",
      "field": "Field of Study",
      "start": "YYYY",
      "end": "YYYY",
      "gpa": "GPA or empty string"
    }
  ],
  "certifications": [
    { "name": "Cert Name", "issuer": "Issuer", "date": "Date" }
  ],
  "languages": [
    { "name": "Language", "level": "Proficiency level" }
  ]
}
`;

    const rawResponse = await callWithFallback(prompt, "gemini");
    
    // Clean up potential markdown code fences from the AI output
    const cleanJsonText = rawResponse.replace(/```json|```/gi, "").trim();
    
    try {
      const parsedData = JSON.parse(cleanJsonText);
      return NextResponse.json(parsedData);
    } catch (jsonErr: unknown) {
      const msg = jsonErr instanceof Error ? jsonErr.message : String(jsonErr);
      console.error("Failed to parse JSON response from Assemble CV:", rawResponse);
      return NextResponse.json({
        error: "Failed to parse AI response as JSON",
        raw: rawResponse,
        details: msg
      }, { status: 500 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error in assemble-cv route:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
