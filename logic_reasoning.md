# Logic & Reasoning

## 1. Why a Unified Platform?
Combining the primary website and the invoice app under one domain (`yourdomain.com`) provides massive benefits:
- **SEO Authority:** All traffic goes to one domain, boosting search engine ranking.
- **User Trust:** Clients downloading bills from `yourdomain.com/bill/123` trust the link more than a third-party invoice service domain.
- **Simplified CI/CD:** One codebase to deploy.

## 2. Why the Cloudflare Ecosystem?
- **Cost:** Cloudflare R2 offers 10GB of storage and *zero egress fees*. Standard cloud providers charge heavily for bandwidth when users download files.
- **Performance:** Cloudflare Workers and Pages run on the edge. The API and the website are served from the data center physically closest to the user.
- **Integration:** D1 (Database), R2 (Storage), and Workers (API) are tightly integrated and configured via a single `wrangler.toml` file.

## 3. Why `toJpeg` for PDF Generation?
HTML-to-PDF generation is notoriously difficult. Using `html-to-image` combined with `jspdf` is the most reliable way to perfectly replicate React UI (CSS grid, flexbox, custom fonts) in a PDF. 
However, standard PNG export creates massive files (20MB+). By intercepting the canvas and converting it to a compressed JPEG (`quality: 0.8`, `pixelRatio: 2`), we reduce file size by 95% while keeping text perfectly legible for A4 printing.
