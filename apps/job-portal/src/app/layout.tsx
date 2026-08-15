import type { Metadata } from "next";
import { Lexend, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeToggleFloating } from "@/components/theme-toggle-floating";
import { A11Y_COOKIE_NAME } from "@/lib/a11y/cookie";

// Root shell shared by both the NGO landing page (this route, "/") and
// everything under the (app) route group. Nav + PortalSelectProvider
// live in (app)/layout.tsx instead of here, since the NGO placeholder
// isn't part of the job-portal/rankings app and shouldn't show its nav.
const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blackbox Global Foundation",
  description:
    "Building the data, platforms, networks, and pathways that turn disability inclusion into participation, education, employment, and economic opportunity.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read server-side so the accessibility mode is present at first paint —
  // reading it only client-side (e.g. from localStorage) would flash the
  // default presentation on every navigation before correcting itself.
  const store = await cookies();
  const a11yMode = store.get(A11Y_COOKIE_NAME)?.value;

  return (
    <html
      lang="en"
      className={`${lexend.variable} ${geistMono.variable} h-full antialiased`}
      data-a11y={a11yMode || undefined}
    >
      <body className="min-h-full flex flex-col relative">
        {children}
        <ThemeToggleFloating />
      </body>
    </html>
  );
}
