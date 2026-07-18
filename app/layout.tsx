import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Phoneme Activity Builder",
    template: "%s | Phoneme Activity Builder",
  },
  description:
    "A frontend builder for creating, previewing and downloading phoneme-based Wordle and Word Search classroom activities.",
  keywords: [
    "phoneme",
    "speech pathology",
    "Wordle",
    "word search",
    "classroom activities",
    "education",
  ],
  authors: [
    {
      name: "Rudra Pandey",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <div className="site-wrapper">
            <Header />

            <div className="site-content">{children}</div>

            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
