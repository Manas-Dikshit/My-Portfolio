// Add JSON-LD structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": portfolioData.personal.name,
  "url": siteConfig.url,
  "email": portfolioData.contact.email,
  "jobTitle": portfolioData.personal.title,
  "description": portfolioData.personal.bio,
  "sameAs": [
    portfolioData.social.github,
    portfolioData.social.linkedin,
    portfolioData.social.instagram,
    portfolioData.social.leetcode,
    portfolioData.social.gfg
  ]
};
import type { Metadata } from "next";
import "@/styles/globals.css";
import Providers from "@/components/providers";
import { geistMono, geistSans, incognito, pixelifySans } from "@/assets/fonts";
import { cn } from "@/lib/utils";
import MotionConfigWrapper from "@/components/motion-config";
import { siteConfig } from "@/config/site";
import { portfolioData } from "@/lib/portfolio-data";
import Script from "next/script";
import env from "@/config/env";
import FloatingAvatar from "@/components/floating-avatar";



export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  keywords: [
    "portfolio",
    "developer portfolio",
    "software developer",
    "fullstack",
    ...portfolioData.skills.map((s) => s.name.toLowerCase()),
    ...portfolioData.projects.map((p) => p.title.toLowerCase()),
  ],
  authors: [{ name: siteConfig.title }],
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: "/og-image.png",
        alt: `${siteConfig.title} – ${siteConfig.description}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    // twitter handle if provided (expects @handle)
    creator: siteConfig.twitter ? siteConfig.twitter.replace(/https?:\/\//, "") : undefined,
  },
  // Google site verification
  other: {
    "google-site-verification": "googlebde8e6ea00c8a048.html"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "mx-auto font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
          incognito.variable,
          pixelifySans.variable,
        )}
      >
        <Providers>
          <MotionConfigWrapper>
            <FloatingAvatar />
            {children}
          </MotionConfigWrapper>
        </Providers>

        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        />
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
