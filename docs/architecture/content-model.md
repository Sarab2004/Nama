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

Native collection `orderable` is intentionally deferred until editors need drag-and-drop listing order. Public listing currently sorts by `-publishedAt` for a stable published order. Within-document array order already covers benefits, steps, audiences, and FAQs.

### Public frontend

Routes live under the locale-aware App Router (middleware maps `/services` → `/fa/services`):

| Route | Behavior |
| --- | --- |
| `/services` | Published services only (`draft: false`, `overrideAccess: false`) |
| `/services/[slug]` | Detail page; unpublished/missing → `notFound` via `PayloadRedirects` |
| Draft preview | Same `/next/preview` + Draft Mode pattern as Posts/Pages |

Revalidation (afterChange/afterDelete) refreshes `/[locale]/services` and `/[locale]/services/[slug]`, including the previous slug after rename or unpublish.

Metadata uses shared `generateMeta` with service fallbacks (`title`, `shortDescription`, `featuredImage`) and canonical `/services/[slug]`. JSON-LD (`Service` + optional `FAQPage`) is generated at render time from live document data, not stored in Payload.

Consultation CTA links to the existing Contact page (`/contact`) until a dedicated Consultation Requests flow exists. Company phones/emails are not hardcoded in service UI.

### Projects relationship (future)

Do not store `relatedProjects` on Services. When Projects exists:

1. Persist `projects.services` as `relationship` → `services`, `hasMany: true` (source of truth).
2. Expose inverse on Services as a virtual join: `relatedProjects` with `collection: 'projects'`, `on: 'services'`.

### Out of scope here

Projects collection, real Nama seed content, Header/Footer wiring to Company Information, and a dedicated Consultation Requests form remain deferred.

## Company Information

`company-information` is a Payload **Global** (single document) and the single source of truth for official company identity and contact data. It is not a page and does not store About/Contact page SEO metadata.

### Why a Global

Company facts are singleton organizational data. Putting them in a Collection would invite duplicate records and unclear ownership. Header and Footer currently only store navigation links; they must not become parallel contact stores.

### Data groups

| Group | Fields |
| --- | --- |
| Identity | `legalName`, `shortName`, optional `logo` → Media, `introduction`, `mission`, `vision`, `values[]` |
| Contact | `phones[]`, `emails[]`, `address` group |
| Hours & social | `workingHours[]`, `socialLinks[]` |
| Location | `location.latitude`, `location.longitude`, `location.mapUrl` |

Array order is presentation order. No display-order integers are stored. Phone/email `isPrimary` uniqueness is enforced lightly in a `beforeChange` hook (first primary wins).

### Logo source of truth

Header/Footer do not persist a company logo in CMS (the frontend Logo component still uses the template Payload SVG). Company Information therefore owns an optional `logo` upload for future Organization JSON-LD and branded surfaces. Do not duplicate logo storage into Header/Footer later without removing it here.

### Localization

Localized: identity copy, value titles/descriptions, contact labels, address text fields, working-hour labels, social display labels.  
Not localized: phone numbers, email addresses, postal code, social URLs/platforms, times, coordinates, map URL, checkboxes.  
Persian-only content is valid; English is not required.

### Access, versions, drafts

- Public `read` via `anyone` (frontend will need this).
- `update` and `readVersions` via `authenticated`.
- Version history enabled (`versions.max: 50`) so contact edits are recoverable.
- **Drafts are not enabled** for this Global: Header/Footer have no drafts, and draft contact details would complicate public reads without a clear publish UX. Live updates are intentional for this singleton.

### SEO and structured data

No `meta.*` / SEO plugin fields on this Global. Future Organization JSON-LD (and related markup) should be generated in the frontend from these fields; do not store raw Schema.org JSON in the database.

### Revalidation (future)

No `afterChange` revalidation hooks yet, because About, Contact, Header, and Footer are not wired to this Global in this task. When those surfaces consume it, reuse the existing `getCachedGlobal` / `global_${slug}_${locale}` tag pattern (see Header/Footer hooks).

### Out of scope here

About/Contact pages, Header/Footer wiring, maps providers, consultation forms, real Nama seed content, and JSON-LD rendering.
