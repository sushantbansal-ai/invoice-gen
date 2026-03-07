'use client'

import { useFieldArray, useWatch, type Control, type UseFormRegister, type FieldErrors, type UseFormSetValue } from 'react-hook-form'
import { calculateLineItemAmount, formatNumber } from '@/lib/calculations'
import { CURRENCY_SYMBOLS } from '@/types/invoice'
import type { InvoiceFormValues } from '@/types/invoice'

interface LineItemsTableProps {
  control: Control<InvoiceFormValues>
  register: UseFormRegister<InvoiceFormValues>
  errors: FieldErrors<InvoiceFormValues>
  setValue: UseFormSetValue<InvoiceFormValues>
  currency: string
}

export function LineItemsTable({
  control,
  register,
  errors,
  setValue,
  currency,
}: LineItemsTableProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  // useWatch gives live updated values (field.amount from useFieldArray is stale after setValue)
  const watchedItems = useWatch({ control, name: 'items' })

  const currencySymbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '$'

  function handleQtyRateChange(index: number, fieldName: 'quantity' | 'rate', value: string) {
    const num = parseFloat(value) || 0
    setValue(`items.${index}.${fieldName}`, num)
    // Read sibling value from watchedItems (live form state) — avoids stale DOM reads on mobile
    const qty = fieldName === 'quantity' ? num : (Number(watchedItems?.[index]?.quantity) || 0)
    const rate = fieldName === 'rate' ? num : (Number(watchedItems?.[index]?.rate) || 0)
    setValue(`items.${index}.amount`, calculateLineItemAmount(qty, rate))
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs font-semibold">
              <th className="text-left py-2 px-2 rounded-l-lg w-6">#</th>
              <th className="text-left py-2 px-2">Description</th>
              <th className="text-right py-2 px-2 w-20">Qty</th>
              <th className="text-right py-2 px-2 w-28">Rate</th>
              <th className="text-right py-2 px-2 w-28">Amount</th>
              <th className="py-2 px-2 w-8 rounded-r-lg"></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                <td className="py-2 px-2 text-gray-400 text-xs">{index + 1}</td>
                <td className="py-2 px-2">
                  <input
                    {...register(`items.${index}.description`)}
                    placeholder="Item description"
                    className="w-full text-sm border-0 bg-transparent focus:bg-white focus:border focus:border-[#7C3AED] focus:rounded px-1 py-0.5 outline-none placeholder:text-gray-300 focus:ring-1 focus:ring-[#7C3AED] rounded"
                  />
                  {errors.items?.[index]?.description && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.items[index]?.description?.message}</p>
                  )}
                </td>
                <td className="py-2 px-2">
                  <input
                    id={`items.${index}.quantity`}
                    {...register(`items.${index}.quantity`, {
                      onChange: (e) => handleQtyRateChange(index, 'quantity', e.target.value),
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full text-sm border-0 bg-transparent focus:bg-white focus:border focus:border-[#7C3AED] rounded px-1 py-0.5 outline-none text-right focus:ring-1 focus:ring-[#7C3AED]"
                  />
                </td>
                <td className="py-2 px-2">
                  <div className="relative">
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">{currencySymbol}</span>
                    <input
                      id={`items.${index}.rate`}
                      {...register(`items.${index}.rate`, {
                        onChange: (e) => handleQtyRateChange(index, 'rate', e.target.value),
                      })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full text-sm border-0 bg-transparent focus:bg-white focus:border focus:border-[#7C3AED] rounded pl-4 pr-1 py-0.5 outline-none text-right focus:ring-1 focus:ring-[#7C3AED]"
                    />
                  </div>
                </td>
                <td className="py-2 px-2 text-right text-sm font-semibold text-gray-700">
                  <input {...register(`items.${index}.amount`)} type="hidden" />
                  <span>
                    {currencySymbol}{formatNumber(
                      parseFloat(String(watchedItems?.[index]?.amount ?? field.amount ?? 0)),
                    )}
                  </span>
                </td>
                <td className="py-2 px-2">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 disabled:opacity-0 disabled:cursor-not-allowed p-1 rounded"
                    title="Remove item"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-400">Item {index + 1}</span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-400 hover:text-red-600 p-0.5"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <input
              {...register(`items.${index}.description`)}
              placeholder="Item description"
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Qty</label>
                <input
                  {...register(`items.${index}.quantity`, {
                    onChange: (e) => handleQtyRateChange(index, 'quantity', e.target.value),
                  })}
                  type="number"
                  step="0.01"
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Rate</label>
                <input
                  {...register(`items.${index}.rate`, {
                    onChange: (e) => handleQtyRateChange(index, 'rate', e.target.value),
                  })}
                  type="number"
                  step="0.01"
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Amount</label>
                <div className="text-sm font-semibold text-gray-700 py-1.5 px-2 bg-gray-50 rounded">
                  {currencySymbol}{formatNumber(parseFloat(String(watchedItems?.[index]?.amount ?? field.amount ?? 0)))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Button */}
      <button
        type="button"
        onClick={() =>
          append({ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0 })
        }
        className="mt-3 flex items-center gap-1.5 text-sm text-[#7C3AED] hover:text-[#5b21b6] font-medium transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </button>

      {errors.items && typeof errors.items === 'object' && 'message' in errors.items && (
        <p className="text-red-500 text-xs mt-1">{errors.items.message as string}</p>
      )}
    </div>
  )
}
