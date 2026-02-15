import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { AnalyticsTags } from "@/components/Analytics";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "DeepSpeaker",
  description: "A daily editorial report on emerging music artists in the US, Canada, and UK."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable}`}>
      <body>
        {children}
        <AnalyticsTags />
      </body>
    </html>
  );
}
