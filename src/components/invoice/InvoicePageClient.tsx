'use client'

import dynamic from 'next/dynamic'

// Dynamic import with ssr:false must be in a Client Component
// Zustand persist (localStorage) and html2canvas are browser-only
const InvoicePage = dynamic(
  () => import('./InvoicePage').then((m) => m.InvoicePage),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col lg:flex-row animate-pulse" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div className="w-full lg:w-[42%] bg-gray-50 border-r border-gray-200 p-4 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
        <div className="hidden lg:flex lg:w-[58%] bg-gray-100 items-center justify-center">
          <div className="text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading invoice builder...</p>
          </div>
        </div>
      </div>
    ),
  },
)

export function InvoicePageClient() {
  return <InvoicePage />
}
