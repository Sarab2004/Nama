# Content model

## Services

`services` is the single source of truth for company service offerings managed in Payload.

### Responsibility

Editors create and publish service documents that will later power listing and detail pages at `/services/[slug]`. This collection owns service copy and structure only; it does not own projects, frontend routes, or hard-coded business contact data.

### Fields

| Field | Type | Notes |
| --- | --- | --- |
| `title` | text (localized) | Required; admin title and slug/SEO base |
| `slug` | `slugField()` | Unique, indexed, auto-generated from title |
| `shortDescription` | textarea (localized) | Required; cards, search, SEO description fallback |
| `featuredImage` | upload → `media` | Required for publish; images only; alt lives on Media |
| `content` | richText via `defaultLexical` (localized) | Main detail-page body |
| `benefits` | array (localized) | Ordered rows: `title`, optional `description` |
| `processSteps` | array (localized) | Ordered rows: `title`, optional `description` (textarea) |
| `audiences` | array (localized) | Ordered rows: `title`, optional `description` |
| `faqs` | array (localized) | Ordered rows: required `question`, required richText `answer` |
| `publishedAt` | date | Sidebar; populated by shared `populatePublishedAt` |
| `meta.*` | SEO plugin fields | Title/description/image + generate fallbacks |

Array row order is the future presentation order. No `stepNumber`, benefit index, or similar display numbers are stored.

### Localization

Content fields follow Pages/Posts: localized where those collections localize equivalent content (`title`, body/content, SEO text fields, and structured content arrays). The product remains Persian-first; English is not required content.

### Drafts and publication

Services uses Payload native `versions.drafts` with the same autosave interval, `schedulePublish`, and `maxPerDoc: 50` as Pages and Posts. `_status` is the only publication state. No custom workflow or manual status field is added.

### Access control

Reuses `authenticated` and `authenticatedOrPublished`. Public API readers see published documents only. Authenticated CMS users can create, update, delete, and `readVersions`.

### Media, SEO, Search, Redirects

- Featured and SEO images reuse the existing Media collection; no alt duplication on Services.
- SEO plugin generate fallbacks: title ← `title`, description ← `shortDescription`, image ← `featuredImage`, URL ← `/services/[slug]` via `getServerSideURL()`.
- Search plugin indexes Services alongside Posts through the existing Search collection and `beforeSync` mapping (`title`, `slug`, `shortDescription` / meta).
- Redirects plugin includes Services so future slug changes can target the standard Redirects collection.

### Ordering

Native collection `orderable` is intentionally deferred. No collection in this repository uses it yet, and enabling it now would add an `_order` schema change before any public listing exists. Within-document array order already covers benefits, steps, audiences, and FAQs. Collection-level drag-and-drop ordering can be enabled later with a focused migration when the services index page is built.

### Projects relationship (future)

Do not store `relatedProjects` on Services. When Projects exists:

1. Persist `projects.services` as `relationship` → `services`, `hasMany: true` (source of truth).
2. Expose inverse on Services as a virtual join: `relatedProjects` with `collection: 'projects'`, `on: 'services'`.

### Out of scope here

Frontend `/services` routes, service cards, preview/livePreview URLs, revalidation hooks for missing routes, Projects collection, and real Nama seed content are deferred to later tasks.
