import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/app-shell";

const spaceGroteskHeading = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        spaceGroteskHeading.variable,
        "font-sans"
      )}
      suppressHydrationWarning
    >
      <body className="h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
