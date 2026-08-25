import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from 'next-themes';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZalFoot — Réservez votre terrain de football",
  description:
    "Réservez votre terrain de football en 30 secondes. Terrains synthétiques modernes, éclairés et conviviaux. Aucun compte requis pour consulter les disponibilités.",
  keywords: [
    "ZalFoot",
    "football",
    "terrain",
    "réservation",
    "foot7",
    "foot sal",
    "terrain synthétique",
    "Sénégal",
  ],
  authors: [{ name: "ZalFoot" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "ZalFoot — Réservez votre terrain de football",
    description:
      "Réservez votre terrain de football en 30 secondes. Terrains synthétiques modernes avec éclairage.",
    siteName: "ZalFoot",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
