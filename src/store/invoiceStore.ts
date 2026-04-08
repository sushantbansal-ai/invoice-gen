import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Invoice, LineItem, TemplateId, InvoiceStatus, BilledParty, BankDetails } from '@/types/invoice'

const defaultInvoice: Invoice = {
  invoiceNo: 'INV-0001',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'unpaid',
  logo: undefined,
  billedBy: {
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    gstin: '',
    email: '',
    phone: '',
    website: '',
    attendee: '',
  },
  billedTo: {
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    gstin: '',
    email: '',
    phone: '',
  },
  items: [
    {
      id: uuidv4(),
      description: 'Professional Services',
      hsn: '',
      taxRate: undefined,
      quantity: 1,
      rate: 1000,
      amount: 1000,
    },
  ],
  currency: 'USD',
  cgstRate: undefined,
  sgstRate: undefined,
  discountRate: undefined,
  bankDetails: {
    accountName: '',
    accountNumber: '',
    ifsc: '',
    swift: '',
    bank: '',
    routingNumber: '',
    branch: '',
  },
  conversionDetails: undefined,
  payments: [],
  notes: '',
  terms: 'Payment is due within 15 days of invoice date.',
  template: 'classic-purple',
}

interface InvoiceStore {
  invoice: Invoice
  isExporting: boolean
  isDriveUploading: boolean

  updateInvoice: (updates: Partial<Invoice>) => void
  updateLineItem: (id: string, updates: Partial<LineItem>) => void
  addLineItem: () => void
  removeLineItem: (id: string) => void
  setTemplate: (template: TemplateId) => void
  setStatus: (status: InvoiceStatus) => void
  setLogo: (logo: string | null) => void
  resetInvoice: (profileData?: { billedBy?: Partial<BilledParty>; bankDetails?: Partial<BankDetails>; logo?: string }) => void
  setIsExporting: (v: boolean) => void
  setIsDriveUploading: (v: boolean) => void
}

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set) => ({
      invoice: defaultInvoice,
      isExporting: false,
      isDriveUploading: false,

      updateInvoice: (updates) =>
        set((state) => ({ invoice: { ...state.invoice, ...updates } })),

      updateLineItem: (id, updates) =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            items: state.invoice.items.map((item) =>
              item.id === id ? { ...item, ...updates } : item,
            ),
          },
        })),

      addLineItem: () =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            items: [
              ...state.invoice.items,
              {
                id: uuidv4(),
                description: '',
                hsn: '',
                taxRate: undefined,
                quantity: 1,
                rate: 0,
                amount: 0,
              },
            ],
          },
        })),

      removeLineItem: (id) =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            items: state.invoice.items.filter((item) => item.id !== id),
          },
        })),

      setTemplate: (template) =>
        set((state) => ({ invoice: { ...state.invoice, template } })),

      setStatus: (status) =>
        set((state) => ({ invoice: { ...state.invoice, status } })),

      setLogo: (logo) =>
        set((state) => ({
          invoice: { ...state.invoice, logo: logo ?? undefined },
        })),

      resetInvoice: (profileData) =>
        set({
          invoice: {
            ...defaultInvoice,
            invoiceDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            ...(profileData?.billedBy
              ? { billedBy: profileData.billedBy as BilledParty }
              : {}),
            ...(profileData?.bankDetails
              ? { bankDetails: profileData.bankDetails as BankDetails }
              : {}),
            ...(profileData?.logo ? { logo: profileData.logo } : {}),
          },
        }),

      setIsExporting: (v) => set({ isExporting: v }),

      setIsDriveUploading: (v) => set({ isDriveUploading: v }),
    }),
    {
      name: 'invoice-storage-v2', // bumped to clear old placeholder data
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ invoice: state.invoice }),
    },
  ),
)
