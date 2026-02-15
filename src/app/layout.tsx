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
import { getOrganizationSettings } from "@/app/actions/organization-actions";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch user and org settings in parallel (both are cached)
  // Wrap in defensive try-catch — Supabase may throw AuthApiError on expired sessions
  let user = null;
  let orgResult: any = { success: false };
  try {
    [user, orgResult] = await Promise.all([
      getUserSession(),
      getOrganizationSettings()
    ]);
  } catch {
    // Expected when session is expired — silently fall through
  }
  const isClient = user?.role === 'CLIENTE';
  const orgData = orgResult?.success ? orgResult.data : null;

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
            <DynamicBrand
              primaryColor={orgData?.primaryColor}
              primaryTextColor={orgData?.primaryTextColor}
              sidebarColor={orgData?.sidebarColor}
              sidebarTextColor={orgData?.sidebarTextColor}
              borderRadius={orgData?.borderRadius}
            />
            {children}
          </MainLayout>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html >
  );
}

