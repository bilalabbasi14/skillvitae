export async function extractPdfText(file: File): Promise<string> {
  if (typeof window === "undefined") return "";

  try {
    // Dynamic import to bypass Next.js SSR build issues with pdfjs-dist Node dependencies
    const pdfjsLib = await import("pdfjs-dist");
    
    // Set worker source to matched version CDN via jsDelivr npm mirror
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || "")
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (err) {
    console.error("Error extracting text from PDF:", err);
    throw new Error("Failed to parse PDF file. Please verify it is a valid LinkedIn export.");
  }
}

