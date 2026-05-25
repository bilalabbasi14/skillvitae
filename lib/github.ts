export function extractUsername(_url: string): string {
  throw new Error("extractUsername not implemented");
}

export async function fetchRepoList(_username: string) {
  throw new Error("fetchRepoList not implemented");
}

export function computeRepoScore(_repo: unknown): number {
  throw new Error("computeRepoScore not implemented");
}

export async function fetchReadme(_username: string, _repoName: string) {
  throw new Error("fetchReadme not implemented");
}

export async function fetchPackageFile(_username: string, _repoName: string) {
  throw new Error("fetchPackageFile not implemented");
}

export function buildRepoSummary(
  _repo: unknown,
  _readmeSnippet: string,
  _dependencies: string[]
) {
  throw new Error("buildRepoSummary not implemented");
}

export async function fetchSelectedRepoDetails(
  _username: string,
  _selectedRepoNames: string[]
) {
  throw new Error("fetchSelectedRepoDetails not implemented");
}

export function inferProficiency(_skillName: string, _repoSummaries: unknown[]): string {
  throw new Error("inferProficiency not implemented");
}
