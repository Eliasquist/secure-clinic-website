import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secure Clinic Journal | Trygg Journalløsning for Klinikker",
  description: "Den moderne og trygge journalløsningen for norske klinikker. Innebygd GDPR-compliance, kryptering og sømløs pasienthåndtering.",
  keywords: "klinikkjournal, helseprogramvare, GDPR, norsk helsevesen, pasienthåndtering, kryptering, sikre pasientjournaler",
  openGraph: {
    title: "Secure Clinic Journal",
    description: "Den moderne og trygge journalløsningen for norske klinikker.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
