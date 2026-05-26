"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import jsPDF from "jspdf";
import { CVData } from "../../lib/cv-utils";

interface CVPreviewProps {
  cv: CVData;
  mode: "resume" | "cv";
  template: "ats-safe" | "classic" | "minimal";
  sectionOrder: string[];
}

export interface CVPreviewRef {
  downloadPDF: () => void;
}

const CVPreview = forwardRef<CVPreviewRef, CVPreviewProps>(function CVPreview(
  { cv, mode, template, sectionOrder },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Check if content overflows A4 proportions (aspect ratio ~1.414) in Resume Mode
  useEffect(() => {
    if (mode === "resume" && containerRef.current) {
      const el = containerRef.current;
      // Compare scrollHeight to clientHeight
      setIsOverflowing(el.scrollHeight > el.clientHeight + 5);
    } else {
      setIsOverflowing(false);
    }
  }, [cv, mode, template, sectionOrder]);

  // Programmatic text-selectable PDF generator
  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const printableWidth = pageWidth - 2 * margin; // 180mm
    let y = margin;

    // Font selection based on template
    const fontName = template === "classic" ? "times" : "helvetica";
    doc.setFont(fontName);

    const checkPageSpace = (heightNeeded: number) => {
      if (mode === "resume") return; // Single page only
      if (y + heightNeeded > pageHeight - margin) {
        doc.addPage();
        doc.setFont(fontName);
        y = margin;
      }
    };

    // --- Header Section ---
    const name = cv.personal?.name || "Name";
    doc.setFontSize(22);
    doc.setFont(fontName, "bold");
    if (template === "classic") {
      doc.text(name, pageWidth / 2, y, { align: "center" });
    } else {
      doc.text(name, margin, y);
    }
    y += 8;

    // Contact info
    const contacts = [
      cv.personal?.email,
      cv.personal?.phone,
      cv.personal?.location,
      cv.personal?.linkedin ? `LinkedIn: ${cv.personal.linkedin}` : "",
      cv.personal?.github ? `GitHub: ${cv.personal.github}` : "",
    ].filter(Boolean);

    doc.setFontSize(9);
    doc.setFont(fontName, "normal");
    const contactLine = contacts.join("  |  ");
    if (template === "classic") {
      doc.text(contactLine, pageWidth / 2, y, { align: "center" });
    } else {
      doc.text(contactLine, margin, y);
    }
    y += 10;

    // Divider line
    if (template !== "minimal") {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y - 5, pageWidth - margin, y - 5);
    }

    // --- Summary Section ---
    if (cv.personal?.summary) {
      checkPageSpace(15);
      doc.setFontSize(11);
      doc.setFont(fontName, "bold");
      doc.text(template === "ats-safe" ? "SUMMARY" : "Professional Summary", margin, y);
      y += 5;

      doc.setFontSize(9.5);
      doc.setFont(fontName, "normal");
      const summaryLines = doc.splitTextToSize(cv.personal.summary, printableWidth);
      const summaryHeight = summaryLines.length * 4.5;
      checkPageSpace(summaryHeight);
      doc.text(summaryLines, margin, y);
      y += summaryHeight + 8;
    }

    // --- Dynamic Section Rendering ---
    for (const sectionId of sectionOrder) {
      if (sectionId === "experience" && cv.experience?.length > 0) {
        checkPageSpace(15);
        doc.setFontSize(11);
        doc.setFont(fontName, "bold");
        doc.text(template === "ats-safe" ? "WORK EXPERIENCE" : "Professional Experience", margin, y);
        y += 6;

        for (const exp of cv.experience) {
          // Company & Role
          checkPageSpace(12);
          doc.setFontSize(10);
          doc.setFont(fontName, "bold");
          const companyRole = `${exp.company} - ${exp.role}`;
          doc.text(companyRole, margin, y);
          
          doc.setFont(fontName, "normal");
          const dates = `${exp.start} - ${exp.end}`;
          doc.text(dates, pageWidth - margin, y, { align: "right" });
          y += 5;

          // Bullets
          if (exp.bullets && exp.bullets.length > 0) {
            doc.setFontSize(9);
            for (const bullet of exp.bullets) {
              const splitBullet = doc.splitTextToSize(bullet, printableWidth - 5);
              const bulletHeight = splitBullet.length * 4;
              checkPageSpace(bulletHeight);
              
              doc.setFont(fontName, "bold");
              doc.text("•", margin + 2, y);
              doc.setFont(fontName, "normal");
              doc.text(splitBullet, margin + 6, y);
              y += bulletHeight;
            }
          }
          y += 4;
        }
        y += 4;
      }

      if (sectionId === "projects" && cv.projects?.length > 0) {
        checkPageSpace(15);
        doc.setFontSize(11);
        doc.setFont(fontName, "bold");
        doc.text(template === "ats-safe" ? "PROJECTS" : "Technical Projects", margin, y);
        y += 6;

        for (const proj of cv.projects) {
          checkPageSpace(12);
          doc.setFontSize(10);
          doc.setFont(fontName, "bold");
          const projTitle = proj.cv_title || proj.name;
          doc.text(projTitle, margin, y);
          
          // Tech stack inline or right-aligned
          doc.setFont(fontName, "italic");
          if (proj.tech && proj.tech.length > 0) {
            const techStr = `[${proj.tech.join(", ")}]`;
            doc.text(techStr, pageWidth - margin, y, { align: "right" });
          }
          y += 5;

          // Description
          if (proj.description) {
            doc.setFontSize(9.5);
            doc.setFont(fontName, "normal");
            const descLines = doc.splitTextToSize(proj.description, printableWidth);
            const descHeight = descLines.length * 4.5;
            checkPageSpace(descHeight);
            doc.text(descLines, margin, y);
            y += descHeight + 1.5;
          }

          // Highlights
          if (proj.highlights && proj.highlights.length > 0) {
            doc.setFontSize(9);
            for (const highlight of proj.highlights) {
              const splitHighlight = doc.splitTextToSize(highlight, printableWidth - 5);
              const highlightHeight = splitHighlight.length * 4;
              checkPageSpace(highlightHeight);
              
              doc.setFont(fontName, "bold");
              doc.text("•", margin + 2, y);
              doc.setFont(fontName, "normal");
              doc.text(splitHighlight, margin + 6, y);
              y += highlightHeight;
            }
          }
          y += 4;
        }
        y += 4;
      }

      if (sectionId === "education" && cv.education?.length > 0) {
        checkPageSpace(15);
        doc.setFontSize(11);
        doc.setFont(fontName, "bold");
        doc.text(template === "ats-safe" ? "EDUCATION" : "Education", margin, y);
        y += 6;

        for (const edu of cv.education) {
          checkPageSpace(12);
          doc.setFontSize(10);
          doc.setFont(fontName, "bold");
          const institution = edu.institution;
          doc.text(institution, margin, y);
          
          doc.setFont(fontName, "normal");
          const dates = `${edu.start} - ${edu.end}`;
          doc.text(dates, pageWidth - margin, y, { align: "right" });
          y += 5;

          doc.setFontSize(9.5);
          const degreeInfo = [edu.degree, edu.field, edu.gpa ? `GPA: ${edu.gpa}` : ""]
            .filter(Boolean)
            .join(", ");
          doc.text(degreeInfo, margin, y);
          y += 7;
        }
        y += 2;
      }

      if (sectionId === "skills" && cv.skills?.length > 0) {
        checkPageSpace(15);
        doc.setFontSize(11);
        doc.setFont(fontName, "bold");
        doc.text(template === "ats-safe" ? "SKILLS" : "Technical Skills", margin, y);
        y += 6;

        doc.setFontSize(9.5);
        doc.setFont(fontName, "normal");

        const categoriesOrder = [
          "Languages",
          "Frontend",
          "Backend",
          "Databases",
          "Mobile",
          "Design & Prototyping",
          "Tools",
          "Testing",
          "Concepts"
        ];

        // Group by category
        const groups: Record<string, string[]> = {};
        for (const s of cv.skills) {
          const cat = s.category || "Other";
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(s.name);
        }

        const presentCategories = categoriesOrder.filter(c => groups[c] && groups[c].length > 0);
        for (const cat of Object.keys(groups)) {
          if (!categoriesOrder.includes(cat) && groups[cat].length > 0) {
            presentCategories.push(cat);
          }
        }

        for (const cat of presentCategories) {
          checkPageSpace(8);
          doc.setFont(fontName, "bold");
          doc.text(`${cat}:`, margin, y);
          doc.setFont(fontName, "normal");
          const lineStr = groups[cat].join(", ");
          const splitLine = doc.splitTextToSize(lineStr, printableWidth - 35);
          doc.text(splitLine, margin + 35, y);
          y += splitLine.length * 4.5 + 1.5;
        }
        y += 3;
      }

      if (sectionId === "certifications" && cv.certifications?.length > 0) {
        checkPageSpace(15);
        doc.setFontSize(11);
        doc.setFont(fontName, "bold");
        doc.text(template === "ats-safe" ? "CERTIFICATIONS" : "Certifications", margin, y);
        y += 6;

        doc.setFontSize(9.5);
        doc.setFont(fontName, "normal");
        for (const cert of cv.certifications) {
          checkPageSpace(6);
          const certStr = `${cert.name} - Issued by ${cert.issuer} (${cert.date})`;
          doc.text(certStr, margin, y);
          y += 5;
        }
        y += 3;
      }

      if (sectionId === "languages" && cv.languages?.length > 0) {
        checkPageSpace(15);
        doc.setFontSize(11);
        doc.setFont(fontName, "bold");
        doc.text(template === "ats-safe" ? "LANGUAGES" : "Languages", margin, y);
        y += 6;

        doc.setFontSize(9.5);
        doc.setFont(fontName, "normal");
        const langStr = cv.languages.map(l => `${l.name} (${l.level})`).join(", ");
        const splitLangs = doc.splitTextToSize(langStr, printableWidth);
        checkPageSpace(splitLangs.length * 4.5);
        doc.text(splitLangs, margin, y);
        y += splitLangs.length * 4.5 + 4;
      }
    }

    doc.save(`${name.replace(/\s+/g, "_")}_${mode === "resume" ? "Resume" : "CV"}.pdf`);
  };

  useImperativeHandle(ref, () => ({
    downloadPDF,
  }));

  // Define fonts, colors, spacing for HTML templates
  const templateFontClass =
    template === "classic"
      ? "font-serif text-[13px]"
      : template === "minimal"
      ? "font-sans tracking-wide text-[12.5px]"
      : "font-sans text-[13px]"; // Arial standard

  return (
    <div className="flex flex-col h-full">
      {/* Overflow Warning Badge */}
      {isOverflowing && (
        <div className="mb-4 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Warning: Content overflows a single page in Resume Mode. Consider trimming descriptions.
        </div>
      )}

      {/* Paper Container */}
      <div className="flex-1 overflow-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-center">
        <div
          ref={containerRef}
          id="resume-pdf-paper"
          className={`bg-white text-zinc-900 shadow-2xl p-12 transition-all duration-300 select-text leading-relaxed text-left ${templateFontClass} ${
            mode === "resume" ? "h-[297mm] max-h-[297mm] overflow-hidden" : "min-h-[297mm]"
          } w-[210mm]`}
          style={{
            fontFamily:
              template === "classic"
                ? "'Times New Roman', Times, serif"
                : template === "minimal"
                ? "system-ui, -apple-system, sans-serif"
                : "Arial, Helvetica, sans-serif",
          }}
        >
          {/* Header */}
          <div className={`mb-6 ${template === "classic" ? "text-center" : ""}`}>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 mb-2">
              {cv.personal?.name || "Name"}
            </h1>
            
            <div className="text-[11px] text-zinc-600 flex flex-wrap gap-x-2 gap-y-1 justify-center sm:justify-start">
              {cv.personal?.email && <span>{cv.personal.email}</span>}
              {cv.personal?.phone && <span>• {cv.personal.phone}</span>}
              {cv.personal?.location && <span>• {cv.personal.location}</span>}
              {cv.personal?.linkedin && (
                <span>
                  • <a href={cv.personal.linkedin} className="underline">{cv.personal.linkedin}</a>
                </span>
              )}
              {cv.personal?.github && (
                <span>
                  • <a href={cv.personal.github} className="underline">{cv.personal.github}</a>
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          {template !== "minimal" && <hr className="border-zinc-300 mb-5" />}

          {/* Summary */}
          {cv.personal?.summary && (
            <div className="mb-5">
              <h2 className="text-sm font-bold text-zinc-950 tracking-wide uppercase mb-1.5 border-b border-zinc-200 pb-0.5">
                {template === "ats-safe" ? "SUMMARY" : "Professional Summary"}
              </h2>
              <p className="text-zinc-700 leading-relaxed">{cv.personal.summary}</p>
            </div>
          )}

          {/* Render Sections dynamically */}
          {sectionOrder.map((sectionId) => {
            if (sectionId === "experience" && cv.experience?.length > 0) {
              return (
                <div key={sectionId} className="mb-5">
                  <h2 className="text-sm font-bold text-zinc-950 tracking-wide uppercase mb-2 border-b border-zinc-200 pb-0.5">
                    {template === "ats-safe" ? "WORK EXPERIENCE" : "Professional Experience"}
                  </h2>
                  <div className="space-y-4">
                    {cv.experience.map((exp, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between font-bold text-zinc-950 text-xs mb-1">
                          <span>{exp.company} — {exp.role}</span>
                          <span className="text-[10px] text-zinc-600 font-normal">{exp.start} - {exp.end}</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-zinc-700 text-xs">
                          {exp.bullets?.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (sectionId === "projects" && cv.projects?.length > 0) {
              return (
                <div key={sectionId} className="mb-5">
                  <h2 className="text-sm font-bold text-zinc-950 tracking-wide uppercase mb-2 border-b border-zinc-200 pb-0.5">
                    {template === "ats-safe" ? "PROJECTS" : "Technical Projects"}
                  </h2>
                  <div className="space-y-4">
                    {cv.projects.map((proj, idx) => (
                      <div key={idx}>
                        <div className="flex items-baseline justify-between font-bold text-zinc-950 text-xs mb-0.5">
                          <span>
                            {proj.cv_title || proj.name}{" "}
                            {proj.repo_url && (
                              <a href={proj.repo_url} className="text-[10px] text-indigo-600 font-normal underline ml-1.5">
                                [GitHub]
                              </a>
                            )}
                          </span>
                          {proj.tech && proj.tech.length > 0 && (
                            <span className="text-[10px] text-zinc-600 font-semibold italic">
                              {proj.tech.join(", ")}
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-700 text-xs leading-normal mb-1">{proj.description}</p>
                        {proj.highlights && proj.highlights.length > 0 && (
                          <ul className="list-disc pl-5 space-y-0.5 text-zinc-700 text-[11px]">
                            {proj.highlights.map((hl, hlIdx) => (
                              <li key={hlIdx}>{hl}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (sectionId === "education" && cv.education?.length > 0) {
              return (
                <div key={sectionId} className="mb-5">
                  <h2 className="text-sm font-bold text-zinc-950 tracking-wide uppercase mb-2 border-b border-zinc-200 pb-0.5">
                    {template === "ats-safe" ? "EDUCATION" : "Education"}
                  </h2>
                  <div className="space-y-3">
                    {cv.education.map((edu, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs">
                        <div>
                          <strong className="text-zinc-950">{edu.institution}</strong>
                          <div className="text-zinc-600">
                            {edu.degree} in {edu.field} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-500">{edu.start} - {edu.end}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (sectionId === "skills" && cv.skills?.length > 0) {
              const categoriesOrder = [
                "Languages",
                "Frontend",
                "Backend",
                "Databases",
                "Mobile",
                "Design & Prototyping",
                "Tools",
                "Testing",
                "Concepts"
              ];

              // Group by category
              const groups: Record<string, string[]> = {};
              for (const s of cv.skills) {
                const cat = s.category || "Other";
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(s.name);
              }

              const presentCategories = categoriesOrder.filter(c => groups[c] && groups[c].length > 0);
              for (const cat of Object.keys(groups)) {
                if (!categoriesOrder.includes(cat) && groups[cat].length > 0) {
                  presentCategories.push(cat);
                }
              }

              return (
                <div key={sectionId} className="mb-5">
                  <h2 className="text-sm font-bold text-zinc-950 tracking-wide uppercase mb-2 border-b border-zinc-200 pb-0.5">
                    {template === "ats-safe" ? "SKILLS" : "Technical Skills"}
                  </h2>
                  <div className="space-y-1 text-xs text-zinc-700">
                    {presentCategories.map(cat => (
                      <div key={cat} className="flex gap-2">
                        <span className="font-bold text-zinc-900 w-32 shrink-0">{cat}:</span>
                        <span className="text-zinc-700">{groups[cat].join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (sectionId === "certifications" && cv.certifications?.length > 0) {
              return (
                <div key={sectionId} className="mb-5">
                  <h2 className="text-sm font-bold text-zinc-950 tracking-wide uppercase mb-2 border-b border-zinc-200 pb-0.5">
                    {template === "ats-safe" ? "CERTIFICATIONS" : "Certifications"}
                  </h2>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-700 text-xs">
                    {cv.certifications.map((cert, idx) => (
                      <li key={idx}>
                        <strong>{cert.name}</strong> — {cert.issuer} ({cert.date})
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }

            if (sectionId === "languages" && cv.languages?.length > 0) {
              return (
                <div key={sectionId} className="mb-5">
                  <h2 className="text-sm font-bold text-zinc-950 tracking-wide uppercase mb-2 border-b border-zinc-200 pb-0.5">
                    {template === "ats-safe" ? "LANGUAGES" : "Languages"}
                  </h2>
                  <p className="text-zinc-700 text-xs">
                    {cv.languages.map((l, idx) => (
                      <span key={idx}>
                        {l.name} ({l.level}){idx < cv.languages.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
});

export default CVPreview;
