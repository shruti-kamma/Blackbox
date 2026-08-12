import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Nav } from "@/components/nav";
import { PortalSelectProvider } from "@/components/a11y/portal-select-provider";
import { A11Y_COOKIE_NAME } from "@/lib/a11y/cookie";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blackbox Jobs",
  description: "An accessibility-first hiring portal for persons with disabilities.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-a11y={a11yMode || undefined}
    >
      <body className="min-h-full flex flex-col">
        <PortalSelectProvider>
          <Nav />
          {children}
        </PortalSelectProvider>
      </body>
    </html>
  );
}
