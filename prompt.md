# Full-Stack AI Prompt: Unified Website & Invoice Platform

**Context:**
I am building a unified platform. It serves as my primary business website but also contains an integrated web application for generating and managing invoices. 

**Core Infrastructure:**
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router.
- **Backend & API:** Cloudflare Workers (Serverless functions).
- **Database:** Cloudflare D1 (SQL database for storing invoice metadata).
- **Storage:** Cloudflare R2 (Object storage for the generated PDFs).

**Routing & Taxonomy:**
- `/` -> Primary marketing website / landing page.
- `/invoice` -> The invoice generator application.
- `/bill` -> Dashboard to see previous bills.
- `/bill/:id` -> A specific stored bill.

**Core Features for the App (`/invoice`):**
1. Invoice editor form (dynamic line items, tax, total calculation).
2. Live preview template.
3. Export functionality: Convert HTML to PDF using `html-to-image` (using `toJpeg` with `quality: 0.8` and `pixelRatio: 2` for small file sizes) and `jsPDF`.
4. Cloud Save: Send the invoice data to Cloudflare Workers API. The API will save the JSON data in Cloudflare D1 and upload the generated PDF to Cloudflare R2.

**Design System:**
- Clean, premium aesthetic. Glassmorphism where applicable, subtle micro-animations. Modern typography (e.g., Inter or Outfit).

**Initial Output Required:**
1. Please provide the terminal commands to initialize the project and install all required frontend dependencies.
2. Provide the `wrangler.toml` file configuration to set up Cloudflare Workers, D1, and R2.
3. Give me the React Router setup in `App.tsx` handling the specified URL taxonomy.
