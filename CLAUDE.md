# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture

**Invoice generator** built with Next.js App Router. The app is intentionally client-heavy: the main invoice builder is wrapped in `InvoicePageClient.tsx` which uses `dynamic(..., { ssr: false })` to keep PDF/canvas logic browser-only.

### Data flow

1. `src/store/invoiceStore.ts` — Zustand store with localStorage persistence holds all invoice form data
2. `src/store/userProfileStore.ts` — Zustand store persists user/company profile as a reusable template
3. `InvoiceBuilder.tsx` — React Hook Form + Zod handles form state; writes to Zustand on change
4. `InvoicePreview.tsx` — Reads from Zustand and renders the selected template live
5. Templates in `src/components/invoice/templates/` — Pure presentational components; receive invoice data as props
6. `src/lib/pdf.ts` — html2canvas captures the preview DOM node → jsPDF converts to PDF
7. `src/lib/googleDrive.ts` — Uploads generated PDF blob to Google Drive via OAuth

### Key files

- `src/types/invoice.ts` — Single source of truth: TypeScript types, Zod schemas, and template config (supported currencies, tax configs)
- `src/lib/calculations.ts` — All invoice math (subtotals, CGST/SGST split, discount, total)
- `src/app/page.tsx` — SSR landing page with SEO content; client invoice builder is embedded via `InvoicePageClient`

### Adding a new template

1. Create `src/components/invoice/templates/MyTemplate.tsx` accepting `InvoiceData` props
2. Register it in `src/types/invoice.ts` in the `TEMPLATES` config array
3. It will appear automatically in `TemplateSelector.tsx`

## Tech stack

- **Next.js** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** (PostCSS plugin, no config file)
- **Zustand** for state (localStorage persistence)
- **React Hook Form** + **Zod** for form validation
- **html2canvas** + **jsPDF** for PDF export
- **react-select** via `src/components/ui/SearchableSelect.tsx` wrapper
- **React Compiler** enabled (`reactCompiler: true` in `next.config.ts`) — avoid manual `useMemo`/`useCallback` unless benchmarking shows a need

## Path alias

`@/*` resolves to `src/*`.

## Environment

`NEXT_PUBLIC_GOOGLE_CLIENT_ID` — required for Google Drive save feature. Optional for local dev (feature degrades gracefully).
