import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReviewPulse SaaS - E-Commerce Review & Flaw Intelligence",
  description: "AI-Powered Customer Review Flaw Extractor & CSAT Rating Analytics",
  metadataBase: new URL("https://046-paw-tubes-gjac.vercel.app"),
  openGraph: {
    title: "ReviewPulse SaaS",
    description: "AI-Powered Customer Review Flaw Extractor & CSAT Rating Analytics",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReviewPulse SaaS",
    description: "AI-Powered Customer Review Flaw Extractor & CSAT Rating Analytics",
  },
};

export const viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
