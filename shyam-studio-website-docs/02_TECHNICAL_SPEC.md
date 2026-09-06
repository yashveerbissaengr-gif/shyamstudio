# Technical Specification

## Application architecture

- Next.js App Router with server-rendered public pages.
- TypeScript strict mode.
- Prisma ORM with PostgreSQL.
- Authenticated `/admin` route group with role-based access.
- Object storage for originals and responsive derivatives.
- Server actions or route handlers for validated form submissions and admin mutations.

## Core entities

```text
User(id, name, email, role, passwordHash/providerId, createdAt, updatedAt)
SiteSettings(id, studioName, address, latitude, longitude, phones[], whatsapp, email, hoursJson, mapsUrl, seoJson)
Service(id, slug, name, shortDescription, description, coverImageId, sortOrder, published)
PortfolioProject(id, slug, title, category, excerpt, story, coverImageId, eventDate, location, published, sortOrder)
Image(id, storageKey, publicUrl, alt, width, height, blurDataUrl, focalX, focalY, createdAt)
ProjectImage(projectId, imageId, sortOrder)
Testimonial(id, quote, authorName, eventType, avatarImageId, approved, sortOrder)
Package(id, name, priceLabel, description, inclusionsJson, featured, published, sortOrder)
TeamMember(id, name, role, bio, imageId, published, sortOrder)
Post(id, slug, title, excerpt, body, coverImageId, authorId, publishedAt, seoJson, published)
Faq(id, question, answer, published, sortOrder)
Enquiry(id, name, phone, email, service, eventDate, venue, budget, message, consentAt, status, source, createdAt)
AuditLog(id, userId, action, entity, entityId, metadataJson, createdAt)
```

## API / server actions

- `POST /api/enquiries` — validate, rate-limit, save, notify, return reference.
- `GET/PATCH /api/admin/enquiries` — authenticated list and status updates.
- CRUD endpoints or server actions for services, projects, images, testimonials, packages, team, posts, FAQs, and settings.
- `POST /api/admin/uploads/sign` — authenticated presigned upload; restrict MIME type and file size.
- `POST /api/revalidate` — authenticated/manual cache revalidation.

## Security

- Validate with Zod on client and server.
- Rate-limit public submissions by IP and phone/email; add honeypot and CAPTCHA only if abuse appears.
- Never expose storage credentials or admin secrets to the browser.
- Restrict admin actions by role and log content changes.
- Escape/render Markdown safely; sanitize rich text.
- Add security headers, HTTPS, CSRF protection where relevant, and strict upload validation.

## SEO and structured data

- Stable slugs and canonical metadata.
- LocalBusiness schema using only owner-verified address, phone, hours, and coordinates.
- Do not state a rating or review count without an approved source and owner authorization.
- Generate `/sitemap.xml` and `/robots.txt`.

## Environment variables

```env
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_SITE_URL=
STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
EMAIL_FROM=
EMAIL_TO=
RESEND_API_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_GOOGLE_MAPS_URL=https://maps.app.goo.gl/ri3gfVGTidNvpqCr5
GOOGLE_MAPS_EMBED_KEY=
```
