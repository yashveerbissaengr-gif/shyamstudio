# UI/UX Design

## 1. Aesthetic Identity
- **Vibe:** Clean, modern, trustworthy, and fast.
- **Color Palette:** 
  - Primary: Deep Blue (Trust/Corporate)
  - Secondary: Emerald Green (Success/Actions)
  - Background: Off-white/light gray (`bg-slate-50`) to make white invoice cards pop.
- **Typography:** 
  - Headings: `Inter` or `Outfit` (Bold, geometric)
  - Data/Tables: `Roboto Mono` or tabular numbers for aligning prices/quantities perfectly.

## 2. Core User Flows

### Flow A: Creating an Invoice
1. User lands on `/invoice`.
2. Screen is split 50/50 on desktop (Form on left, Live Preview on right).
3. User types in details; right side updates instantly.
4. User clicks "Generate & Save".
5. Loading spinner appears over preview. App converts DOM to JPEG -> PDF -> Uploads to R2.
6. Success toast appears, providing a direct link to the stored bill.

### Flow B: Client Viewing a Bill
1. Client clicks a link received via email/SMS: `yourdomain.com/bill/12345`.
2. Page loads with a beautiful minimal interface.
3. The PDF is displayed natively in the browser viewer, or a stylized "Download Your Invoice" button is presented.
4. Navigation bar gently prompts the client to visit the main website (`/`) to learn more about the business.
