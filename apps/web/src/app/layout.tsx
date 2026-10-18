import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";

const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ibm-plex-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ibm-plex-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Cortex AI",
  description: "AI healthcare knowledge assistant learning project",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#0F1B2D",
  colorScheme: "light"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
