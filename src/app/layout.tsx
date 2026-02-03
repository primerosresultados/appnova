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
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicBrand } from "@/components/theme/DynamicBrand";

// import { PWAInit } from "@/components/pwa/PWAInit"; // Disabled until PWA is properly configured

export const metadata: Metadata = {
  title: "Nova Partners | Agency OS",
  description: "Central operation hub for high-performance agencies",
  manifest: "/manifest.json",
};

import { getUserSession } from "@/app/actions/auth-actions";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserSession();
  const isClient = user?.role === 'CLIENTE';

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* <PWAInit /> */}
          <MainLayout initialIsClient={isClient}>
            <DynamicBrand />
            {children}
          </MainLayout>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html >
  );
}
