import type { Metadata } from "next";
import { 
  Geist_Mono,
  Inter,
  Sora,
  Noto_Serif_Tamil,
  Noto_Serif_Sinhala,
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/app-shell";
import { SessionProvider } from "next-auth/react";

// Fonts - English
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const sora = Sora({ subsets: ["latin"], variable: "--font-heading" });

// Fonts - Tamil & Sinhala
const notoSerifTamil = Noto_Serif_Tamil({ subsets: ["tamil"], variable: "--font-tamil" });
const notoSerifSinhala = Noto_Serif_Sinhala({ subsets: ["sinhala"], variable: "--font-sinhala" });

export const metadata: Metadata = {
  title: "Kapruka AI Shopping Assistant",
  description: "AI-powered shopping experience for Kapruka.com - Sri Lanka's leading online gift shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        inter.variable,
        geistMono.variable,
        sora.variable,
        notoSerifTamil.variable,
        notoSerifSinhala.variable,
        "font-sans"
      )}
      suppressHydrationWarning
    >
      <body className="h-full md:h-screen overflow-hidden">
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
