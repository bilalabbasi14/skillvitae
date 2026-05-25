const STOPWORDS = new Set([
  "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot",
  "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each",
  "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd",
  "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd",
  "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "its", "itself", "let's", "me", "more", "most",
  "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should",
  "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
  "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through",
  "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "weren't",
  "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's",
  "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
  "yourselves", "the", "will", "shall", "using", "experience", "work", "team", "development", "developer", "engineering",
  "required", "preferred", "role", "job", "responsibilities", "requirements", "candidate", "successful", "ideal",
  "skills", "ability", "duties", "qualifications", "strong", "excellent", "years", "knowledge", "working", "looking"
]);

export function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Split by whitespace and common punctuation, retaining tech characters like C++, .NET, C#, CI/CD
  const words = text.match(/[a-zA-Z0-9+#./-]{2,}/g) || [];
  const uniqueKeywords = new Set<string>();

  for (const word of words) {
    let clean = word.trim()
      .replace(/[.,;:!?)]$/, "") // remove trailing punctuation
      .replace(/^[(]/, "")       // remove leading punctuation
      .toLowerCase();

    // Skip empty, pure numbers, or stopwords
    if (!clean || /^\d+$/.test(clean) || STOPWORDS.has(clean)) {
      continue;
    }
    
    uniqueKeywords.add(clean);
  }

  return Array.from(uniqueKeywords);
}

export function flattenCVToText(cv: unknown): string {
  if (!cv) return "";
  
  function flatten(val: unknown): string {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
    if (Array.isArray(val)) {
      return val.map(flatten).join(" ");
    }
    if (typeof val === "object") {
      return Object.values(val as Record<string, unknown>).map(flatten).join(" ");
    }
    return "";
  }

  return flatten(cv);
}

export function checkDateConsistency(cv: unknown): boolean {
  if (!cv || typeof cv !== "object") return true;
  const typed = cv as Record<string, unknown>;
  const dates: string[] = [];

  if (Array.isArray(typed.experience)) {
    for (const exp of typed.experience) {
      if (exp?.start) dates.push(String(exp.start).trim());
      if (exp?.end) dates.push(String(exp.end).trim());
    }
  }

  if (Array.isArray(typed.education)) {
    for (const edu of typed.education) {
      if (edu?.start) dates.push(String(edu.start).trim());
      if (edu?.end) dates.push(String(edu.end).trim());
    }
  }

  const activeDates = dates.filter(d => d && d.toLowerCase() !== "present");
  if (activeDates.length === 0) return true;

  // Patterns:
  // Month Year: "Jan 2023", "January 2023"
  const isMonthYear = (d: string) => /^[a-zA-Z]+\s+\d{4}$/.test(d);
  // Year only: "2023"
  const isYearOnly = (d: string) => /^\d{4}$/.test(d);
  // Slash or dash: "01/2023", "2023-01"
  const isSlashDate = (d: string) => /^\d{1,2}[\/-]\d{2,4}$/.test(d);

  let monthYearCount = 0;
  let yearOnlyCount = 0;
  let slashCount = 0;

  for (const d of activeDates) {
    if (isMonthYear(d)) monthYearCount++;
    else if (isYearOnly(d)) yearOnlyCount++;
    else if (isSlashDate(d)) slashCount++;
  }

  const total = activeDates.length;
  return monthYearCount === total || yearOnlyCount === total || slashCount === total;
}

export function extractAllBullets(cv: unknown): string[] {
  if (!cv || typeof cv !== "object") return [];
  const typed = cv as Record<string, unknown>;
  const bullets: string[] = [];

  if (Array.isArray(typed.experience)) {
    for (const exp of typed.experience) {
      if (Array.isArray(exp?.bullets)) {
        bullets.push(...exp.bullets.map((b: any) => String(b)));
      }
    }
  }

  if (Array.isArray(typed.projects)) {
    for (const proj of typed.projects) {
      if (Array.isArray(proj?.highlights)) {
        bullets.push(...proj.highlights.map((h: any) => String(h)));
      }
    }
  }

  return bullets;
}

export function computeATSScore(cv: unknown, jdText: string): number {
  if (!cv || !jdText) return 0;

  const jdKeywords = extractKeywords(jdText);
  if (jdKeywords.length === 0) return 0;

  const cvText = flattenCVToText(cv);
  const cvTextLower = cvText.toLowerCase();

  // 1. Keyword score (50% weight)
  const matched = jdKeywords.filter(word => cvTextLower.includes(word.toLowerCase()));
  const keywordScore = (matched.length / jdKeywords.length) * 100;

  // 2. Section score (20% weight)
  // Look for section headers or descriptions
  const hasWorkExperience = cvTextLower.includes("experience") || cvTextLower.includes("employment") || cvTextLower.includes("history");
  const hasEducation = cvTextLower.includes("education") || cvTextLower.includes("academic") || cvTextLower.includes("university") || cvTextLower.includes("college");
  const hasSkills = cvTextLower.includes("skills") || cvTextLower.includes("technologies") || cvTextLower.includes("expertise");

  let sectionMatchCount = 0;
  if (hasWorkExperience) sectionMatchCount++;
  if (hasEducation) sectionMatchCount++;
  if (hasSkills) sectionMatchCount++;
  const sectionScore = (sectionMatchCount / 3) * 100;

  // 3. Date consistency score (10% weight)
  const dateScore = checkDateConsistency(cv) ? 100 : 60;

  // 4. Measurable achievement score (20% weight)
  const bullets = extractAllBullets(cv);
  const measuredBullets = bullets.filter(b => /\d/.test(b));
  const achievementScore = bullets.length > 0 
    ? Math.min((measuredBullets.length / bullets.length) * 100, 100)
    : 0;

  return Math.round(
    keywordScore * 0.50 +
    sectionScore * 0.20 +
    dateScore * 0.10 +
    achievementScore * 0.20
  );
}

