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

### Projects relationship

1. Persist `projects.services` as `relationship` → `services`, `hasMany: true` (source of truth on Project).
2. Expose inverse on Services as a virtual join: `relatedProjects` with `collection: 'projects'`, `on: 'services'`.
3. Service detail pages render up to 6 published related projects (no draft leakage).

### Out of scope here

Real Nama seed content, Header/Footer wiring to Company Information, and a dedicated Consultation Requests form remain deferred.

## Clients

`clients` is the single source of truth for employers/customers that Projects reference.

### Responsibility

Editors create and publish client profiles (name, logo, industry, copy, website, featured flag). Public listing/detail routes are deferred. Projects relate to Clients via `relationship` → `clients` and must **not** duplicate employer names as free text, unless a future historical snapshot decision is documented separately.

### Fields

| Field | Type | Notes |
| --- | --- | --- |
| `name` | text (localized) | Required; admin title and slug/SEO base |
| `slug` | `slugField({ useAsSlug: 'name' })` | Unique, indexed, auto-generated from name; manually editable |
| `logo` | upload → `media` | Optional; images only |
| `industry` | text (localized) | Optional free text (no fixed enum) |
| `shortDescription` | textarea (localized) | Optional; max 320 for future cards |
| `description` | richText via `defaultLexical` (localized) | Optional full profile |
| `website` | text | Optional absolute `http(s)` URL |
| `featured` | checkbox | Default `false`; future homepage / featured list |
| `displayOrder` | number (`min: 0`) | Optional manual sort; not native collection `orderable` |
| `publishedAt` | date | Sidebar; shared `populatePublishedAt` |
| `meta.*` | SEO plugin fields | Title/description/image + generate fallbacks |
| `projects` | join → `projects` on `client` | Virtual inverse; not stored on Clients |

### Localization

Localized: `name`, `industry`, `shortDescription`, `description`, `meta.title`, `meta.description`.  
Not localized: `slug`, `logo`, `website`, `featured`, `displayOrder`, `meta.image`.

### Drafts and publication

Same draft/version pattern as Services/Pages/Posts: autosave interval `100`, `schedulePublish`, `maxPerDoc: 50`. No public Preview URL yet (no frontend routes).

### Access control

Reuses `authenticated` and `authenticatedOrPublished`. Public readers see published documents only.

### SEO and Search

- SEO plugin generate fallbacks: title ← `name`, description ← `shortDescription`, image ← `logo`, URL ← `/clients/[slug]` (reserved for future public pages).
- Search plugin does **not** index Clients yet — no public client pages exist. Add later when `/clients` ships.
- Redirects plugin does not include Clients yet for the same reason.

### Projects relationship

1. Persist `projects.client` as `relationship` → `clients` (source of truth for employer).
2. Do not store a parallel free-text employer name on Projects.
3. Expose inverse on Clients as a virtual join: `projects` with `collection: 'projects'`, `on: 'client'`.

### Out of scope here

Public `/clients` routes, real Nama client seed content.

## Projects

`projects` is the CMS source of truth for completed company work. Each Project links to one Client and one or more Services.

### Responsibility

Editors create draft/published project case studies (overview, narrative, gallery, optional testimonial, SEO). Clients own employer identity (name, logo); Services own service taxonomy. Projects must not duplicate client names as free text and must not invent a separate `serviceType` select — service type comes from the `services` relationship.

Public routes:

| Route | Behavior |
| --- | --- |
| `/projects` | Published listing sorted by `displayOrder`, then `title` |
| `/projects/[slug]` | Detail page; unpublished/missing → `notFound` via `PayloadRedirects` |

### Fields

