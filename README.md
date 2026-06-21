# SkillVitae

SkillVitae is a full-stack, serverless web application that auto-generates ATS optimized resumes by analyzing a user's GitHub repositories, LinkedIn profile, or existing PDF resumes. SkillVitae assembles a professional profile and tailors resumes by analyzing job requirements and identifying ATS keywords, providing actionable insights, keyword gap analysis, and intelligent bullet point to match specific job descriptions using advanced LLM pipelines.

## Core Architecture & Technical Highlights

- **Automated Resume Generation:** Automatically ingests and parses data from GitHub repository links, LinkedIn profile URLs or profile pdf to construct a comprehensive base CV without manual data entry.
- **Multi-Provider AI Pipeline:** Architected a dynamic AI pipeline that routes specialized tasks to the most efficient models:
  - **Gemini 1.5 Flash:** Dedicated to deep repository analysis and code context extraction.
  - **Groq:** Handles fast CV assembly, text generation, and job tailoring.
  - **OpenRouter:** Configured as an automatic fallback to ensure high availability and reliability.
- **Deterministic ATS Scoring Engine:** Implemented a strict, code-based (non-AI) ATS scoring engine. It calculates keyword match rates, validates section detection, ensures date format consistency, and measures the density of quantified achievements, providing an itemized breakdown of the score.
- **Two-Phase GitHub API Strategy:** Designed an optimized integration with GitHub that first fetches repository metadata, followed by selective, targeted fetches of detailed file contents, minimizing API limits and latency.
- **Serverless & Local Storage Persistence:** The application leverages browser local storage for complete data persistence. This keeps the application entirely serverless and lightweight, with zero database management or authentication overhead.

## Features

- **Base CV Management:** Auto-generate or manually edit your foundational resume data.
- **AI-Driven Job Tailoring:** Input a job posting URL (to automatically scrape the description) or paste the text directly. The AI engine aligns your experience with the job requirements.
- **ATS Gap Analysis:** Instantly see which critical keywords from the job description are missing in your CV and which ones are successfully matched based on the deterministic engine.
- **Smart Rewriting Suggestions:** Get AI-suggested rewrites for your experience bullets and project highlights to better reflect the desired qualifications and action verbs.
- **Version Tracking & Comparison:** Save multiple tailored versions of your CV for different job applications. Compare different versions side-by-side to review changes.
- **Live PDF Preview & Export:** Preview your tailored resume in real-time. Customize the layout with various templates (ATS-safe, classic, minimal), adjust fonts, margins, and section order, and export directly to PDF.

## Tech Stack

- **Framework:** Next.js
- **UI & Styling:** React, Tailwind CSS
- **Language:** TypeScript
- **AI Integrations:** Gemini (via Google AI Studio), Groq, OpenRouter
- **PDF Generation:** jspdf
- **Web Scraping:** cheerio
- **Drag and Drop:** @dnd-kit

## Getting Started

### Prerequisites

Ensure you have Node.js and npm (or yarn/pnpm/bun) installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory:

```bash
git clone <repository-url>
cd skillvitae
```

2. Install the dependencies:

```bash
npm install
```

### Environment Variables

Copy the `.env.example` to `.env.local` and populate the necessary keys (e.g., API keys for Gemini, Groq, OpenRouter, and GitHub):

```bash
cp .env.example .env.local
```

### Running the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

This application is deployed and optimized for hosting on Vercel, the platform from the creators of Next.js. The CI/CD pipeline automatically builds and deploys updates when pushed to the main repository.

## Project Structure

- `app/`: Next.js App Router pages and API routes.
  - `api/`: API routes for backend tasks (e.g., CV assembly, integrations).
  - `building/`: CV building workspace and templates.
  - `editor/`: Base CV editing workspace.
  - `onboard/`: Initial onboarding flow for parsing GitHub, LinkedIn, and PDF data.
  - `select-repos/`: Workspace for selecting GitHub repositories to include.
  - `tailor/`: Job tailoring workspace with insights and live preview.
  - `test-github/`: Testing utilities for GitHub integration.
- `components/`: Reusable React components for UI, editors, and previews.
  - `editor/`: Components specific to the base CV editor.
  - `onboard/`: Components for the onboarding flow.
  - `tailor/`: Components for the job tailoring workspace.
  - `ui/`: Generic reusable UI components (e.g., buttons, cards, animations).
- `lib/`: Utility functions for CV processing, deterministic ATS scoring, API integrations, and local storage management.
- `public/`: Static assets such as images and icons.

## License

This project is private and proprietary unless otherwise specified.
