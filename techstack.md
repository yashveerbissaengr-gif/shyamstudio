# Tech Stack

## Frontend (Client-Side)
- **Framework:** React 18+
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **PDF Generation:** `jspdf` and `html-to-image`
- **Hosting:** Cloudflare Pages (Fast global CDN)

## Backend (API & Serverless)
- **Framework:** Cloudflare Workers (Edge computing)
- **Language:** TypeScript (Hono.js is recommended for routing API requests)
- **Authentication:** JWT (JSON Web Tokens) or Cloudflare Access for securing the `/bill` routes.

## Database (Structured Data)
- **System:** Cloudflare D1
- **Type:** Serverless SQL Database (built on SQLite)
- **Purpose:** Storing invoice metadata (Invoice ID, Date, Client Name, Total Amount, R2 Object Key).

## Storage (Unstructured Data / Files)
- **System:** Cloudflare R2
- **Type:** S3-compatible Object Storage
- **Purpose:** Storing the actual `.pdf` files.
- **Advantage:** Zero egress fees, meaning infinite free downloads for clients viewing their bills.
