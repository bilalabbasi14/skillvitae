"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import jsPDF from "jspdf";
import { CVData } from "../../lib/cv-utils";

interface CVPreviewProps {
  cv: CVData;
  mode: "resume" | "cv";
  template: "ats-safe" | "classic" | "minimal";
  sectionOrder: string[];
  fontSize?: "sm" | "md" | "lg";
  margins?: "compact" | "normal" | "wide";
  density?: "compact" | "normal" | "loose";
}

export interface CVPreviewRef {
  downloadPDF: () => void;
}

const formatHref = (url?: string, defaultDomain?: string) => {
  if (!url) return "";
  const clean = url.trim();
  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }
  if (clean.toLowerCase().startsWith("www.")) {
    return `https://${clean}`;
  }
  if (clean.includes("/") || clean.includes(".")) {
    return `https://${clean}`;
  }
  return defaultDomain ? `${defaultDomain}/${clean}` : clean;
};

const CVPreview = forwardRef<CVPreviewRef, CVPreviewProps>(function CVPreview(
  {
    cv,
    mode,
    template,
    sectionOrder,
    fontSize = "md",
    margins = "normal",
    density = "normal",
  },
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
  }, [cv, mode, template, sectionOrder, fontSize, margins, density]);

  // Programmatic text-selectable PDF generator
  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    
    // Layout configurations mapped to PDF margins
    let margin = 15;
    if (margins === "compact") margin = 10;
    if (margins === "wide") margin = 20;

    const printableWidth = pageWidth - 2 * margin; // printable area width
    let y = margin;

    // Scale factors
    const sizeScale = fontSize === "sm" ? 0.85 : fontSize === "lg" ? 1.15 : 1.0;
    const densityScale = density === "compact" ? 0.75 : density === "loose" ? 1.25 : 1.0;
    const pdfLineHeight = sizeScale * (density === "compact" ? 3.8 : density === "loose" ? 5.2 : 4.5);

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
    doc.setFontSize(22 * sizeScale);
    doc.setFont(fontName, "bold");
    if (template === "classic") {
      doc.text(name, pageWidth / 2, y, { align: "center" });
    } else {
      doc.text(name, margin, y);
    }
    y += 8 * densityScale;

    // Contact info
    const contacts = [
      cv.personal?.email,
      cv.personal?.phone,
      cv.personal?.location,
      cv.personal?.linkedin ? `LinkedIn: ${cv.personal.linkedin}` : "",
      cv.personal?.github ? `GitHub: ${cv.personal.github}` : "",
    ].filter(Boolean);

    doc.setFontSize(9 * sizeScale);
    doc.setFont(fontName, "normal");
    const contactLine = contacts.join("  |  ");
    if (template === "classic") {
      doc.text(contactLine, pageWidth / 2, y, { align: "center" });
    } else {
      doc.text(contactLine, margin, y);
    }
    y += 10 * densityScale;

    // Divider line
    if (template !== "minimal") {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y - 5 * densityScale, pageWidth - margin, y - 5 * densityScale);
    }

    // --- Summary Section (Always full-width at the top) ---
    if (cv.personal?.summary) {
      checkPageSpace(15 * densityScale);
      doc.setFontSize(11 * sizeScale);
      doc.setFont(fontName, "bold");
      doc.text(template === "ats-safe" ? "SUMMARY" : "Professional Summary", margin, y);
      y += 5 * densityScale;

      doc.setFontSize(9.5 * sizeScale);
      doc.setFont(fontName, "normal");
      const summaryLines = doc.splitTextToSize(cv.personal.summary, printableWidth);
      const summaryHeight = summaryLines.length * pdfLineHeight;
      checkPageSpace(summaryHeight);
      doc.text(summaryLines, margin, y);
      y += summaryHeight + 8 * densityScale;
    }

    const isTwoColumn = mode === "resume" && (template === "classic" || template === "minimal");

    if (isTwoColumn) {
      const leftColWidth = printableWidth * 0.62;
      const gap = 6;
      const rightColWidth = printableWidth - leftColWidth - gap;
      const leftColStart = margin;
      const rightColStart = margin + leftColWidth + gap;

      let yLeft = y;
      let yRight = y;

      for (const sectionId of sectionOrder) {
        if (sectionId === "experience" && cv.experience?.length > 0) {
          doc.setFontSize(11 * sizeScale);
          doc.setFont(fontName, "bold");
          doc.text("Professional Experience", leftColStart, yLeft);
          yLeft += 6 * densityScale;

          for (const exp of cv.experience) {
            doc.setFontSize(10 * sizeScale);
            doc.setFont(fontName, "bold");
            const companyRole = `${exp.company} - ${exp.role}`;
            doc.text(companyRole, leftColStart, yLeft);
            
            doc.setFont(fontName, "normal");
            const dates = `${exp.start} - ${exp.end}`;
            doc.text(dates, leftColStart + leftColWidth, yLeft, { align: "right" });
            yLeft += 5 * densityScale;

            if (exp.bullets && exp.bullets.length > 0) {
              doc.setFontSize(9 * sizeScale);
              for (const bullet of exp.bullets) {
                const splitBullet = doc.splitTextToSize(bullet, leftColWidth - 5);
                const bulletHeight = splitBullet.length * (pdfLineHeight * 0.9);
                
                doc.setFont(fontName, "bold");
                doc.text("•", leftColStart + 2, yLeft);
                doc.setFont(fontName, "normal");
                doc.text(splitBullet, leftColStart + 6, yLeft);
                yLeft += bulletHeight;
              }
            }
            yLeft += 4 * densityScale;
          }
          yLeft += 4 * densityScale;
        }

        if (sectionId === "projects" && cv.projects?.length > 0) {
          doc.setFontSize(11 * sizeScale);
          doc.setFont(fontName, "bold");
          doc.text("Technical Projects", leftColStart, yLeft);
          yLeft += 6 * densityScale;

          for (const proj of cv.projects) {
            doc.setFontSize(10 * sizeScale);
            doc.setFont(fontName, "bold");
            const projTitle = proj.cv_title || proj.name;
            doc.text(projTitle, leftColStart, yLeft);
            
            doc.setFont(fontName, "italic");
            if (proj.tech && proj.tech.length > 0) {
              const techStr = `[${proj.tech.join(", ")}]`;
              doc.text(techStr, leftColStart + leftColWidth, yLeft, { align: "right" });
            }
            yLeft += 5 * densityScale;

            if (proj.description) {
              doc.setFontSize(9.5 * sizeScale);
              doc.setFont(fontName, "normal");
              const descLines = doc.splitTextToSize(proj.description, leftColWidth);
              const descHeight = descLines.length * pdfLineHeight;
              doc.text(descLines, leftColStart, yLeft);
              yLeft += descHeight + 1.5 * densityScale;
            }

            if (proj.highlights && proj.highlights.length > 0) {
              doc.setFontSize(9 * sizeScale);
              for (const highlight of proj.highlights) {
                const splitHighlight = doc.splitTextToSize(highlight, leftColWidth - 5);
                const highlightHeight = splitHighlight.length * (pdfLineHeight * 0.9);
                
                doc.setFont(fontName, "bold");
                doc.text("•", leftColStart + 2, yLeft);
                doc.setFont(fontName, "normal");
                doc.text(splitHighlight, leftColStart + 6, yLeft);
                yLeft += highlightHeight;
              }
            }
            yLeft += 4 * densityScale;
          }
          yLeft += 4 * densityScale;
        }
      }

      // Render Right Column
      for (const sectionId of sectionOrder) {
        if (sectionId === "skills" && cv.skills?.length > 0) {
          doc.setFontSize(11 * sizeScale);
          doc.setFont(fontName, "bold");
          doc.text("Technical Skills", rightColStart, yRight);
          yRight += 6 * densityScale;

          doc.setFontSize(9.5 * sizeScale);
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
            doc.setFont(fontName, "bold");
            doc.setFontSize(8.5 * sizeScale);
            doc.text(cat.toUpperCase(), rightColStart, yRight);
            yRight += 4 * densityScale;

            doc.setFont(fontName, "normal");
            doc.setFontSize(9 * sizeScale);
            const lineStr = groups[cat].join(", ");
            const splitLine = doc.splitTextToSize(lineStr, rightColWidth);
            doc.text(splitLine, rightColStart, yRight);
            yRight += splitLine.length * pdfLineHeight + 2 * densityScale;
          }
          yRight += 2 * densityScale;
        }

        if (sectionId === "education" && cv.education?.length > 0) {
          doc.setFontSize(11 * sizeScale);
          doc.setFont(fontName, "bold");
          doc.text("Education", rightColStart, yRight);
          yRight += 6 * densityScale;

          for (const edu of cv.education) {
            doc.setFontSize(9.5 * sizeScale);
            doc.setFont(fontName, "bold");
            doc.text(edu.institution, rightColStart, yRight);
            yRight += 4.5 * densityScale;

            doc.setFont(fontName, "normal");
            const dates = `${edu.start} - ${edu.end}`;
            doc.setFontSize(8.5 * sizeScale);
            doc.text(dates, rightColStart, yRight);
            yRight += 4.5 * densityScale;

            doc.setFontSize(9 * sizeScale);
            const degreeInfo = [edu.degree, edu.field, edu.gpa ? `GPA: ${edu.gpa}` : ""]
              .filter(Boolean)
              .join(", ");
            const splitDegree = doc.splitTextToSize(degreeInfo, rightColWidth);
            doc.text(splitDegree, rightColStart, yRight);
            yRight += splitDegree.length * pdfLineHeight + 4 * densityScale;
          }
          yRight += 2 * densityScale;
        }

        if (sectionId === "certifications" && cv.certifications?.length > 0) {
          doc.setFontSize(11 * sizeScale);
          doc.setFont(fontName, "bold");
          doc.text("Certifications", rightColStart, yRight);
          yRight += 6 * densityScale;

          doc.setFontSize(9 * sizeScale);
          doc.setFont(fontName, "normal");
          for (const cert of cv.certifications) {
            const certStr = `${cert.name} - ${cert.issuer} (${cert.date})`;
            const splitCert = doc.splitTextToSize(certStr, rightColWidth);
            doc.text(splitCert, rightColStart, yRight);
            yRight += splitCert.length * pdfLineHeight + 2.5 * densityScale;
          }
          yRight += 2 * densityScale;
        }

        if (sectionId === "languages" && cv.languages?.length > 0) {
          doc.setFontSize(11 * sizeScale);
          doc.setFont(fontName, "bold");
          doc.text("Languages", rightColStart, yRight);
          yRight += 6 * densityScale;

          doc.setFontSize(9 * sizeScale);
          doc.setFont(fontName, "normal");
          const langStr = cv.languages.map(l => `${l.name} (${l.level})`).join(", ");
          const splitLangs = doc.splitTextToSize(langStr, rightColWidth);
          doc.text(splitLangs, rightColStart, yRight);
          yRight += splitLangs.length * pdfLineHeight + 4 * densityScale;
        }
      }

      // Draw Divider Line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.25);
      const dividerX = margin + leftColWidth + (gap / 2);
      const dividerStart = y - 4 * densityScale;
      const dividerEnd = Math.max(yLeft, yRight);
      doc.line(dividerX, dividerStart, dividerX, dividerEnd);

    } else {
      // --- Dynamic Section Rendering ---
      for (const sectionId of sectionOrder) {
        if (sectionId === "experience" && cv.experience?.length > 0) {
          checkPageSpace(15 * densityScale);
          doc.setFontSize(11 * sizeScale);
          doc.setFont(fontName, "bold");
          doc.text(template === "ats-safe" ? "WORK EXPERIENCE" : "Professional Experience", margin, y);
          y += 6 * densityScale;

          for (const exp of cv.experience) {
            // Company & Role
            checkPageSpace(12 * densityScale);
            doc.setFontSize(10 * sizeScale);
            doc.setFont(fontName, "bold");
            const companyRole = `${exp.company} - ${exp.role}`;
            doc.text(companyRole, margin, y);
            
            doc.setFont(fontName, "normal");
            const dates = `${exp.start} - ${exp.end}`;
            doc.text(dates, pageWidth - margin, y, { align: "right" });
            y += 5 * densityScale;

            // Bullets
            if (exp.bullets && exp.bullets.length > 0) {
              doc.setFontSize(9 * sizeScale);
              for (const bullet of exp.bullets) {
                const splitBullet = doc.splitTextToSize(bullet, printableWidth - 5);
                const bulletHeight = splitBullet.length * (pdfLineHeight * 0.9);
                checkPageSpace(bulletHeight);
                
                doc.setFont(fontName, "bold");
                doc.text("•", margin + 2, y);
                doc.setFont(fontName, "normal");
                doc.text(splitBullet, margin + 6, y);
                y += bulletHeight;
              }
            }
            y += 4 * densityScale;
          }
          y += 4 * densityScale;
        }

        if (sectionId === "projects" && cv.projects?.length > 0) {
          checkPageSpace(15 * densityScale);
          doc.setFontSize(11 * sizeScale);
          doc.setFont(fontName, "bold");
          doc.text(template === "ats-safe" ? "PROJECTS" : "Technical Projects", margin, y);
          y += 6 * densityScale;

          for (const proj of cv.projects) {
            checkPageSpace(12 * densityScale);
            doc.setFontSize(10 * sizeScale);
            doc.setFont(fontName, "bold");
            const projTitle = proj.cv_title || proj.name;
            doc.text(projTitle, margin, y);
            
            // Tech stack inline or right-aligned
            doc.setFont(fontName, "italic");
            if (proj.tech && proj.tech.length > 0) {
              const techStr = `[${proj.tech.join(", ")}]`;
              doc.text(techStr, pageWidth - margin, y, { align: "right" });
            }
            y += 5 * densityScale;

            // Description
            if (proj.description) {
              doc.setFontSize(9.5 * sizeScale);
              doc.setFont(fontName, "normal");
              const descLines = doc.splitTextToSize(proj.description, printableWidth);
              const descHeight = descLines.length * pdfLineHeight;
              checkPageSpace(descHeight);
              doc.text(descLines, margin, y);
              y += descHeight + 1.5 * densityScale;
            }

            // Highlights
            if (proj.highlights && proj.highlights.length > 0) {
              doc.setFontSize(9 * sizeScale);
              for (const highlight of proj.highlights) {
                const splitHighlight = doc.splitTextToSize(highlight, printableWidth - 5);
                const highlightHeight = splitHighlight.length * (pdfLineHeight * 0.9);
                checkPageSpace(highlightHeight);
                
                doc.setFont(fontName, "bold");
                doc.text("•", margin + 2, y);
                doc.setFont(fontName, "normal");
                doc.text(splitHighlight, margin + 6, y);
                y += highlightHeight;
              }
            }
            y += 4 * densityScale;
          }
          y += 4 * densityScale;
        }

        if (sectionId === "education" && cv.education?.length > 0) {
          checkPageSpace(15 * densityScale);
          doc.setFontSize(11 * sizeScale);
          doc.setFont(fontName, "bold");
          doc.text(template === "ats-safe" ? "EDUCATION" : "Education", margin, y);
          y += 6 * densityScale;

          for (const edu of cv.education) {
            checkPageSpace(12 * densityScale);
            doc.setFontSize(10 * sizeScale);
            doc.setFont(fontName, "bold");
            const institution = edu.institution;
            doc.text(institution, margin, y);
            
            doc.setFont(fontName, "normal");
            const dates = `${edu.start} - ${edu.end}`;
            doc.text(dates, pageWidth - margin, y, { align: "right" });
            y += 5 * densityScale;

            doc.setFontSize(9.5 * sizeScale);
            const degreeInfo = [edu.degree, edu.field, edu.gpa ? `GPA: ${edu.gpa}` : ""]
              .filter(Boolean)
              .join(", ");
            doc.text(degreeInfo, margin, y);
            y += 7 * densityScale;
          }
          y += 2 * densityScale;
        }

        if (sectionId === "skills" && cv.skills?.length > 0) {
          checkPageSpace(15 * densityScale);
          doc.setFontSize(11 * sizeScale);
          doc.setFont(fontName, "bold");
          doc.text(template === "ats-safe" ? "SKILLS" : "Technical Skills", margin, y);
          y += 6 * densityScale;

          doc.setFontSize(9.5 * sizeScale);
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
            checkPageSpace(8 * densityScale);
            doc.setFont(fontName, "bold");
            doc.text(`${cat}:`, margin, y);
            doc.setFont(fontName, "normal");
            const lineStr = groups[cat].join(", ");
            const splitLine = doc.splitTextToSize(lineStr, printableWidth - 35);
            doc.text(splitLine, margin + 35, y);
            y += splitLine.length * pdfLineHeight + 1.5 * densityScale;
          }
          y += 3 * densityScale;
        }

        if (sectionId === "certifications" && cv.certifications?.length > 0) {
          checkPageSpace(15 * densityScale);
          doc.setFontSize(11 * sizeScale);
          doc.setFont(fontName, "bold");
          doc.text(template === "ats-safe" ? "CERTIFICATIONS" : "Certifications", margin, y);
          y += 6 * densityScale;

          doc.setFontSize(9.5 * sizeScale);
          doc.setFont(fontName, "normal");
          for (const cert of cv.certifications) {
            checkPageSpace(6 * densityScale);
            const certStr = `${cert.name} - Issued by ${cert.issuer} (${cert.date})`;
            doc.text(certStr, margin, y);
            y += 5 * densityScale;
          }
          y += 3 * densityScale;
        }

        if (sectionId === "languages" && cv.languages?.length > 0) {
          checkPageSpace(15 * densityScale);
          doc.setFontSize(11 * sizeScale);
          doc.setFont(fontName, "bold");
          doc.text(template === "ats-safe" ? "LANGUAGES" : "Languages", margin, y);
          y += 6 * densityScale;

          doc.setFontSize(9.5 * sizeScale);
          doc.setFont(fontName, "normal");
          const langStr = cv.languages.map(l => `${l.name} (${l.level})`).join(", ");
          const splitLangs = doc.splitTextToSize(langStr, printableWidth);
          checkPageSpace(splitLangs.length * pdfLineHeight);
          doc.text(splitLangs, margin, y);
          y += splitLangs.length * pdfLineHeight + 4 * densityScale;
        }
      }
    }

    doc.save(`${name.replace(/\s+/g, "_")}_${mode === "resume" ? "Resume" : "CV"}.pdf`);
  };

  useImperativeHandle(ref, () => ({
    downloadPDF,
  }));

  // HTML preview configuration classes
  const spacingSectionClass =
    density === "compact" ? "mb-3" : density === "loose" ? "mb-7" : "mb-5";
  
  const spacingEntryClass =
    density === "compact" ? "space-y-2" : density === "loose" ? "space-y-5" : "space-y-4";

  const spacingBulletClass =
    density === "compact" ? "space-y-0.5 text-[10.5px]" : density === "loose" ? "space-y-1.5 text-[11.5px]" : "space-y-1 text-xs";

  const leadingClass =
    density === "compact" ? "leading-snug" : density === "loose" ? "leading-loose" : "leading-relaxed";

  const paddingClass =
    margins === "compact" ? "p-6 sm:p-8" : margins === "wide" ? "p-16" : "p-12";

  // Font size scale mapping for sub-components
  const nameSizeClass =
    fontSize === "sm" ? "text-2xl mb-1" : fontSize === "lg" ? "text-4xl mb-3" : "text-3xl mb-2";

  const h2SizeClass =
    fontSize === "sm" ? "text-xs mb-1.5 pb-0.5" : fontSize === "lg" ? "text-base mb-2.5 pb-1" : "text-sm mb-2 pb-0.5";

  const entryHeaderClass =
    fontSize === "sm" ? "text-[11px]" : fontSize === "lg" ? "text-[13px]" : "text-xs";

  const bodyTextClass =
    fontSize === "sm" ? "text-[11px]" : fontSize === "lg" ? "text-[13.5px]" : "text-xs";

  const baseSize =
    template === "classic"
      ? (fontSize === "sm" ? "text-[11px]" : fontSize === "lg" ? "text-[14.5px]" : "text-[13px]")
      : template === "minimal"
      ? (fontSize === "sm" ? "text-[10.5px]" : fontSize === "lg" ? "text-[14px]" : "text-[12.5px]")
      : (fontSize === "sm" ? "text-[11px]" : fontSize === "lg" ? "text-[14.5px]" : "text-[13px]");

  const renderExperience = (key: string) => {
    if (!cv.experience || cv.experience.length === 0) return null;
    return (
      <div key={key} className={spacingSectionClass}>
        <h2 className={`${h2SizeClass} font-bold text-zinc-950 tracking-wide uppercase border-b border-zinc-200`}>
          {template === "ats-safe" ? "WORK EXPERIENCE" : "Professional Experience"}
        </h2>
        <div className={spacingEntryClass}>
          {cv.experience.map((exp, idx) => (
            <div key={idx}>
              <div className={`flex items-center justify-between font-bold text-zinc-950 ${entryHeaderClass} mb-1`}>
                <span>{exp.company} — {exp.role}</span>
                <span className="text-[10px] text-zinc-600 font-normal">{exp.start} - {exp.end}</span>
              </div>
              <ul className={`list-disc pl-5 ${spacingBulletClass} text-zinc-700`}>
                {exp.bullets?.map((bullet, bIdx) => (
                  <li key={bIdx}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = (key: string) => {
    if (!cv.projects || cv.projects.length === 0) return null;
    return (
      <div key={key} className={spacingSectionClass}>
        <h2 className={`${h2SizeClass} font-bold text-zinc-950 tracking-wide uppercase border-b border-zinc-200`}>
          {template === "ats-safe" ? "PROJECTS" : "Technical Projects"}
        </h2>
        <div className={spacingEntryClass}>
          {cv.projects.map((proj, idx) => (
            <div key={idx}>
              <div className={`flex items-baseline justify-between font-bold text-zinc-950 ${entryHeaderClass} mb-0.5`}>
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
              <p className={`text-zinc-700 ${bodyTextClass} leading-normal mb-1`}>{proj.description}</p>
              {proj.highlights && proj.highlights.length > 0 && (
                <ul className={`list-disc pl-5 ${spacingBulletClass} text-zinc-700`}>
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
  };

  const renderEducation = (key: string) => {
    if (!cv.education || cv.education.length === 0) return null;
    const isTwoCol = mode === "resume" && (template === "classic" || template === "minimal");
    return (
      <div key={key} className={spacingSectionClass}>
        <h2 className={`${h2SizeClass} font-bold text-zinc-950 tracking-wide uppercase border-b border-zinc-200`}>
          {template === "ats-safe" ? "EDUCATION" : "Education"}
        </h2>
        <div className={spacingEntryClass}>
          {cv.education.map((edu, idx) => (
            <div key={idx} className={`flex ${isTwoCol ? "flex-col" : "justify-between items-start"} ${bodyTextClass}`}>
              <div>
                <strong className="text-zinc-950">{edu.institution}</strong>
                <div className="text-zinc-650 leading-normal">
                  {edu.degree} in {edu.field} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}
                </div>
              </div>
              <span className={`text-[10px] text-zinc-500 ${isTwoCol ? "mt-0.5" : ""}`}>{edu.start} - {edu.end}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = (key: string) => {
    if (!cv.skills || cv.skills.length === 0) return null;

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

    if (mode === "resume" && (template === "classic" || template === "minimal")) {
      // Sidebar layout: category above skills, very compact spacing
      return (
        <div key={key} className={spacingSectionClass}>
          <h2 className={`${h2SizeClass} font-bold text-zinc-950 tracking-wide uppercase border-b border-zinc-200`}>
            Technical Skills
          </h2>
          <div className="space-y-2">
            {presentCategories.map(cat => (
              <div key={cat} className="flex flex-col text-left">
                <span className="font-bold text-zinc-900 text-[10px] uppercase tracking-wider mb-0.5">{cat}</span>
                <span className="text-zinc-600 text-[10.5px] leading-snug">{groups[cat].join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default full-width single-column layout: side-by-side
    return (
      <div key={key} className={spacingSectionClass}>
        <h2 className={`${h2SizeClass} font-bold text-zinc-950 tracking-wide uppercase border-b border-zinc-200`}>
          {template === "ats-safe" ? "SKILLS" : "Technical Skills"}
        </h2>
        <div className={`space-y-1 ${bodyTextClass} text-zinc-700`}>
          {presentCategories.map(cat => (
            <div key={cat} className="flex gap-2">
              <span className="font-bold text-zinc-900 w-32 shrink-0">{cat}:</span>
              <span className="text-zinc-700">{groups[cat].join(", ")}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertifications = (key: string) => {
    if (!cv.certifications || cv.certifications.length === 0) return null;
    return (
      <div key={key} className={spacingSectionClass}>
        <h2 className={`${h2SizeClass} font-bold text-zinc-950 tracking-wide uppercase border-b border-zinc-200`}>
          {template === "ats-safe" ? "CERTIFICATIONS" : "Certifications"}
        </h2>
        <ul className={`list-disc pl-5 ${spacingBulletClass} text-zinc-700`}>
          {cv.certifications.map((cert, idx) => (
            <li key={idx}>
              <strong>{cert.name}</strong> — {cert.issuer} ({cert.date})
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderLanguages = (key: string) => {
    if (!cv.languages || cv.languages.length === 0) return null;
    return (
      <div key={key} className={spacingSectionClass}>
        <h2 className={`${h2SizeClass} font-bold text-zinc-950 tracking-wide uppercase border-b border-zinc-200`}>
          {template === "ats-safe" ? "LANGUAGES" : "Languages"}
        </h2>
        <p className={`text-zinc-700 ${bodyTextClass}`}>
          {cv.languages.map((l, idx) => (
            <span key={idx}>
              {l.name} ({l.level}){idx < cv.languages.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>
    );
  };

  const templateFontClass =
    template === "classic"
      ? `font-serif ${baseSize}`
      : template === "minimal"
      ? `font-sans tracking-wide ${baseSize}`
      : `font-sans ${baseSize}`;

  return (
    <div className="flex flex-col h-full">
      {/* Overflow Warning Badge */}
      {isOverflowing && (
        <div className="mb-4 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Warning: Content overflows a single page in Resume Mode. Consider trimming descriptions, lowering font size, or compacting spacing.
        </div>
      )}

      {/* Paper Container */}
      <div className="flex-1 overflow-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-center">
        <div
          ref={containerRef}
          id="resume-pdf-paper"
          className={`bg-white text-zinc-900 shadow-2xl transition-all duration-300 select-text text-left ${templateFontClass} ${leadingClass} ${paddingClass} ${
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
          <div className={`${density === "compact" ? "mb-4" : density === "loose" ? "mb-8" : "mb-6"} ${template === "classic" ? "text-center" : ""}`}>
            <h1 className={`${nameSizeClass} font-extrabold tracking-tight text-zinc-950`}>
              {cv.personal?.name || "Name"}
            </h1>
            
            <div className="text-[11px] text-zinc-600 flex flex-wrap gap-x-2 gap-y-1 justify-center sm:justify-start">
              {cv.personal?.email && <span>{cv.personal.email}</span>}
              {cv.personal?.phone && <span>• {cv.personal.phone}</span>}
              {cv.personal?.location && <span>• {cv.personal.location}</span>}
              {cv.personal?.linkedin && (
                <span>
                  • <a href={formatHref(cv.personal.linkedin, "https://linkedin.com/in")} className="underline">{cv.personal.linkedin}</a>
                </span>
              )}
              {cv.personal?.github && (
                <span>
                  • <a href={formatHref(cv.personal.github, "https://github.com")} className="underline">{cv.personal.github}</a>
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          {template !== "minimal" && <hr className={`border-zinc-300 ${density === "compact" ? "mb-3" : density === "loose" ? "mb-7" : "mb-5"}`} />}

          {/* Summary (Always full-width at the top of content) */}
          {cv.personal?.summary && (
            <div className={spacingSectionClass}>
              <h2 className={`${h2SizeClass} font-bold text-zinc-950 tracking-wide uppercase border-b border-zinc-200`}>
                {template === "ats-safe" ? "SUMMARY" : "Professional Summary"}
              </h2>
              <p className={`text-zinc-750 ${bodyTextClass} leading-relaxed`}>{cv.personal.summary}</p>
            </div>
          )}

          {/* Core Content Grid */}
          {mode === "resume" && (template === "classic" || template === "minimal") ? (
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column (col-span-2) */}
              <div className="col-span-2 space-y-4 pr-2">
                {/* Left side sections dynamically ordered */}
                {sectionOrder.map((sectionId) => {
                  if (sectionId === "experience") return renderExperience(sectionId);
                  if (sectionId === "projects") return renderProjects(sectionId);
                  return null;
                })}
              </div>

              {/* Right Column (col-span-1) with vertical line divider */}
              <div className="col-span-1 border-l border-zinc-200 pl-4 space-y-4">
                {sectionOrder.map((sectionId) => {
                  if (sectionId === "skills") return renderSkills(sectionId);
                  if (sectionId === "education") return renderEducation(sectionId);
                  if (sectionId === "certifications") return renderCertifications(sectionId);
                  if (sectionId === "languages") return renderLanguages(sectionId);
                  return null;
                })}
              </div>
            </div>
          ) : (
            /* ATS-Safe Template or Single Column Mode */
            <div className="space-y-4">
              {/* All sections dynamically ordered */}
              {sectionOrder.map((sectionId) => {
                if (sectionId === "experience") return renderExperience(sectionId);
                if (sectionId === "projects") return renderProjects(sectionId);
                if (sectionId === "skills") return renderSkills(sectionId);
                if (sectionId === "education") return renderEducation(sectionId);
                if (sectionId === "certifications") return renderCertifications(sectionId);
                if (sectionId === "languages") return renderLanguages(sectionId);
                return null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default CVPreview;
