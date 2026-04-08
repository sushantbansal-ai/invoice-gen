import type { LineItem, CurrencyCode } from '@/types/invoice'

export function calculateLineItemAmount(quantity: number, rate: number): number {
  return Math.round(quantity * rate * 100) / 100
}

export function calculateSubtotal(items: LineItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return Math.round(subtotal * (taxRate / 100) * 100) / 100
}

export function calculateDiscount(subtotal: number, discountRate: number): number {
  return Math.round(subtotal * (discountRate / 100) * 100) / 100
}

export function calculateTotal(subtotal: number, tax: number, discount: number): number {
  return Math.round((subtotal + tax - discount) * 100) / 100
}

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export interface InvoiceTotals {
  subtotal: number
  taxAmount: number
  cgstAmount: number
  sgstAmount: number
  discountAmount: number
  total: number
}

export function calculateTotals(
  items: LineItem[],
  discountRate?: number,
  cgstRate?: number,
  sgstRate?: number,
  totalAmount?: number,
): InvoiceTotals {
  const subtotal = calculateSubtotal(items)
  const taxAmount = Math.round(
    items.reduce((sum, item) => sum + item.amount * ((item.taxRate || 0) / 100), 0) * 100
  ) / 100
  const cgstAmount = cgstRate ? calculateTax(subtotal, cgstRate) : 0
  const sgstAmount = sgstRate ? calculateTax(subtotal, sgstRate) : 0
  const discountAmount = discountRate ? calculateDiscount(subtotal, discountRate) : 0
  const total = totalAmount || calculateTotal(subtotal, taxAmount + cgstAmount + sgstAmount, discountAmount)
  return { subtotal, taxAmount, cgstAmount, sgstAmount, discountAmount, total }
}
