import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { AnalyticsTags } from "@/components/Analytics";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "DeepSpeaker",
  description:
    "Records worth your time. Stories behind the sound. Music discovery and listening guides from Deep Speaker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <AnalyticsTags />
      </body>
    </html>
  );
}
