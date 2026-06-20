# SkillVitae

SkillVitae is an AI-powered CV and resume tailoring web application built with Next.js. It helps users construct a base professional profile and intelligently tailor their resumes to match specific job descriptions. By analyzing job requirements and identifying ATS (Applicant Tracking System) keywords, SkillVitae provides actionable insights, keyword gap analysis, and intelligent bullet point rewrites to maximize interview chances.

## Features

- **Base CV Management:** Create, store, and manage your foundational resume data.
- **AI-Driven Job Tailoring:** Input a job posting URL (to automatically scrape the description) or paste the text directly. The AI engine aligns your experience with the job requirements.
- **ATS Gap Analysis:** Instantly see which critical keywords from the job description are missing in your CV and which ones are successfully matched.
- **Smart Rewriting Suggestions:** Get AI-suggested rewrites for your experience bullets and project highlights to better reflect the desired qualifications and action verbs.
- **Version Tracking & Comparison:** Save multiple tailored versions of your CV for different job applications. Compare different versions side-by-side to review changes.
- **Live PDF Preview & Export:** Preview your tailored resume in real-time. Customize the layout with various templates (ATS-safe, classic, minimal), adjust fonts, margins, and section order, and export directly to PDF.

## Tech Stack

- **Framework:** Next.js
- **UI & Styling:** React, Tailwind CSS
- **Language:** TypeScript
- **PDF Generation:** jspdf
- **Web Scraping (Job Descriptions):** cheerio
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

If there are required environment variables (e.g., for AI integrations or database connections), copy the `.env.example` to `.env.local` and populate the necessary keys:

```bash
cp .env.example .env.local
```

### Running the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/`: Next.js App Router pages and API routes.
  - `editor/`: Base CV editing workspace.
  - `tailor/`: Job tailoring workspace with insights and live preview.
  - `onboard/`: Initial onboarding flow for new users.
- `components/`: Reusable React components for UI, editors, and previews.
- `lib/`: Utility functions for CV processing, ATS scoring, and local storage management.

## Deployment

This application is deployed and optimized for hosting on Vercel, the platform from the creators of Next.js. The CI/CD pipeline automatically builds and deploys updates when pushed to the main repository.

## License

This project is private and proprietary unless otherwise specified.
