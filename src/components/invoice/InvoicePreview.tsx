'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { track } from '@vercel/analytics'
import { useInvoiceStore } from '@/store/invoiceStore'
import { calculateTotals } from '@/lib/calculations'
import { captureElement, generatePDFFromCanvas, generatePDFBlobFromCanvas } from '@/lib/pdf'
import { ClassicPurple } from './templates/ClassicPurple'
import { ModernMinimal } from './templates/ModernMinimal'
import { ProfessionalDark } from './templates/ProfessionalDark'
import { CreativeBold } from './templates/CreativeBold'
import { CorporateBlue } from './templates/CorporateBlue'
import type { Invoice } from '@/types/invoice'
import type { InvoiceTotals } from '@/lib/calculations'
import {
  initGoogleDriveClient,
  requestDriveAccess,
  uploadInvoiceToDrive,
  getStoredAccessToken,
} from '@/lib/googleDrive'

interface TemplateComponentProps {
  invoice: Invoice
  totals: InvoiceTotals
  isPdfExport?: boolean
}

const TEMPLATE_MAP: Record<string, React.ComponentType<TemplateComponentProps>> = {
  'classic-purple': ClassicPurple,
  'modern-minimal': ModernMinimal,
  'professional-dark': ProfessionalDark,
  'creative-bold': CreativeBold,
  'corporate-blue': CorporateBlue,
}

const INVOICE_WIDTH_PX = 794 // A4 at 96dpi
const CANVAS_DEBOUNCE_MS = 400

export function InvoicePreview() {
  const invoice = useInvoiceStore((s) => s.invoice)
  const isExporting = useInvoiceStore((s) => s.isExporting)
  const setIsExporting = useInvoiceStore((s) => s.setIsExporting)
  const isDriveUploading = useInvoiceStore((s) => s.isDriveUploading)
  const setIsDriveUploading = useInvoiceStore((s) => s.setIsDriveUploading)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRenderingCanvas, setIsRenderingCanvas] = useState(true)
  const [driveSuccess, setDriveSuccess] = useState<{ id: string; link: string } | null>(null)
  const [driveError, setDriveError] = useState<string | null>(null)
  const [driveInitialized, setDriveInitialized] = useState(false)

  const totals = useMemo(
    () => calculateTotals(invoice.items, invoice.taxRate, invoice.discountRate),
    [invoice.items, invoice.taxRate, invoice.discountRate]
  )
  const TemplateComponent = TEMPLATE_MAP[invoice.template] || ClassicPurple

  // Re-render canvas whenever the invoice changes (debounced)
  useEffect(() => {
    let cancelled = false
    setIsRenderingCanvas(true)

    const timer = setTimeout(async () => {
      try {
        const offscreen = await captureElement('invoice-preview-root')
        if (!cancelled && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d')
          canvasRef.current.width = offscreen.width
          canvasRef.current.height = offscreen.height
          ctx?.drawImage(offscreen, 0, 0)
        }
      } catch (e) {
        console.error('Canvas render failed:', e)
      } finally {
        if (!cancelled) setIsRenderingCanvas(false)
      }
    }, CANVAS_DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [invoice, totals])

  // Init Google Drive client
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      initGoogleDriveClient()
        .then(() => setDriveInitialized(true))
        .catch(() => setDriveInitialized(false))
    }
  }, [])

  async function handleDownloadPDF() {
    if (!canvasRef.current) return
    setIsExporting(true)
    try {
      const filename = `invoice-${invoice.invoiceNo || 'draft'}.pdf`
      generatePDFFromCanvas(canvasRef.current, filename)
      track('pdf_downloaded', {
        template: invoice.template,
        currency: invoice.currency,
        from_name: invoice.billedBy.name,
        from_email: invoice.billedBy.email ?? '',
        from_city: invoice.billedBy.city,
        from_country: invoice.billedBy.country,
        to_name: invoice.billedTo.name,
        to_email: invoice.billedTo.email ?? '',
        to_city: invoice.billedTo.city,
        to_country: invoice.billedTo.country,
      })
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleUploadToDrive() {
    if (!canvasRef.current) return
    setDriveError(null)
    setDriveSuccess(null)
    setIsDriveUploading(true)

    try {
      // Must request access token FIRST (before any await) to avoid popup blocker
      let token = getStoredAccessToken()
      if (!token) {
        token = await requestDriveAccess()
      }

      const filename = `invoice-${invoice.invoiceNo || 'draft'}.pdf`
      const blob = generatePDFBlobFromCanvas(canvasRef.current)
      const result = await uploadInvoiceToDrive(blob, filename, token)
      setDriveSuccess({ id: result.id, link: result.webViewLink })
      track('pdf_uploaded_to_drive', {
        template: invoice.template,
        currency: invoice.currency,
        from_name: invoice.billedBy.name,
        from_email: invoice.billedBy.email ?? '',
        from_city: invoice.billedBy.city,
        from_country: invoice.billedBy.country,
        to_name: invoice.billedTo.name,
        to_email: invoice.billedTo.email ?? '',
        to_city: invoice.billedTo.city,
        to_country: invoice.billedTo.country,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setDriveError(message)
    } finally {
      setIsDriveUploading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Hidden HTML invoice — source for html2canvas, invisible to users.
          Sits at fixed (0,0) so it's inside html2canvas's windowBounds.
          visibility:hidden hides it visually; onclone restores it for capture.
          scrollX/scrollY:0 in captureElement keeps windowBounds anchored at the
          viewport origin regardless of how far the page is scrolled. */}
      <div
        id="invoice-preview-root"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${INVOICE_WIDTH_PX}px`,
          minHeight: '1123px',
          backgroundColor: '#ffffff',
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: -9999,
        }}
        aria-hidden
      >
        <TemplateComponent invoice={invoice} totals={totals} />
      </div>

      {/* Action Bar */}
      <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-3 bg-white border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-600">Preview</span>
        <div className="flex items-center gap-2">
          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting || isRenderingCanvas}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7C3AED] hover:bg-[#5b21b6] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>

          {/* Google Drive Upload */}
          {(driveInitialized || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) && (
            <button
              onClick={handleUploadToDrive}
              disabled={isDriveUploading || isRenderingCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isDriveUploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                  </svg>
                  Save to Drive
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Drive notifications */}
      {driveSuccess && (
        <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-sm text-emerald-700">
          <span>✓ Uploaded to Google Drive!</span>
          <a href={driveSuccess.link} target="_blank" rel="noopener noreferrer" className="font-medium underline">
            View in Drive
          </a>
        </div>
      )}
      {driveError && (
        <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2 bg-red-50 border-b border-red-200 text-sm text-red-700">
          <span>{driveError}</span>
          <button onClick={() => setDriveError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Canvas Preview */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <div
          className="relative mx-auto"
          style={{
            maxWidth: `${INVOICE_WIDTH_PX}px`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          {isRenderingCanvas && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
            >
              <svg className="animate-spin h-6 w-6 text-[#7C3AED]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
