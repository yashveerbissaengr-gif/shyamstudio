# Technical Specifications

## 1. Cloudflare D1 Database Schema
We need a single table to store the invoice metadata.

```sql
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,          -- UUID
  invoice_number TEXT NOT NULL, -- e.g., INV-001
  client_name TEXT NOT NULL,
  date TEXT NOT NULL,
  total_amount REAL NOT NULL,
  r2_object_key TEXT NOT NULL,  -- The filename inside the R2 bucket
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2. Cloudflare Workers API Endpoints

### `POST /api/invoices`
- **Payload:** JSON containing invoice metadata + Base64 encoded PDF or Form Data with PDF Blob.
- **Action:** 
  1. Generate UUID.
  2. Put PDF into R2 bucket with key `invoices/{UUID}.pdf`.
  3. Insert record into D1 `invoices` table.
- **Response:** `{ success: true, id: UUID }`

### `GET /api/invoices`
- **Action:** Select all from `invoices` table, order by `created_at` DESC.
- **Response:** Array of invoice objects.

### `GET /api/invoices/:id`
- **Action:** 
  1. Query D1 for the `r2_object_key`.
  2. Fetch the object from R2.
  3. Return the file stream with header `Content-Type: application/pdf`.

## 3. PDF Generation Implementation
```javascript
// Example implementation constraint
const imgData = await toJpeg(printArea, { quality: 0.8, pixelRatio: 2 });
const doc = new jsPDF({ format: 'a4' });
doc.addImage(imgData, 'JPEG', x, y, width, height, undefined, 'FAST');
const pdfBlob = doc.output('blob');
```
