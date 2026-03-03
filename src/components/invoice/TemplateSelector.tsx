'use client'

import { useInvoiceStore } from '@/store/invoiceStore'
import { TEMPLATE_CONFIGS } from '@/types/invoice'
import type { TemplateId } from '@/types/invoice'

export function TemplateSelector() {
  const template = useInvoiceStore((s) => s.invoice.template)
  const setTemplate = useInvoiceStore((s) => s.setTemplate)

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {(Object.entries(TEMPLATE_CONFIGS) as [TemplateId, typeof TEMPLATE_CONFIGS[TemplateId]][]).map(
        ([id, config]) => {
          const isSelected = template === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTemplate(id)}
              className={[
                'flex-shrink-0 rounded-xl border-2 p-3 text-left transition-all duration-150 cursor-pointer',
                'hover:border-[#7C3AED] hover:shadow-md',
                isSelected
                  ? 'border-[#7C3AED] shadow-md ring-2 ring-[#7C3AED] ring-offset-1'
                  : 'border-gray-200',
              ].join(' ')}
              style={{ minWidth: '120px', maxWidth: '130px' }}
            >
              {/* Color Swatches */}
              <div className="flex gap-1 mb-2">
                {config.swatchColors.map((color, i) => (
                  <div
                    key={i}
                    className="h-4 rounded-sm"
                    style={{
                      backgroundColor: color,
                      width: i === 0 ? '36px' : '16px',
                      background: id === 'creative-bold' && i === 0
                        ? 'linear-gradient(135deg, #EC4899, #8B5CF6)'
                        : id === 'professional-dark' && i === 1
                        ? '#0F172A'
                        : color,
                    }}
                  />
                ))}
              </div>
              <div className="text-xs font-semibold text-gray-800 leading-tight">{config.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{config.description}</div>
            </button>
          )
        },
      )}
    </div>
  )
}
