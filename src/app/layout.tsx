import type { Metadata } from "next";
import { StructuredData } from "@/components/structured-data";
import { buildOrganizationJsonLd, buildPageMetadata, buildWebsiteJsonLd } from "@/lib/seo";
import { getSiteUrl, siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  applicationName: siteConfig.englishName,
  ...buildPageMetadata({
    description: siteConfig.description,
    path: "/",
    keywords: siteConfig.keywords,
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = [buildOrganizationJsonLd(), buildWebsiteJsonLd()];

  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full font-sans text-[color:var(--color-text)]">
        <StructuredData data={structuredData} />
        {children}
      </body>
    </html>
  );
}
