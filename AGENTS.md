# AGENTS.md - Antigravity Agent Guidelines

## Project Overview
Web-based Challan PDF & Excel Generator for **Apparel Sourcing International Inc**.

## Tech Stack
- **Framework:** Next.js 14 App Router, TypeScript, React 18
- **Styling:** Tailwind CSS, responsive clean UI, custom print CSS for A4 dual-slip printing
- **Database & ORM:** SQLite (`prisma/dev.db`) + Prisma ORM
- **Auth:** Stateless JWT cookie (`jose` + `bcryptjs`)
- **Exports:** `exceljs` for `.xlsx` export, browser print + `jspdf` & `html2canvas` for direct PDF download

## Business Rules to Maintain
1. **Challan Date:** Always set by server clock in `Asia/Dhaka` timezone. Client inputs for date must never override this.
2. **Challan Number:** Format `ASI-XXXX`. Auto-generated, unique, non-editable.
3. **Particulars Table:** 8 standard rows, auto-suggestion combobox with 23 garment items + custom entry.
4. **Calculations:** Totals for Qty and YDS/KG are calculated client-side in real-time and recalculated server-side upon saving.
5. **Print Layout:** Must render two identical copies ("same to same") on a single portrait A4 page separated by a dotted cut line.
6. **Role Permissions:**
   - `ADMIN`: Allowed to create, edit, delete, view, export.
   - `USER`: Allowed to create, edit, view, and export. Server-side delete rejects non-admin users with 403.
