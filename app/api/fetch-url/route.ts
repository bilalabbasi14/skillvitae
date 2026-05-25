import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ success: false, error: "Missing or invalid URL" }, { status: 400 });
    }

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        next: { revalidate: 3600 }, // Cache results for 1 hour if Next.js caching is active
      });

      if (!res.ok) {
        return NextResponse.json({
          success: false,
          error: `Failed to fetch URL. HTTP status ${res.status}: ${res.statusText}`,
        });
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      // Remove script elements, style tags, and other navigation chrome
      $("script, style, svg, nav, footer, header, iframe, input, button, noscript, head, link, meta").remove();

      const pageText = $("body").text();
      const cleanedText = pageText
        .replace(/\s+/g, " ") // Collapse whitespaces
        .trim();

      if (!cleanedText) {
        return NextResponse.json({
          success: false,
          error: "Fetched page returned empty text content.",
        });
      }

      return NextResponse.json({
        success: true,
        text: cleanedText,
      });
    } catch (fetchErr: unknown) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      return NextResponse.json({
        success: false,
        error: `Network error: ${msg}`,
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error in fetch-url route:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
