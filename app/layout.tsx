import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SplashScreen from "@/components/ui/SplashScreen";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillVitae",
  description:
    "Build ATS-optimized resumes and CVs directly from your GitHub repos and LinkedIn profile. SkillVitae uses AI to extract real skills from your code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-poppins)]">
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
