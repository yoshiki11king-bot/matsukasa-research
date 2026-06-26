# Matsukasa Platform Core

WordPress plugin scaffold for the future Matsukasa Research Center CMS.

This plugin is not the default production content source yet. It is the staging
area for the WordPress CMS that can feed
`src/lib/content-source/wordpress-adapter.ts` when `CONTENT_SOURCE=wordpress`
and `WORDPRESS_API_BASE_URL` are configured.

## Purpose

- Register Matsukasa-specific content types.
- Expose stable REST API endpoints under `/wp-json/matsukasa/v1`.
- Move images, PDFs, CSV files, codebooks, questionnaires, and chart assets into
  WordPress Media Library.
- Keep Next.js pages reading normalized internal content types through
  `src/lib/content-source`.

## Registered Content Types

- `report`
- `methodology`
- `researcher`
- `chart`
- `dataset`
- `financial_statement`
- `short_read`
- `correction`

Article content may use the standard WordPress `post` type or a future
Matsukasa-specific `article` type.

## Registered Taxonomies

- `research_topic`
- `research_region`
- `content_format`

## Registered Meta Fields

String fields are registered with the `matsukasa_` prefix:

- `description`
- `pdfUrl`
- `fileUrl`
- `fileFormat`
- `citation`
- `sourceNote`
- `methodologyNote`
- `revisionNote`
- `fiscalYear`
- `readingTime`
- `role`
- `team`
- `email`
- `targetType`
- `targetSlug`
- `effectiveDate`
- `stanceTitle`
- `stanceDescription`
- `relatedSummary`
- `contactText`
- `sourceBasis`
- `reviewer`
- `reportType`
- `category`
- `format`
- `region`
- `methodologySummary`
- `chartType`

Array fields are registered with the `matsukasa_` prefix:

- `relatedMethodology`
- `relatedDataset`
- `relatedCharts`
- `relatedReports`
- `researcherSlugs`
- `methodologySlugs`
- `keyFindings`
- `highlights`
- `focusTopics`
- `goodFor`
- `limits`
- `relatedReportSlugs`
- `relatedChartSlugs`
- `authors`
- `roleCards`
- `stanceCards`
- `disclosureItems`
- `disclosureTable`
- `policyItems`
- `sources`
- `chartData`

## REST Endpoints

- `/wp-json/matsukasa/v1/health`
- `/wp-json/matsukasa/v1/posts`
- `/wp-json/matsukasa/v1/posts/{slug}`
- `/wp-json/matsukasa/v1/reports`
- `/wp-json/matsukasa/v1/reports/{slug}`
- `/wp-json/matsukasa/v1/methodologies`
- `/wp-json/matsukasa/v1/methodologies/{slug}`
- `/wp-json/matsukasa/v1/researchers`
- `/wp-json/matsukasa/v1/researchers/{slug}`
- `/wp-json/matsukasa/v1/topics`
- `/wp-json/matsukasa/v1/charts`
- `/wp-json/matsukasa/v1/charts/{slug}`
- `/wp-json/matsukasa/v1/datasets`
- `/wp-json/matsukasa/v1/datasets/{slug}`
- `/wp-json/matsukasa/v1/short-readings`
- `/wp-json/matsukasa/v1/short-readings/{slug}`
- `/wp-json/matsukasa/v1/finance`
- `/wp-json/matsukasa/v1/director`
- `/wp-json/matsukasa/v1/financial-statements`
- `/wp-json/matsukasa/v1/financial-statements/{slug}`
- `/wp-json/matsukasa/v1/corrections`
- `/wp-json/matsukasa/v1/corrections/{slug}`
- `/wp-json/matsukasa/v1/editorial-policy`
- `/wp-json/matsukasa/v1/funding`

Collection endpoints return a microCMS-like shape:

```json
{
  "contents": [],
  "totalCount": 0,
  "limit": 10,
  "offset": 0
}
```

## Current Status

Implemented:

- Plugin bootstrap.
- Custom post type registration.
- Taxonomy registration.
- REST-visible meta field registration.
- REST namespace health endpoint.
- Basic public read REST responses for posts, reports, methodologies,
  researchers, charts, datasets, short readings, financial statements, topics,
  corrections, finance, director, editorial policy, and funding.
- Media Library upload support for CSV, TSV, JSON, and GeoJSON research assets.
- Admin list columns for slug, research topics, and update time.
- Field-level WordPress edit screen meta boxes for Matsukasa REST fields,
  including simple line-based editors for lists, sources, and labeled text
  blocks.
- Media Library picker buttons for PDF and dataset URL fields in the Matsukasa
  metadata box.
- A `matsukasa_editor` role for editorial users who need to draft, publish, and
  upload research content.
- Next.js `wordpressContentSource` fetch and normalization path.
- `CONTENT_SOURCE=wordpress` selection path in Next.js, while `microcms`
  remains the default source.

Not implemented yet:

- Advanced Matsukasa-specific REST response normalization beyond the current
  adapter-level mapping.
- Rich repeatable-field controls for Matsukasa meta fields. Current edit screen
  support is intentionally plain text / line-based.
- Fine-grained workflow permissions, review states, and approval routing.
- Production WordPress instance connection and end-to-end publishing test.
