import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const roomSans = Manrope({ variable: "--font-room-sans", subsets: ["latin"] });
const roomMono = JetBrains_Mono({ variable: "--font-room-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Split Room — Local A/B experiment bench",
  description: "Simulate weighted variants and inspect conversion rates locally.",
  metadataBase: new URL("https://ab-testing.bookchaowalit.com"),
  alternates: { canonical: "https://ab-testing.bookchaowalit.com" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${roomSans.variable} ${roomMono.variable}`}><body><Analytics /><SpeedInsights />{children}</body></html>;
}
