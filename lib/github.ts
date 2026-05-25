export interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  fork: boolean;
  language: string | null;
  updated_at: string;
  html_url: string;
  topics?: string[];
}

export interface RepoSummary {
  name: string;
  primary_language: string | null;
  stars: number;
  is_fork: boolean;
  dependencies: string[];
  readme_snippet: string;
  topics: string[];
  html_url: string;
}

// Decodes base64 text robustly in both browser and Node.js
function decodeBase64(base64: string): string {
  try {
    const binaryString = atob(base64.replace(/\s/g, ""));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  } catch (err) {
    console.error("Base64 decode failed:", err);
    return "";
  }
}

export function extractUsername(url: string): string {
  const clean = url.trim().replace(/^https?:\/\//, "").replace(/^www\./, "");
  if (clean.startsWith("github.com/")) {
    const parts = clean.split("/");
    return parts[1] || "";
  }
  return clean.split("/")[0] || "";
}

export async function fetchRepoList(username: string, token?: string): Promise<GitHubRepo[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
    headers,
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 403 || res.status === 429) {
      throw new Error(`GitHub API rate limit exceeded (Status ${res.status}). Consider providing a GitHub token.`);
    }
    throw new Error(`Failed to fetch GitHub repositories: ${errText || res.statusText}`);
  }

  const data = await res.json();
  return data as GitHubRepo[];
}

export function computeRepoScore(repo: GitHubRepo): number {
  return (
    repo.stargazers_count * 2 +
    (repo.description ? 1 : 0) +
    (!repo.fork ? 2 : 0)
  );
}

export async function fetchReadme(username: string, repoName: string, token?: string): Promise<string> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${username}/${repoName}/readme`, { headers });
    if (!res.ok) return "";
    const data = await res.json();
    const contentBase64 = data.content;
    if (!contentBase64) return "";
    const decoded = decodeBase64(contentBase64);
    return decoded.slice(0, 150);
  } catch (err) {
    console.warn(`Failed to fetch README for ${repoName}:`, err);
    return "";
  }
}

function parsePackageJson(content: string): string[] {
  try {
    const json = JSON.parse(content);
    const deps = Object.keys(json.dependencies || {});
    const devDeps = Object.keys(json.devDependencies || {});
    return Array.from(new Set([...deps, ...devDeps])).map(d => d.toLowerCase());
  } catch {
    return [];
  }
}

function parseRequirementsTxt(content: string): string[] {
  const deps: string[] = [];
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.startsWith("#")) continue;
    // Extract library name before any version specifiers
    const match = cleanLine.split(/[=<>~@]/)[0].trim().toLowerCase();
    if (match) {
      deps.push(match);
    }
  }
  return deps;
}

function parseGradleDependencies(content: string): string[] {
  const deps: string[] = [];
  const regex = /(?:implementation|api|compile|testImplementation)\s*(?:\(?)\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const depStr = match[1];
    if (depStr.startsWith(":")) continue; // ignore local project dependencies
    const parts = depStr.split(":");
    if (parts.length >= 2) {
      // org.jetbrains.kotlin:kotlin-stdlib -> kotlin-stdlib
      deps.push(parts[1].toLowerCase());
    } else {
      deps.push(depStr.toLowerCase());
    }
  }
  return deps;
}

export async function fetchPackageFile(username: string, repoName: string, token?: string): Promise<string[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  const filesToTry = [
    { path: "package.json", parser: parsePackageJson },
    { path: "requirements.txt", parser: parseRequirementsTxt },
    { path: "build.gradle", parser: parseGradleDependencies },
  ];

  for (const file of filesToTry) {
    try {
      const res = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${file.path}`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        const contentBase64 = data.content;
        if (contentBase64) {
          const decoded = decodeBase64(contentBase64);
          const parsed = file.parser(decoded);
          if (parsed.length > 0) return parsed;
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch/parse ${file.path} for ${repoName}:`, err);
    }
  }

  return [];
}

export function buildRepoSummary(
  repo: GitHubRepo,
  readmeSnippet: string,
  dependencies: string[]
): RepoSummary {
  return {
    name: repo.name,
    primary_language: repo.language,
    stars: repo.stargazers_count,
    is_fork: repo.fork,
    dependencies,
    readme_snippet: readmeSnippet,
    topics: repo.topics || [],
    html_url: repo.html_url,
  };
}

export async function fetchSelectedRepoDetails(
  username: string,
  selectedRepoNames: string[],
  token?: string
): Promise<RepoSummary[]> {
  const repos = await fetchRepoList(username, token);
  const selectedRepos = repos.filter(r => selectedRepoNames.includes(r.name));

  const promises = selectedRepos.map(async repo => {
    const [readme, dependencies] = await Promise.all([
      fetchReadme(username, repo.name, token),
      fetchPackageFile(username, repo.name, token),
    ]);
    return buildRepoSummary(repo, readme, dependencies);
  });

  return Promise.all(promises);
}

export function inferProficiency(skillName: string, repoSummaries: RepoSummary[]): "advanced" | "proficient" | "familiar" | "beginner" {
  const target = skillName.toLowerCase();
  const count = repoSummaries.filter(r =>
    r.dependencies.includes(target) ||
    r.primary_language?.toLowerCase() === target ||
    r.topics.map(t => t.toLowerCase()).includes(target)
  ).length;

  if (count >= 4) return "advanced";
  if (count >= 2) return "proficient";
  if (count === 1) return "familiar";
  return "beginner";
}

