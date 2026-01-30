import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { MainLayout } from "@/components/layout/MainLayout";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Nova Partners | Agency OS",
  description: "Central operation hub for high-performance agencies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <MainLayout>
          {children}
        </MainLayout>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