| Field | Type | Notes |
| --- | --- | --- |
| `title` | text (localized) | Required; admin title and slug/SEO base |
| `slug` | `slugField()` | Unique, indexed, from `title`; manually editable; not localized |
| `shortDescription` | textarea (localized) | Optional; max 320; cards + SEO fallback |
| `client` | relationship → `clients` | Required on publish; single; source of employer truth (top-level for joins) |
| `services` | relationship → `services`, `hasMany` | Required on publish; stores the Project→Service link only (top-level for joins) |
| `executionYear` | text (localized) | Required; max ~20; year or range (Jalali/Gregorian), not `number` |
| `location` | text (localized) | Optional execution place |
| `featuredImage` | upload → `media` | Optional image for cards/OG/hero |
| `problem` / `solution` / `results` | richText via `defaultLexical` (localized) | Narrative sections |
| `gallery[]` | array | `image` (required upload) + `caption` (localized); array order = display order |
| `testimonial` | group | Optional `quote`, `authorName`, `authorRole`, `document`, `permissionToPublish` |
| `featured` | checkbox | Default `false`; future homepage picks |
| `displayOrder` | number (`min: 0`) | Optional manual sort (shared `validateDisplayOrder`) |
| `publishedAt` | date | Sidebar; shared `populatePublishedAt` |
| `meta.*` | SEO plugin fields | Title/description/image + generate fallbacks |

### Why no duplicated client name or `serviceType`

- Client name/logo live on `clients`. Snapshotting names onto Projects would drift and create dual sources of truth.
- Service kind/category is already modeled on `services`. A parallel Project `serviceType` would diverge from the Services taxonomy.

### Inverse joins (virtual only)

| On | Field | Join |
| --- | --- | --- |
| Clients | `projects` | `collection: 'projects'`, `on: 'client'` |
| Services | `relatedProjects` | `collection: 'projects'`, `on: 'services'` |

These joins are virtual. Project IDs are **not** stored as arrays on Clients or Services. The relationship source of truth remains on Project.

### Localization

Localized: `title`, `shortDescription`, `executionYear`, `location`, `problem`, `solution`, `results`, `gallery.caption`, `testimonial.quote`, `testimonial.authorName`, `testimonial.authorRole`, `meta.title`, `meta.description`.  
Not localized: `slug`, `client`, `services`, `featuredImage`, `gallery.image`, `testimonial.document`, `testimonial.permissionToPublish`, `featured`, `displayOrder`, `publishedAt`, `meta.image`.

### Drafts and publication

Same draft/version pattern as Clients/Services: autosave interval `100`, `schedulePublish`, `maxPerDoc: 50`. Incomplete drafts may omit required relationships until publish. Preview uses shared `/next/preview` + Draft Mode.

### Access control

Reuses `authenticated` and `authenticatedOrPublished`. Public readers see published documents only; drafts and versions require authenticated access. Public API must not use `overrideAccess`.

### SEO, Search, Redirects

- SEO plugin generate fallbacks: title ← `title`, description ← `shortDescription`, image ← `featuredImage`, URL ← `/projects/[slug]`.
- Search plugin indexes Projects alongside Posts/Services through the existing Search collection and `beforeSync` mapping.
- Redirects plugin includes Projects so slug changes can target the standard Redirects collection.
- Revalidation refreshes `/[locale]/projects`, `/[locale]/projects/[slug]`, previous slug, and related Service detail paths.

### Frontend rendering notes

- Client identity is rendered from the populated relationship; no link to `/clients/[slug]` yet (route deferred).
- Related services link only when published and have a slug.
- Gallery uses stored array order and shared `Media`.
- Testimonials render only when `permissionToPublish === true`.
- Structured data uses schema.org `CreativeWork` generated at render time (not stored in Payload).
- Service detail pages list up to 6 published related projects via a single Projects query (`services contains service.id`).

### Testimonial / `permissionToPublish`

Testimonials may store quote, author name/role, and an optional image/PDF. Do not store personal contact details. Public UI must hide testimonials unless `permissionToPublish` is true. Real testimonial content must not be committed to seed/git.

### Out of scope here

Public `/clients` routes, listing projects on Client pages, Consultation Requests, real project/testimonial seed data.

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
