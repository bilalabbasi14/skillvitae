export interface CVPersonal {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface CVSkill {
  name: string;
  level: "advanced" | "proficient" | "familiar" | "beginner";
  source: "github" | "linkedin" | "manual";
  category?: string;
}

export interface CVProject {
  name: string;
  cv_title: string;
  description: string;
  tech: string[];
  repo_url: string;
  highlights: string[];
}

export interface CVExperience {
  company: string;
  role: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface CVEducation {
  institution: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  gpa: string;
}

export interface CVCertification {
  name: string;
  issuer: string;
  date: string;
}

export interface CVLanguage {
  name: string;
  level: string;
}

export interface CVData {
  personal: CVPersonal;
  skills: CVSkill[];
  projects: CVProject[];
  experience: CVExperience[];
  education: CVEducation[];
  certifications: CVCertification[];
  languages: CVLanguage[];
}

const LEVEL_WEIGHTS = {
  advanced: 4,
  proficient: 3,
  familiar: 2,
  beginner: 1,
};

export function flattenToResumeMode(cv: unknown): CVData {
  if (!validateCVShape(cv)) {
    throw new Error("Invalid CV shape");
  }
  const typedCV = cv as CVData;

  // Sort skills by proficiency level first, then take the top 24
  const sortedSkills = [...typedCV.skills].sort((a, b) => {
    const wA = LEVEL_WEIGHTS[a.level] || 0;
    const wB = LEVEL_WEIGHTS[b.level] || 0;
    return wB - wA;
  });

  // Limit projects to top 3
  const slicedProjects = typedCV.projects.slice(0, 3);

  // Truncate summary to 2-3 sentences if it exists
  let condensedSummary = typedCV.personal.summary || "";
  const sentences = condensedSummary.split(/(?<=[.!?])\s+/);
  if (sentences.length > 3) {
    condensedSummary = sentences.slice(0, 3).join(" ");
  }

  return {
    ...typedCV,
    personal: {
      ...typedCV.personal,
      summary: condensedSummary,
    },
    skills: sortedSkills.slice(0, 24),
    projects: slicedProjects,
  };
}

export function flattenToCVMode(cv: unknown): CVData {
  if (!validateCVShape(cv)) {
    throw new Error("Invalid CV shape");
  }
  return cv as CVData;
}

export function validateCVShape(cv: unknown): boolean {
  if (!cv || typeof cv !== "object") return false;
  const typed = cv as Record<string, unknown>;

  // Check top-level structures
  if (!typed.personal || typeof typed.personal !== "object") return false;
  if (!Array.isArray(typed.skills)) return false;
  if (!Array.isArray(typed.projects)) return false;
  if (!Array.isArray(typed.experience)) return false;
  if (!Array.isArray(typed.education)) return false;
  if (!Array.isArray(typed.certifications)) return false;
  if (!Array.isArray(typed.languages)) return false;

  // Check personal sub-structure
  const personal = typed.personal as Record<string, unknown>;
  const personalKeys = ["name", "email", "phone", "location", "linkedin", "github", "summary"];
  for (const key of personalKeys) {
    if (typeof personal[key] !== "string" && personal[key] !== undefined) return false;
  }

  return true;
}

