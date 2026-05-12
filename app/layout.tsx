import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "EmailCamp | High-Signal Command Console",
  description: "Production-grade enterprise email campaign orchestration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
        <head>
          <script src="/policy.js" />
        </head>
        <body className="font-sans antialiased min-h-screen bg-background text-foreground selection:bg-emerald-500/30">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
