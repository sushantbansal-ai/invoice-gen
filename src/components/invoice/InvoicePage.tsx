'use client'

import { InvoiceBuilder } from './InvoiceBuilder'
import { InvoicePreview } from './InvoicePreview'

export function InvoicePage() {
  return (
    <div className="flex flex-col lg:flex-row" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* Builder Panel */}
      <div
        id="invoice-builder-panel"
        className="w-full lg:w-[42%] xl:w-[38%] bg-gray-50 border-r border-gray-200 overflow-y-auto invoice-builder-scroll lg:h-[calc(100vh-56px)]"
      >
        <div className="px-4 py-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Build Your Invoice</h2>
            <p className="text-xs text-gray-500 mt-0.5">Changes appear instantly in the preview →</p>
          </div>
          <InvoiceBuilder />
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-full lg:w-[58%] xl:w-[62%] lg:h-[calc(100vh-56px)] lg:sticky lg:top-[56px] invoice-builder-scroll flex flex-col">
        <InvoicePreview />
      </div>
    </div>
  )
}
