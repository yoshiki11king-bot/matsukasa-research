import type { Metadata } from "next";
import { getSiteUrl, siteConfig } from "@/lib/site";

type MetadataOptions = {
  title?: string;
  description: string;
  path?: string;
  type?: "website" | "article" | "profile";
  keywords?: string[];
  noindex?: boolean;
  imageUrl?: string;
};

export function getAbsoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  type = "website",
  keywords = [],
  noindex = false,
  imageUrl,
}: MetadataOptions): Metadata {
  const absoluteUrl = getAbsoluteUrl(path);
  const absoluteImageUrl = imageUrl ? getAbsoluteUrl(imageUrl) : getAbsoluteUrl("/opengraph-image");
  const resolvedTitle = title ?? siteConfig.name;

  const metadata: Metadata = {
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    alternates: {
      canonical: path,
    },
    authors: [
      {
        name: siteConfig.name,
        url: getSiteUrl(),
      },
    ],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "research",
    robots: noindex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title: resolvedTitle,
      description,
      url: absoluteUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [
        {
          url: absoluteImageUrl,
          alt: `${siteConfig.name} のOG画像`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [absoluteImageUrl],
    },
  };

  if (title) {
    metadata.title = title;
  }

  return metadata;
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    alternateName: siteConfig.englishName,
    url: getSiteUrl(),
    logo: getAbsoluteUrl("/matsukasa-logo.png"),
    description: siteConfig.description,
    email: siteConfig.contactEmail,
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: siteConfig.englishName,
    url: getSiteUrl(),
    inLanguage: "ja-JP",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/articles?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
