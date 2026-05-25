export async function callGemini(_prompt: string): Promise<string> {
  throw new Error("callGemini not implemented");
}

export async function callGroq(_prompt: string): Promise<string> {
  throw new Error("callGroq not implemented");
}

export async function callOpenRouter(_prompt: string): Promise<string> {
  throw new Error("callOpenRouter not implemented");
}

export async function callWithFallback(
  _prompt: string,
  _primary: "groq" | "gemini" = "groq"
): Promise<string> {
  throw new Error("callWithFallback not implemented");
}
