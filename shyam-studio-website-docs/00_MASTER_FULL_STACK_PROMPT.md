# Shyam Studio — Master Full-Stack Website Prompt

## Role

You are a senior product designer, brand designer, and full-stack engineer. Build a production-ready, responsive website for **Shyam Photo Studio / Shyam Graphic Designer**, a photography and photo studio business in Nagpur, Maharashtra, India.

Use the supplied reference image `DAN - Creative Photography Portfolio & Photo Studio Template.png` as the visual direction: editorial photography, dark hero imagery, black/white content sections, restrained orange accents, generous whitespace, elegant typography, and a portfolio-first experience. Do not copy the template's text, images, logo, or proprietary assets. Recreate its structure and mood with original, licensed, owner-supplied content.

## Business facts and verification rules

- Map listing name: **Shyam photo studio**.
- Map coordinates from the supplied Google Maps link: **21.1509644, 79.1599559**.
- Supplied bill contact numbers: **7775854937** and **9404291477**.
- Another supplied invoice contains **8855906847**, which should be shown only after owner confirmation.
- Address wording varies between supplied materials. Do not publish an address until the owner confirms the canonical version. Candidate wording includes: `Bhandewadi R.L.Y. Station Road, Pardi, Nagpur – 35`; `126, Dip Nagar, Bhandewadi, Ward 21, Railway Station, Nagpur, Maharashtra 440035`; and `Plat No. 1, Shop No. 3, Balaji Nagar, near Bhawani Hospital opposite, Punapur Road, Pardi, Nagpur`.
- Never invent ratings, reviews, opening hours, email, pricing, GST details, team names, or social links. Use editable CMS fields and mark missing values as TODO.

## Primary goals

1. Turn visitors into WhatsApp enquiries, calls, booking requests, and direction requests.
2. Showcase wedding, portrait, event, product, travel, and studio photography.
3. Make the studio's location and contact details easy to find.
4. Provide an owner-friendly admin area for portfolio images, services, testimonials, packages, blog posts, enquiries, and SEO fields.
5. Load quickly on Indian mobile networks and meet WCAG 2.2 AA basics.

## Required public pages

- `/` Home: navigation, full-bleed hero, value proposition, CTAs, services, selected portfolio, testimonials, team/studio introduction, packages, latest articles, contact/location, footer.
- `/about`: story, approach, equipment or studio details, trust signals.
- `/services`: service overview and detail pages for wedding, portrait, event, product, travel, and studio photography.
- `/portfolio`: filterable gallery with accessible lightbox and deep-linkable categories.
- `/portfolio/[slug]`: project story, images, location/date if approved, enquiry CTA.
- `/packages`: editable packages with starting prices only when approved.
- `/team`: team profiles only when owner supplies names and portraits.
- `/journal`: article listing and detail pages.
- `/contact`: enquiry form, verified phone/WhatsApp, verified address, map, hours, FAQs.
- `/privacy`, `/terms`, and `/thank-you`.

## Design direction

- Use a dark photographic hero with a subtle overlay; keep text highly readable.
- Palette: near-black `#111111`, warm white `#FAFAF7`, soft gray `#F3F3F1`, charcoal `#252525`, accent orange `#F47A21`.
- Typography: a refined serif or display face for major headings paired with a clean sans-serif for navigation, labels, and body copy. Use locally hosted or properly licensed fonts.
- Layout: thin uppercase eyebrow labels, strong section headings, 3-column service cards, 3-column portfolio grid, dark testimonial band, team cards, package cards, journal cards, and a two-column contact section.
- Motion: subtle reveal, hover, and lightbox transitions only; respect `prefers-reduced-motion`.
- Make the page feel premium, calm, human, and image-led rather than crowded.

## Recommended stack

- Next.js with TypeScript and App Router.
- Tailwind CSS plus a small token layer for the brand system.
- PostgreSQL with Prisma.
- Auth.js or an equivalent secure admin authentication layer.
- Object storage for images, preferably S3-compatible storage, with responsive derivatives.
- Cloudinary or Sharp for image transformation, compression, and focal-point crops.
- Resend or SMTP for enquiry notifications.
- WhatsApp click-to-chat using the verified business number.
- Google Maps link and optional Maps Embed/API only after key and billing setup; otherwise use a normal directions link.
- Vitest/Playwright for tests and Lighthouse for performance checks.

## Functional requirements

- Sticky desktop navigation and compact mobile menu.
- Visible primary CTA: `Book a Session` or `Get a Quote`.
- Click-to-call and WhatsApp buttons on mobile.
- Enquiry form fields: name, phone, email optional, service, event date optional, venue optional, budget optional, message, consent checkbox, honeypot, rate limit, server-side validation.
- Persist enquiries in the database and send notification email.
- Admin can change enquiry status: new, contacted, qualified, booked, closed, spam.
- Admin CRUD for services, portfolio projects, gallery images, testimonials, packages, team members, posts, FAQs, contact settings, and SEO settings.
- Portfolio filtering must be usable by keyboard and screen readers.
- Images need width/height, alt text, lazy loading below the fold, modern formats, and a blur placeholder.
- Add Organization, LocalBusiness, Service, ImageObject, Article, and Breadcrumb JSON-LD only from verified data.
- Generate sitemap, robots.txt, canonical URLs, Open Graph metadata, and per-page titles/descriptions.

## Deliverables

Produce:

1. Working application and database schema.
2. Seed data with clearly marked placeholder content.
3. Admin dashboard with protected routes.
4. Responsive public pages matching the visual direction.
5. `.env.example` with no secrets.
6. README with local setup, migrations, seeding, image upload, deployment, backups, and content editing.
7. Test suite covering forms, auth, CRUD, responsive navigation, and critical page rendering.
8. Accessibility and performance report.
9. Owner content handoff checklist for unresolved address, hours, pricing, email, logo, gallery, reviews, and social handles.

## Acceptance criteria

- No horizontal overflow at 320px, 768px, 1024px, and desktop widths.
- Lighthouse mobile Performance, Accessibility, Best Practices, and SEO each target 90+ where external image/network conditions permit.
- Every primary CTA works; enquiry submissions show success and error states.
- Invalid or malicious form payloads are rejected server-side.
- Admin-only data cannot be read or changed without authentication and authorization.
- No unverified business facts appear in public content.
- Portfolio images remain sharp, compressed, and usable with keyboard navigation.
- Print/share metadata and social previews are present.
- The site is deployable from a clean checkout using only documented commands.
