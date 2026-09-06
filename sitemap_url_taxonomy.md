# Sitemap & URL Taxonomy

The platform will utilize React Router for client-side navigation.

## Public Routes
- **`/` (Home)**
  - The primary business landing page.
  - Contains services, about us, contact info.
  - Call to action: "Client Portal" or "Generate Invoice" (depending on who uses it).

- **`/bill/:id` (Public Bill Viewer)**
  - A publicly accessible (but unguessable due to UUIDs) route for clients to view a specific invoice.
  - Uses the ID to fetch the PDF link from the Cloudflare API.

## Protected/Internal Routes
*These routes should be protected by an authentication wall (e.g., login screen) if the app is only for internal staff.*

- **`/login`**
  - Standard email/password or magic link login.

- **`/invoice` (Generator)**
  - The main application interface for creating new invoices.
  
- **`/dashboard` or `/bill` (History)**
  - An overview table of all past invoices.
  - Pagination, search, and filtering.
  - Links out to specific `/bill/:id` views.
