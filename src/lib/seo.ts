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

type JsonLdType =
  | "AboutPage"
  | "CollectionPage"
  | "ContactPage"
  | "ProfilePage"
  | "SearchResultsPage"
  | "WebPage";

type BreadcrumbItem = {
  name: string;
  path: string;
};

type ItemListEntry = {
  name: string;
  path: string;
  description?: string;
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
    "@id": `${getSiteUrl()}/#organization`,
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
    "@id": `${getSiteUrl()}/#website`,
    name: siteConfig.name,
    alternateName: siteConfig.englishName,
    url: getSiteUrl(),
    inLanguage: "ja-JP",
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
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

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: siteConfig.name,
        item: getAbsoluteUrl("/"),
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.name,
        item: getAbsoluteUrl(item.path),
      })),
    ],
  };
}

export function buildWebPageJsonLd({
  type = "WebPage",
  name,
  description,
  path = "/",
  dateModified,
}: {
  type?: JsonLdType;
  name: string;
  description: string;
  path?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${getAbsoluteUrl(path)}#webpage`,
    name,
    description,
    url: getAbsoluteUrl(path),
    inLanguage: "ja-JP",
    isPartOf: {
      "@id": `${getSiteUrl()}/#website`,
    },
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    ...(dateModified ? { dateModified } : {}),
  };
}

export function buildCollectionPageJsonLd(options: Omit<Parameters<typeof buildWebPageJsonLd>[0], "type">) {
  return buildWebPageJsonLd({
    ...options,
    type: "CollectionPage",
  });
}

export function buildItemListJsonLd(name: string, items: ItemListEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: item.name,
        url: getAbsoluteUrl(item.path),
        ...(item.description ? { description: item.description } : {}),
        ...(item.imageUrl ? { image: getAbsoluteUrl(item.imageUrl) } : {}),
      },
    })),
  };
}
