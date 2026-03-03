'use client'

import { useEffect, useRef, useState } from 'react'
import { useInvoiceStore } from '@/store/invoiceStore'
import { calculateTotals } from '@/lib/calculations'
import { generatePDF, generatePDFBlob } from '@/lib/pdf'
import { ClassicPurple } from './templates/ClassicPurple'
import { ModernMinimal } from './templates/ModernMinimal'
import { ProfessionalDark } from './templates/ProfessionalDark'
import { CreativeBold } from './templates/CreativeBold'
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
}

const INVOICE_WIDTH_PX = 794 // A4 at 96dpi

export function InvoicePreview() {
  const invoice = useInvoiceStore((s) => s.invoice)
  const isExporting = useInvoiceStore((s) => s.isExporting)
  const setIsExporting = useInvoiceStore((s) => s.setIsExporting)
  const isDriveUploading = useInvoiceStore((s) => s.isDriveUploading)
  const setIsDriveUploading = useInvoiceStore((s) => s.setIsDriveUploading)

  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [driveSuccess, setDriveSuccess] = useState<{ id: string; link: string } | null>(null)
  const [driveError, setDriveError] = useState<string | null>(null)
  const [driveInitialized, setDriveInitialized] = useState(false)

  const totals = calculateTotals(invoice.items, invoice.taxRate, invoice.discountRate)
  const TemplateComponent = TEMPLATE_MAP[invoice.template] || ClassicPurple

  // Measure container and update scale
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32 // padding
        setScale(Math.min(containerWidth / INVOICE_WIDTH_PX, 1))
      }
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Init Google Drive client
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      initGoogleDriveClient()
        .then(() => setDriveInitialized(true))
        .catch(() => setDriveInitialized(false))
    }
  }, [])

  async function handleDownloadPDF() {
    setIsExporting(true)
    try {
      const filename = `invoice-${invoice.invoiceNo || 'draft'}.pdf`
      await generatePDF('invoice-preview-root', filename)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleUploadToDrive() {
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
      const blob = await generatePDFBlob('invoice-preview-root')
      const result = await uploadInvoiceToDrive(blob, filename, token)
      setDriveSuccess({ id: result.id, link: result.webViewLink })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setDriveError(message)
    } finally {
      setIsDriveUploading(false)
    }
  }


  return (
    <div className="flex flex-col h-full">
      {/* Action Bar */}
      <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-3 bg-white border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-600">Preview</span>
        <div className="flex items-center gap-2">
          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
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
              disabled={isDriveUploading}
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

      {/* Preview Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-gray-100 p-4"
      >
        <div
          className="relative mx-auto"
          style={{
            width: `${INVOICE_WIDTH_PX * scale}px`,
            height: `${1123 * scale}px`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          {/* Actual invoice at full A4 size, scaled down visually */}
          <div
            id="invoice-preview-root"
            className="invoice-scale-wrapper"
            style={{
              width: `${INVOICE_WIDTH_PX}px`,
              minHeight: '1123px',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              backgroundColor: '#ffffff',
            }}
          >
            <TemplateComponent invoice={invoice} totals={totals} />
          </div>
        </div>
      </div>
    </div>
  )
}
