# Product Requirements Document (PRD)

## 1. Product Overview
The product is a unified web platform that serves both as a public-facing business website and an internal/client-facing billing and invoice management system.

## 2. Target Audience
- **Business Owners/Staff:** To generate transport receipts (Biltis) and invoices quickly.
- **Clients/Customers:** To view the primary website and securely access their stored bills via unique links.

## 3. Goals & Objectives
- Consolidate marketing and operations into a single domain.
- Provide a seamless, blazing-fast invoice generation tool.
- Drastically reduce storage and bandwidth costs using Cloudflare's ecosystem (Zero egress fees on R2).
- Ensure PDFs are highly compressed without losing print quality.

## 4. Key Features
### 4.1 Primary Website (`/`)
- Landing page detailing services.
- Contact forms and business information.
- Navigation header linking to the invoice tools.

### 4.2 Invoice Generator (`/invoice`)
- Interactive form for inputting billing data (consignor, consignee, lorry number, freight, etc.).
- Real-time visual template preview.
- One-click "Save & Generate" which creates a highly optimized PDF and uploads it to the cloud.

### 4.3 Bill Dashboard (`/bill`)
- Authenticated or secure view listing all generated invoices.
- Search and filter by Date, Bilti Number, or Client.
- Links to view specific bills.

### 4.4 Bill Viewer (`/bill/:id`)
- A dedicated route to view a specific bill.
- Fetches the PDF directly from Cloudflare R2 and displays it or forces a download.

## 5. Success Metrics
- **Performance:** App loads in < 1.5 seconds.
- **Storage Efficiency:** Generated PDFs average < 1MB in size.
- **Cost:** Operating within Cloudflare's generous free tier limits.
