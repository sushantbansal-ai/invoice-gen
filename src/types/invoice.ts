import { z } from 'zod'

export type InvoiceStatus = 'paid' | 'unpaid' | 'pending' | 'overdue'
export type TemplateId = 'classic-purple' | 'modern-minimal' | 'professional-dark' | 'creative-bold' | 'corporate-blue'
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'JPY' | 'SGD' | 'AED' | 'CHF'

export interface BilledParty {
  name: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  gstin?: string
  email?: string
  phone?: string
  website?: string
  attendee?: string
}

export interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface BankDetails {
  accountName?: string
  accountNumber?: string
  ifsc?: string
  swift?: string
  bank?: string
  routingNumber?: string
  branch?: string
}

export interface ConversionDetails {
  toCurrency?: string
  conversionRate?: number
  charges?: number
  convertedAmount?: number
}

export interface Payment {
  id: string
  date: string
  mode: string
  amountReceived: number
  paymentAccount?: string
  notes?: string
}

export interface Invoice {
  invoiceNo: string
  invoiceDate: string
  dueDate: string
  status: InvoiceStatus
  logo?: string

  billedBy: BilledParty
  billedTo: BilledParty

  items: LineItem[]
  currency: CurrencyCode
  taxName?: string
  taxRate?: number
  discountRate?: number

  bankDetails?: BankDetails
  conversionDetails?: ConversionDetails
  payments?: Payment[]

  notes?: string
  terms?: string
  template: TemplateId
}

// ─── Zod Schemas ────────────────────────────────────────────────────────────

const billedPartySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  zipCode: z.string().min(1, 'ZIP/Postal code is required'),
  gstin: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  attendee: z.string().optional(),
})

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be > 0'),
  rate: z.coerce.number().min(0, 'Rate must be >= 0'),
  amount: z.coerce.number(),
})

const bankDetailsSchema = z.object({
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifsc: z.string().optional(),
  swift: z.string().optional(),
  bank: z.string().optional(),
  routingNumber: z.string().optional(),
  branch: z.string().optional(),
}).optional()

const conversionDetailsSchema = z.object({
  toCurrency: z.string().optional(),
  conversionRate: z.coerce.number().optional(),
  charges: z.coerce.number().optional(),
  convertedAmount: z.coerce.number().optional(),
}).optional()

const paymentSchema = z.object({
  id: z.string(),
  date: z.string().min(1, 'Date is required'),
  mode: z.string().min(1, 'Payment mode is required'),
  amountReceived: z.coerce.number().min(0),
  paymentAccount: z.string().optional(),
  notes: z.string().optional(),
})

export const invoiceSchema = z.object({
  invoiceNo: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['paid', 'unpaid', 'pending', 'overdue']),
  logo: z.string().optional(),
  billedBy: billedPartySchema,
  billedTo: billedPartySchema,
  items: z.array(lineItemSchema).min(1, 'At least one item is required'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'SGD', 'AED', 'CHF']),
  taxName: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discountRate: z.coerce.number().min(0).max(100).optional(),
  bankDetails: bankDetailsSchema,
  conversionDetails: conversionDetailsSchema,
  payments: z.array(paymentSchema).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  template: z.enum(['classic-purple', 'modern-minimal', 'professional-dark', 'creative-bold', 'corporate-blue']),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>

// ─── Template Configs ────────────────────────────────────────────────────────

export const TEMPLATE_CONFIGS = {
  'classic-purple': {
    label: 'Classic Purple',
    description: 'Professional purple-themed invoice',
    primaryColor: '#7C3AED',
    accentColor: '#312E81',
    bgColor: '#F3F4F6',
    headerBg: '#312E81',
    headerText: '#FFFFFF',
    badgeColor: '#10B981',
    sectionBg: '#F3F4F6',
    swatchColors: ['#7C3AED', '#6539c0', '#F3F4F6'],
  },
  'modern-minimal': {
    label: 'Modern Minimal',
    description: 'Clean blue minimalist design',
    primaryColor: '#2563EB',
    accentColor: '#1E40AF',
    bgColor: '#EFF6FF',
    headerBg: '#EFF6FF',
    headerText: '#1E40AF',
    badgeColor: '#059669',
    sectionBg: '#FFFFFF',
    swatchColors: ['#2563EB', '#1E40AF', '#EFF6FF'],
  },
  'professional-dark': {
    label: 'Professional Dark',
    description: 'Dark navy with gold accents',
    primaryColor: '#D97706',
    accentColor: '#1E3A5F',
    bgColor: '#0F172A',
    headerBg: '#0F172A',
    headerText: '#D97706',
    badgeColor: '#10B981',
    sectionBg: '#1E293B',
    swatchColors: ['#D97706', '#0F172A', '#1E293B'],
  },
  'creative-bold': {
    label: 'Creative Bold',
    description: 'Vibrant gradient design',
    primaryColor: '#EC4899',
    accentColor: '#8B5CF6',
    bgColor: '#FDF4FF',
    headerBg: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
    headerText: '#FFFFFF',
    badgeColor: '#10B981',
    sectionBg: '#FDF4FF',
    swatchColors: ['#EC4899', '#8B5CF6', '#FDF4FF'],
  },
  'corporate-blue': {
    label: 'Corporate Blue',
    description: 'Clean blue GST invoice style',
    primaryColor: '#1877C8',
    accentColor: '#0D5FA0',
    bgColor: '#FFFFFF',
    headerBg: '#1877C8',
    headerText: '#FFFFFF',
    badgeColor: '#22C55E',
    sectionBg: '#EBF4FF',
    swatchColors: ['#1877C8', '#0D5FA0', '#EBF4FF'],
  },
} as const

// ─── Currency Symbols ────────────────────────────────────────────────────────

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
  SGD: 'S$',
  AED: 'د.إ',
  CHF: 'Fr',
}

export const STATUS_CONFIG: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
  paid: { label: 'Paid', bg: '#D1FAE5', text: '#065F46' },
  unpaid: { label: 'Unpaid', bg: '#FEE2E2', text: '#991B1B' },
  pending: { label: 'Pending', bg: '#FEF3C7', text: '#92400E' },
  overdue: { label: 'Overdue', bg: '#FFE4E6', text: '#9F1239' },
}
