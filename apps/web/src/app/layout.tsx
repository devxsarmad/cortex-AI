import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cortex AI",
  description: "AI healthcare knowledge assistant learning project",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  colorScheme: "light"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
