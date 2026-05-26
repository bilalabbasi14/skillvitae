"use client";

import { useState } from "react";
import { CVData, CVSkill, CVProject, CVExperience, CVEducation, CVCertification, CVLanguage } from "../../lib/cv-utils";
import SkillTag from "./SkillTag";

interface CVEditorProps {
  cv: CVData;
  onChange: (updatedCV: CVData) => void;
  sectionOrder: string[];
  onChangeSectionOrder: (order: string[]) => void;
}

type ActiveTab = "personal" | "order" | "experience" | "projects" | "skills" | "education" | "certs-langs" | null;

export default function CVEditor({
  cv,
  onChange,
  sectionOrder,
  onChangeSectionOrder,
}: CVEditorProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("personal");
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<"advanced" | "proficient" | "familiar" | "beginner">("proficient");
  const [newSkillCategory, setNewSkillCategory] = useState("Tools");

  const toggleTab = (tab: ActiveTab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const handlePersonalChange = (field: keyof CVData["personal"], value: string) => {
    onChange({
      ...cv,
      personal: {
        ...cv.personal,
        [field]: value,
      },
    });
  };

  // --- Experience Handlers ---
  const handleExperienceChange = (index: number, field: keyof CVExperience, value: any) => {
    const updated = [...cv.experience];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...cv, experience: updated });
  };

  const addExperience = () => {
    const newExp: CVExperience = {
      company: "New Company",
      role: "New Role",
      start: "Jan 2024",
      end: "Present",
      bullets: ["Developed software solutions.", "Optimized performance by 15%."],
    };
    onChange({ ...cv, experience: [newExp, ...cv.experience] });
  };

  const removeExperience = (index: number) => {
    onChange({ ...cv, experience: cv.experience.filter((_, i) => i !== index) });
  };

  const handleExperienceBulletChange = (expIndex: number, bulletIndex: number, value: string) => {
    const updatedExp = [...cv.experience];
    const updatedBullets = [...updatedExp[expIndex].bullets];
    updatedBullets[bulletIndex] = value;
    updatedExp[expIndex] = { ...updatedExp[expIndex], bullets: updatedBullets };
    onChange({ ...cv, experience: updatedExp });
  };

  const addExperienceBullet = (expIndex: number) => {
    const updatedExp = [...cv.experience];
    updatedExp[expIndex] = {
      ...updatedExp[expIndex],
      bullets: [...updatedExp[expIndex].bullets, "New achievement highlight."],
    };
    onChange({ ...cv, experience: updatedExp });
  };

  const removeExperienceBullet = (expIndex: number, bulletIndex: number) => {
    const updatedExp = [...cv.experience];
    updatedExp[expIndex] = {
      ...updatedExp[expIndex],
      bullets: updatedExp[expIndex].bullets.filter((_, i) => i !== bulletIndex),
    };
    onChange({ ...cv, experience: updatedExp });
  };

  // --- Projects Handlers ---
  const handleProjectChange = (index: number, field: keyof CVProject, value: any) => {
    const updated = [...cv.projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...cv, projects: updated });
  };

  const addProject = () => {
    const newProj: CVProject = {
      name: "custom-project",
      cv_title: "Custom Project Title",
      description: "Short description of the custom project.",
      tech: ["React", "Node.js"],
      repo_url: "",
      highlights: ["Implemented full stack features.", "Secured user authentication."],
    };
    onChange({ ...cv, projects: [newProj, ...cv.projects] });
  };

  const removeProject = (index: number) => {
    onChange({ ...cv, projects: cv.projects.filter((_, i) => i !== index) });
  };

  const handleProjectHighlightChange = (projIndex: number, hlIndex: number, value: string) => {
    const updatedProjs = [...cv.projects];
    const updatedHls = [...updatedProjs[projIndex].highlights];
    updatedHls[hlIndex] = value;
    updatedProjs[projIndex] = { ...updatedProjs[projIndex], highlights: updatedHls };
    onChange({ ...cv, projects: updatedProjs });
  };

  const addProjectHighlight = (projIndex: number) => {
    const updatedProjs = [...cv.projects];
    updatedProjs[projIndex] = {
      ...updatedProjs[projIndex],
      highlights: [...updatedProjs[projIndex].highlights, "Key project feature implemented."],
    };
    onChange({ ...cv, projects: updatedProjs });
  };

  const removeProjectHighlight = (projIndex: number, hlIndex: number) => {
    const updatedProjs = [...cv.projects];
    updatedProjs[projIndex] = {
      ...updatedProjs[projIndex],
      highlights: updatedProjs[projIndex].highlights.filter((_, i) => i !== hlIndex),
    };
    onChange({ ...cv, projects: updatedProjs });
  };

  // --- Skills Handlers ---
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    // Check if skill already exists
    const exists = cv.skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) {
      setNewSkillName("");
      return;
    }

    const newSkill: CVSkill = {
      name: newSkillName.trim(),
      level: newSkillLevel,
      source: "manual",
      category: newSkillCategory,
    };

    onChange({
      ...cv,
      skills: [...cv.skills, newSkill],
    });
    setNewSkillName("");
  };

  const handleUpdateSkillLevel = (index: number, newLevel: CVSkill["level"]) => {
    const updated = [...cv.skills];
    updated[index] = { ...updated[index], level: newLevel };
    onChange({ ...cv, skills: updated });
  };

  const handleRemoveSkill = (index: number) => {
    onChange({
      ...cv,
      skills: cv.skills.filter((_, i) => i !== index),
    });
  };

  // --- Education Handlers ---
  const handleEducationChange = (index: number, field: keyof CVEducation, value: string) => {
    const updated = [...cv.education];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...cv, education: updated });
  };

  const addEducation = () => {
    const newEdu: CVEducation = {
      institution: "University Name",
      degree: "BS",
      field: "Computer Science",
      start: "2020",
      end: "2024",
      gpa: "",
    };
    onChange({ ...cv, education: [...cv.education, newEdu] });
  };

  const removeEducation = (index: number) => {
    onChange({ ...cv, education: cv.education.filter((_, i) => i !== index) });
  };

  // --- Certs & Languages Handlers ---
  const handleCertChange = (index: number, field: keyof CVCertification, value: string) => {
    const updated = [...cv.certifications];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...cv, certifications: updated });
  };

  const addCert = () => {
    const newCert: CVCertification = { name: "AWS Developer", issuer: "Amazon", date: "2023" };
    onChange({ ...cv, certifications: [...cv.certifications, newCert] });
  };

  const removeCert = (index: number) => {
    onChange({ ...cv, certifications: cv.certifications.filter((_, i) => i !== index) });
  };

  const handleLangChange = (index: number, field: keyof CVLanguage, value: string) => {
    const updated = [...cv.languages];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...cv, languages: updated });
  };

  const addLang = () => {
    const newLang: CVLanguage = { name: "Spanish", level: "Conversational" };
    onChange({ ...cv, languages: [...cv.languages, newLang] });
  };

  const removeLang = (index: number) => {
    onChange({ ...cv, languages: cv.languages.filter((_, i) => i !== index) });
  };

  // --- Section Ordering Handlers ---
  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...sectionOrder];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    // Swap
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    onChangeSectionOrder(newOrder);
  };

  // Accordion Header CSS helper
  const accordionHeaderClass = (tab: ActiveTab) =>
    `w-full flex items-center justify-between p-4 font-bold text-left rounded-xl transition-all cursor-pointer ${
      activeTab === tab
        ? "bg-zinc-800 text-indigo-400 border border-zinc-700"
        : "bg-zinc-900/40 text-zinc-300 border border-zinc-850 hover:bg-zinc-900"
    }`;

  return (
    <div className="space-y-4">
      {/* 1. Personal Info Section */}
      <div>
        <button onClick={() => toggleTab("personal")} className={accordionHeaderClass("personal")}>
          <span>1. Personal & Contact Details</span>
          <svg className={`h-4 w-4 transition-transform ${activeTab === "personal" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
        {activeTab === "personal" && (
          <div className="mt-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 space-y-4 animate-fade-in text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={cv.personal?.name || ""}
                  onChange={(e) => handlePersonalChange("name", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={cv.personal?.email || ""}
                  onChange={(e) => handlePersonalChange("email", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={cv.personal?.phone || ""}
                  onChange={(e) => handlePersonalChange("phone", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Location</label>
                <input
                  type="text"
                  value={cv.personal?.location || ""}
                  onChange={(e) => handlePersonalChange("location", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={cv.personal?.linkedin || ""}
                  onChange={(e) => handlePersonalChange("linkedin", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">GitHub Profile</label>
                <input
                  type="url"
                  value={cv.personal?.github || ""}
                  onChange={(e) => handlePersonalChange("github", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Professional Summary</label>
              <textarea
                rows={4}
                value={cv.personal?.summary || ""}
                onChange={(e) => handlePersonalChange("summary", e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg p-3 text-zinc-200 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Section Ordering */}
      <div>
        <button onClick={() => toggleTab("order")} className={accordionHeaderClass("order")}>
          <span>2. Resume Section Ordering</span>
          <svg className={`h-4 w-4 transition-transform ${activeTab === "order" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
        {activeTab === "order" && (
          <div className="mt-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 space-y-2 animate-fade-in text-xs">
            <p className="text-[10px] text-zinc-500 mb-3 leading-normal">
              Adjust the visual layout order of major content blocks in your finished document.
            </p>
            {sectionOrder.map((sec, idx) => (
              <div key={sec} className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/60 font-medium">
                <span className="capitalize text-zinc-300">{sec}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(idx, "down")}
                    disabled={idx === sectionOrder.length - 1}
                    className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Work Experience */}
      <div>
        <button onClick={() => toggleTab("experience")} className={accordionHeaderClass("experience")}>
          <span>3. Work Experience ({cv.experience?.length || 0})</span>
          <svg className={`h-4 w-4 transition-transform ${activeTab === "experience" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
        {activeTab === "experience" && (
          <div className="mt-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 space-y-6 animate-fade-in text-xs">
            <button
              type="button"
              onClick={addExperience}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-zinc-700 rounded-lg hover:border-indigo-500 hover:bg-indigo-500/5 text-zinc-300 font-semibold cursor-pointer"
            >
              + Add Work Entry
            </button>

            {cv.experience?.map((exp, idx) => (
              <div key={idx} className="p-4 border border-zinc-800 bg-zinc-950/40 rounded-xl space-y-4 relative group">
                <button
                  type="button"
                  onClick={() => removeExperience(idx)}
                  className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 font-bold text-sm cursor-pointer"
                  title="Delete Entry"
                >
                  Remove
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-500 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1">Role Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-500 mb-1">Start Date</label>
                    <input
                      type="text"
                      placeholder="e.g. Jan 2021"
                      value={exp.start}
                      onChange={(e) => handleExperienceChange(idx, "start", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1">End Date</label>
                    <input
                      type="text"
                      placeholder="e.g. Present or Dec 2023"
                      value={exp.end}
                      onChange={(e) => handleExperienceChange(idx, "end", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                    />
                  </div>
                </div>

                {/* Bullets sublist */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-400">Achievement Highlights:</span>
                    <button
                      type="button"
                      onClick={() => addExperienceBullet(idx)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold text-[10px]"
                    >
                      + Add Highlight
                    </button>
                  </div>
                  <div className="space-y-2">
                    {exp.bullets?.map((bullet, bulletIdx) => (
                      <div key={bulletIdx} className="flex gap-2">
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => handleExperienceBulletChange(idx, bulletIdx, e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-zinc-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeExperienceBullet(idx, bulletIdx)}
                          className="text-zinc-600 hover:text-red-400 text-xs self-start mt-2"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Projects */}
      <div>
        <button onClick={() => toggleTab("projects")} className={accordionHeaderClass("projects")}>
          <span>4. Projects ({cv.projects?.length || 0})</span>
          <svg className={`h-4 w-4 transition-transform ${activeTab === "projects" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
        {activeTab === "projects" && (
          <div className="mt-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 space-y-6 animate-fade-in text-xs">
            <button
              type="button"
              onClick={addProject}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-zinc-700 rounded-lg hover:border-indigo-500 hover:bg-indigo-500/5 text-zinc-300 font-semibold cursor-pointer"
            >
              + Add Custom Project
            </button>

            {cv.projects?.map((proj, idx) => (
              <div key={idx} className="p-4 border border-zinc-800 bg-zinc-950/40 rounded-xl space-y-4 relative group">
                <button
                  type="button"
                  onClick={() => removeProject(idx)}
                  className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 font-bold text-sm cursor-pointer"
                >
                  Remove
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-500 mb-1">Project Name (Repo/Internal)</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1">CV Title</label>
                    <input
                      type="text"
                      value={proj.cv_title || ""}
                      onChange={(e) => handleProjectChange(idx, "cv_title", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-500 mb-1">Repository URL</label>
                    <input
                      type="url"
                      value={proj.repo_url || ""}
                      onChange={(e) => handleProjectChange(idx, "repo_url", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1">Tech Stack (comma separated)</label>
                    <input
                      type="text"
                      value={proj.tech ? proj.tech.join(", ") : ""}
                      onChange={(e) => {
                        const arr = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                        handleProjectChange(idx, "tech", arr);
                      }}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-500 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={proj.description || ""}
                    onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-zinc-200 resize-none"
                  />
                </div>

                {/* Highlights sublist */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-400">Highlights / Accomplishments:</span>
                    <button
                      type="button"
                      onClick={() => addProjectHighlight(idx)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold text-[10px]"
                    >
                      + Add Highlight
                    </button>
                  </div>
                  <div className="space-y-2">
                    {proj.highlights?.map((hl, hlIdx) => (
                      <div key={hlIdx} className="flex gap-2">
                        <textarea
                          rows={2}
                          value={hl}
                          onChange={(e) => handleProjectHighlightChange(idx, hlIdx, e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-zinc-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeProjectHighlight(idx, hlIdx)}
                          className="text-zinc-600 hover:text-red-400 text-xs self-start mt-2"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Skills */}
      <div>
        <button onClick={() => toggleTab("skills")} className={accordionHeaderClass("skills")}>
          <span>5. Skills & Competencies ({cv.skills?.length || 0})</span>
          <svg className={`h-4 w-4 transition-transform ${activeTab === "skills" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
        {activeTab === "skills" && (
          <div className="mt-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 space-y-4 animate-fade-in text-xs">
            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="flex flex-wrap gap-2 items-end bg-zinc-950 p-3 rounded-lg border border-zinc-850">
              <div className="flex-1 min-w-[150px]">
                <label htmlFor="new-skill-input" className="block text-[10px] text-zinc-500 mb-1">Add Skill Tag</label>
                <input
                  id="new-skill-input"
                  type="text"
                  placeholder="e.g. Next.js, Docker"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200"
                />
              </div>
              <div>
                <label htmlFor="new-skill-category" className="block text-[10px] text-zinc-500 mb-1">Category</label>
                <select
                  id="new-skill-category"
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Languages">Languages</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Databases">Databases</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Design & Prototyping">Design & Prototyping</option>
                  <option value="Tools">Tools</option>
                  <option value="Testing">Testing</option>
                  <option value="Concepts">Concepts</option>
                </select>
              </div>
              <div>
                <label htmlFor="new-skill-level" className="block text-[10px] text-zinc-500 mb-1">Proficiency</label>
                <select
                  id="new-skill-level"
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="beginner">Beginner</option>
                  <option value="familiar">Familiar</option>
                  <option value="proficient">Proficient</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1 rounded-lg text-white font-semibold cursor-pointer h-[28px]"
              >
                Add
              </button>
            </form>

            <p className="text-[10px] text-zinc-500 leading-normal pl-0.5">
              💡 Tip: Click any skill tag below to cycle its proficiency level.
            </p>

            {/* Render Skill Tags Grouped by Category */}
            <div className="space-y-4 pt-2">
              {[
                "Languages",
                "Frontend",
                "Backend",
                "Databases",
                "Mobile",
                "Design & Prototyping",
                "Tools",
                "Testing",
                "Concepts"
              ].map(category => {
                const catSkills = cv.skills.filter(s => s.category === category);
                if (catSkills.length === 0) return null;
                return (
                  <div key={category} className="space-y-1.5 p-3 rounded-lg border border-zinc-850/60 bg-zinc-900/10">
                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {cv.skills.map((skill, idx) => {
                        if (skill.category !== category) return null;
                        return (
                          <SkillTag
                            key={idx}
                            skill={skill}
                            onUpdateLevel={(level) => handleUpdateSkillLevel(idx, level)}
                            onRemove={() => handleRemoveSkill(idx)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {/* Other/Uncategorized Skills */}
              {(() => {
                const standardCategories = [
                  "Languages", "Frontend", "Backend", "Databases", "Mobile",
                  "Design & Prototyping", "Tools", "Testing", "Concepts"
                ];
                const hasUncategorized = cv.skills.some(s => !s.category || !standardCategories.includes(s.category));
                if (!hasUncategorized) return null;
                return (
                  <div className="space-y-1.5 p-3 rounded-lg border border-zinc-850/60 bg-zinc-900/10">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Other Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {cv.skills.map((skill, idx) => {
                        if (skill.category && standardCategories.includes(skill.category)) return null;
                        return (
                          <SkillTag
                            key={idx}
                            skill={skill}
                            onUpdateLevel={(level) => handleUpdateSkillLevel(idx, level)}
                            onRemove={() => handleRemoveSkill(idx)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* 6. Education */}
      <div>
        <button onClick={() => toggleTab("education")} className={accordionHeaderClass("education")}>
          <span>6. Education Details ({cv.education?.length || 0})</span>
          <svg className={`h-4 w-4 transition-transform ${activeTab === "education" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
        {activeTab === "education" && (
          <div className="mt-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 space-y-6 animate-fade-in text-xs">
            <button
              type="button"
              onClick={addEducation}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-zinc-700 rounded-lg hover:border-indigo-500 hover:bg-indigo-500/5 text-zinc-300 font-semibold cursor-pointer"
            >
              + Add Education Entry
            </button>

            {cv.education?.map((edu, idx) => (
              <div key={idx} className="p-4 border border-zinc-800 bg-zinc-950/40 rounded-xl space-y-4 relative group">
                <button
                  type="button"
                  onClick={() => removeEducation(idx)}
                  className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 font-bold text-sm cursor-pointer"
                >
                  Remove
                </button>

                <div>
                  <label className="block text-zinc-500 mb-1">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-500 mb-1">Degree (e.g. BS)</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1">Field of Study</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => handleEducationChange(idx, "field", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1">GPA (Optional)</label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => handleEducationChange(idx, "gpa", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-500 mb-1">Start Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2018"
                      value={edu.start}
                      onChange={(e) => handleEducationChange(idx, "start", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1">End Year (or Expected)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2022"
                      value={edu.end}
                      onChange={(e) => handleEducationChange(idx, "end", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-200"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Certs & Languages */}
      <div>
        <button onClick={() => toggleTab("certs-langs")} className={accordionHeaderClass("certs-langs")}>
          <span>7. Certifications & Languages</span>
          <svg className={`h-4 w-4 transition-transform ${activeTab === "certs-langs" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
        {activeTab === "certs-langs" && (
          <div className="mt-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 space-y-6 animate-fade-in text-xs">
            {/* Certifications Sub-section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Certifications</h4>
                <button
                  type="button"
                  onClick={addCert}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  + Add Certification
                </button>
              </div>
              
              <div className="space-y-3">
                {cv.certifications?.map((cert, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850 relative group">
                    <button
                      type="button"
                      onClick={() => removeCert(idx)}
                      className="absolute top-1 right-2 text-zinc-600 hover:text-red-400 font-bold"
                    >
                      ×
                    </button>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-0.5">Cert Name</label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => handleCertChange(idx, "name", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded px-2 py-1 text-zinc-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-0.5">Issuer</label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => handleCertChange(idx, "issuer", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded px-2 py-1 text-zinc-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-0.5">Date</label>
                      <input
                        type="text"
                        value={cert.date}
                        onChange={(e) => handleCertChange(idx, "date", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded px-2 py-1 text-zinc-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages Sub-section */}
            <div className="space-y-4 pt-4 border-t border-zinc-850">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Languages</h4>
                <button
                  type="button"
                  onClick={addLang}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  + Add Language
                </button>
              </div>

              <div className="space-y-3">
                {cv.languages?.map((lang, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850 relative group">
                    <button
                      type="button"
                      onClick={() => removeLang(idx)}
                      className="absolute top-1 right-2 text-zinc-600 hover:text-red-400 font-bold"
                    >
                      ×
                    </button>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-0.5">Language</label>
                      <input
                        type="text"
                        value={lang.name}
                        onChange={(e) => handleLangChange(idx, "name", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded px-2 py-1 text-zinc-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-0.5">Proficiency Level</label>
                      <input
                        type="text"
                        value={lang.level}
                        onChange={(e) => handleLangChange(idx, "level", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded px-2 py-1 text-zinc-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
