# Matsukasa Platform Core

WordPress plugin scaffold for the future Matsukasa Research Center CMS.

This plugin is intentionally not connected to the current Next.js runtime yet.
It is a staging area for the WordPress CMS that will eventually feed
`src/lib/content-source/wordpress-adapter.ts`.

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

Array fields are registered with the `matsukasa_` prefix:

- `relatedMethodology`
- `relatedDataset`
- `relatedCharts`
- `relatedReports`
- `researcherSlugs`
- `methodologySlugs`
- `keyFindings`
- `highlights`
- `sources`
- `chartData`

## REST Endpoints

- `/wp-json/matsukasa/v1/health`
- `/wp-json/matsukasa/v1/posts`
- `/wp-json/matsukasa/v1/posts/{slug}`
- `/wp-json/matsukasa/v1/reports`
- `/wp-json/matsukasa/v1/reports/{slug}`
- `/wp-json/matsukasa/v1/methodologies`
- `/wp-json/matsukasa/v1/researchers`
- `/wp-json/matsukasa/v1/topics`
- `/wp-json/matsukasa/v1/charts`
- `/wp-json/matsukasa/v1/datasets`
- `/wp-json/matsukasa/v1/finance`
- `/wp-json/matsukasa/v1/director`
- `/wp-json/matsukasa/v1/financial-statements`

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
  finance, and director.

Not implemented yet:

- Matsukasa-specific rich REST response normalization.
- Media Library attachment policy.
- Admin UI refinements.
- Role and capability mapping.
- Next.js `wordpressContentSource` fetching.
