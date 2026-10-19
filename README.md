# Challan PDF & Excel Generator

Web-based Challan PDF & Excel Generator for **Apparel Sourcing International Inc**.

## Architecture & Features

1. **Header & Fixed Information**:
   - Company: **Apparel Sourcing International Inc**
   - Address: *Anukul, House# 30, Apt# B-3, (3rd Floor) Western Road, Banani DOHS, Dhaka-1206, Bangladesh. Ph: 880-2-8715826, 8715827, 8715779*
   - Fixed sender notes: *1) Receive the above goods in good condition.*
   - Signatures: *Receiver's Signature / Phn:* & *Srabon (01774-109199) / For-Apparel Sourcing int'l inc*
   - Sender: *From: Ms.Shamoly*

2. **Challan Number & Date Rules**:
   - **Challan No:** Automatically generated unique random code (`ASI-XXXX`, e.g. `ASI-2087`), unique in DB, never client-editable.
   - **Date:** Auto-locked server-side to the current day in **Asia/Dhaka** timezone. Read-only for all users.

3. **Particulars Combobox**:
   - 23 seeded garment items with dynamic search:
     1. Sample
     2. shirt
     3. pant
     4. shorts
     5. polo shirt
     6. T-shirt
     7. jacket
     8. hoddi
     9. hoddi jacket
     10. trim card
     11. shead band
     12. swatch
     13. fabric
     14. lab deep
     15. rib
     16. twil tape
     17. size sticker
     18. jeep sticker
     19. label sticker
     20. tag
     21. elastic
     22. drocoat
     23. chemical
   - Allows free typing of custom particular items.
   - Live auto-calculation of **Total Qty** and **Total YDS/KG**.

4. **Dual-Copy A4 Output ("Same to Same")**:
   - Exactly reproduces the scanned physical Challan.
   - Renders **two identical half-page slips** on a single A4 page with a perforated cutting divider line.
   - One-click **Print / Save as PDF** (`@media print` optimized for A4).
   - One-click **Download PDF** (`jspdf` + `html2canvas`).
   - One-click **Download Excel** (`exceljs` generating formatted `.xlsx` matching template cells and borders).

5. **Role-Based Access**:
   - **Admin Mode:** Full control (Create, Edit, Delete any Challan).
   - **User Mode:** View and download only. Creation and modification routes are strictly rejected server-side.

## Default Credentials

| Role | Username | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Create, Edit, Delete, View, Download PDF/Excel |
| **Standard User** | `user` | `user123` | View & Download PDF/Excel only |

## Running the Application

### Development Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Production Build & Run:
```bash
npm run build
npm run start
```
