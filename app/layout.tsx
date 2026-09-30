import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ClipMitra AI — Ek video se poora content",
  description:
    "Upload one long video → AI finds the best moments → get short clips, captions, hooks and hashtags automatically.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className={inter.variable}>
      <body className="font-sans bg-base text-white min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
