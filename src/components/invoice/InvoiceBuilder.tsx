'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuidv4 } from 'uuid'
import { Country, State } from 'country-state-city'
import { invoiceSchema, type InvoiceFormValues } from '@/types/invoice'
import type { BilledParty, BankDetails } from '@/types/invoice'
import { useInvoiceStore } from '@/store/invoiceStore'
import { useUserProfileStore } from '@/store/userProfileStore'
import { calculateLineItemAmount, calculateTotals } from '@/lib/calculations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { LineItemsTable } from './LineItemsTable'
import { TemplateSelector } from './TemplateSelector'

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
]

const STATUSES = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
]

const PAYMENT_MODES = ['Bank Transfer', 'Account Transfer', 'Credit Card', 'PayPal', 'Cash', 'Check', 'Other']

// Country options with flag emoji
const COUNTRY_OPTIONS = Country.getAllCountries().map((c) => ({
  value: c.name,
  label: `${c.flag} ${c.name}`,
}))

function getStateOptions(countryName: string) {
  const country = Country.getAllCountries().find((c) => c.name === countryName)
  if (!country) return []
  return State.getStatesOfCountry(country.isoCode).map((s) => ({
    value: s.name,
    label: s.name,
  }))
}

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}

function CollapsibleSection({ title, children, defaultOpen = false, badge }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          {badge && (
            <span className="text-xs bg-[#7C3AED] text-white px-1.5 py-0.5 rounded-full">{badge}</span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}

function SectionTitle({ children, badge }: { children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h3 className="text-sm font-semibold text-gray-700">{children}</h3>
      {badge}
    </div>
  )
}

export function InvoiceBuilder() {
  const storeInvoice = useInvoiceStore((s) => s.invoice)
  const updateInvoice = useInvoiceStore((s) => s.updateInvoice)
  const setLogo = useInvoiceStore((s) => s.setLogo)
  const resetInvoice = useInvoiceStore((s) => s.resetInvoice)

  const profileStore = useUserProfileStore()

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const profileSaveRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      ...storeInvoice,
      items: storeInvoice.items.map((item) => ({ ...item })),
    },
  })

  const { register, control, watch, setValue, getValues, formState: { errors } } = form

  // On mount: pre-fill billedBy + logo from saved profile if current form is blank
  useEffect(() => {
    const { profile, hasProfile } = profileStore
    if (hasProfile && profile.billedBy?.name && !form.getValues('billedBy.name')) {
      form.reset({
        ...form.getValues(),
        billedBy: { ...form.getValues('billedBy'), ...profile.billedBy } as BilledParty,
        ...(profile.bankDetails ? {
          bankDetails: { ...form.getValues('bankDetails'), ...profile.bankDetails } as BankDetails,
        } : {}),
      })
      if (profile.logo) {
        setLogo(profile.logo)
        setValue('logo', profile.logo)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync form → store with debounce
  useEffect(() => {
    const subscription = watch((values) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        if (values && Object.keys(values).length > 0) {
          // Recalculate line item amounts before syncing
          const items = (values.items || []).map((item) => ({
            ...item,
            id: item?.id || uuidv4(),
            description: item?.description || '',
            hsn: item?.hsn || '',
            taxRate: item?.taxRate ? Number(item.taxRate) : undefined,
            quantity: Number(item?.quantity) || 0,
            rate: Number(item?.rate) || 0,
            amount: calculateLineItemAmount(Number(item?.quantity) || 0, Number(item?.rate) || 0),
          }))
          const conversionDetails = values.conversionDetails
            ? {
                toCurrency: values.conversionDetails.toCurrency || '',
                conversionRate:
                  values.conversionDetails.conversionRate
                    ? Number(values.conversionDetails.conversionRate)
                    : undefined,
                charges:
                  values.conversionDetails.charges
                    ? Number(values.conversionDetails.charges)
                    : undefined,
                convertedAmount:
                  values.conversionDetails.convertedAmount
                    ? Number(values.conversionDetails.convertedAmount)
                    : undefined,
              }
            : undefined
          // Preserve the template from the store — TemplateSelector updates the store
          // directly (not via this form), so values.template is always stale.
          // No startTransition here — the preview uses direct HTML rendering (cheap),
          // so deferring the update causes description/HSN changes to lag or be missed.
          updateInvoice({
            ...(values as InvoiceFormValues),
            items,
            conversionDetails,
            template: useInvoiceStore.getState().invoice.template,
          })
        }
      }, 150)
    })
    return () => {
      subscription.unsubscribe()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [watch, updateInvoice])

  // Auto-save billedBy + bankDetails to profile (debounced 800ms)
  useEffect(() => {
    const sub = form.watch((values, { name }) => {
      if (!name?.startsWith('billedBy') && !name?.startsWith('bankDetails')) return
      clearTimeout(profileSaveRef.current)
      profileSaveRef.current = setTimeout(() => {
        profileStore.saveProfile({
          billedBy: values.billedBy as Partial<BilledParty>,
          bankDetails: values.bankDetails as Partial<BankDetails>,
        })
      }, 800)
    })
    return () => {
      sub.unsubscribe()
      clearTimeout(profileSaveRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setLogo(base64)
      setValue('logo', base64)
      // Also persist logo to profile
      profileStore.saveProfile({ logo: base64 })
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveLogo() {
    setLogo(null)
    setValue('logo', undefined)
    profileStore.saveProfile({ logo: undefined })
  }

  // useWatch subscribes only to specific fields (unlike watch() which re-renders on ANY change)
  const watchedPayments = useWatch({ control, name: 'payments' }) ?? []
  const currency = useWatch({ control, name: 'currency' })
  const billedByCountry = useWatch({ control, name: 'billedBy.country' })
  const billedToCountry = useWatch({ control, name: 'billedTo.country' })
  const watchedConversionRate = useWatch({ control, name: 'conversionDetails.conversionRate' })
  const watchedConversionCharges = useWatch({ control, name: 'conversionDetails.charges' })

  // Auto-calculate convertedAmount whenever conversionRate or charges changes.
  // Users can still override the converted amount manually afterward.
  useEffect(() => {
    const rate = Number(watchedConversionRate) || 0
    if (!rate) return
    const charges = Number(watchedConversionCharges) || 0
    const items = getValues('items')
    const discountRate = Number(getValues('discountRate')) || 0
    const cgstRate = Number(getValues('cgstRate')) || 0
    const sgstRate = Number(getValues('sgstRate')) || 0
    const { total } = calculateTotals(items, discountRate, cgstRate, sgstRate)
    const converted = Math.round((total * rate + charges) * 100) / 100
    setValue('conversionDetails.convertedAmount', converted)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedConversionRate, watchedConversionCharges])

  // Memoize state options — getStateOptions iterates all countries on every call
  const billedByStateOptions = useMemo(() => getStateOptions(billedByCountry || ''), [billedByCountry])
  const billedToStateOptions = useMemo(() => getStateOptions(billedToCountry || ''), [billedToCountry])

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
      {/* Template Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionTitle>Choose Template</SectionTitle>
        <TemplateSelector />
      </div>

      {/* Invoice Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionTitle>Invoice Details</SectionTitle>
        <div className="grid grid-cols-2 gap-3 items-start">
          <Input
            label="Invoice Number"
            required
            error={errors.invoiceNo?.message}
            {...register('invoiceNo')}
          />
          <Input
            as="select"
            label="Status"
            options={STATUSES}
            {...register('status')}
          />
          <Input
            label="Invoice Date"
            type="date"
            required
            error={errors.invoiceDate?.message}
            {...register('invoiceDate')}
          />
          <Input
            label="Due Date"
            type="date"
            required
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
        </div>
      </div>

      {/* Logo Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionTitle>Company Logo</SectionTitle>
        {storeInvoice.logo ? (
          <div className="flex items-center gap-3">
            <img
              src={storeInvoice.logo}
              alt="Company Logo"
              className="h-14 w-auto object-contain rounded border border-gray-200 p-1"
            />
            <Button type="button" variant="ghost" size="sm" onClick={handleRemoveLogo}>
              Remove
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#7C3AED] hover:bg-[#7C3AED08] transition-colors">
            <svg className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-500">Click to upload logo <span className="text-gray-400">(max 2MB)</span></span>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Billed By */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionTitle
          badge={
            profileStore.hasProfile ? (
              <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full font-medium">
                Profile saved ✓
              </span>
            ) : undefined
          }
        >
          Billed By (Your Details)
        </SectionTitle>
        <div className="space-y-3">
          <Input label="Company / Name" required error={errors.billedBy?.name?.message} {...register('billedBy.name')} />
          <Input label="Address" error={errors.billedBy?.address?.message} {...register('billedBy.address')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" error={errors.billedBy?.city?.message} {...register('billedBy.city')} />
            <Input label="ZIP / Postal Code" error={errors.billedBy?.zipCode?.message} {...register('billedBy.zipCode')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SearchableSelect
              name="billedBy.country"
              control={control}
              label="Country"
              options={COUNTRY_OPTIONS}
              error={errors.billedBy?.country?.message}
            />
            <SearchableSelect
              name="billedBy.state"
              control={control}
              label="State / Province"
              options={billedByStateOptions}
              placeholder="Select state..."
              error={errors.billedBy?.state?.message}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" error={errors.billedBy?.email?.message} {...register('billedBy.email')} />
            <Input label="Phone" error={errors.billedBy?.phone?.message} {...register('billedBy.phone')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="GSTIN (optional)" error={errors.billedBy?.gstin?.message} {...register('billedBy.gstin')} />
            <Input label="Attendee (optional)" error={errors.billedBy?.attendee?.message} {...register('billedBy.attendee')} />
          </div>
        </div>
      </div>

      {/* Billed To */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionTitle>Billed To (Client Details)</SectionTitle>
        <div className="space-y-3">
          <Input label="Company / Name" required error={errors.billedTo?.name?.message} {...register('billedTo.name')} />
          <Input label="Address" error={errors.billedTo?.address?.message} {...register('billedTo.address')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" error={errors.billedTo?.city?.message} {...register('billedTo.city')} />
            <Input label="ZIP / Postal Code" error={errors.billedTo?.zipCode?.message} {...register('billedTo.zipCode')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SearchableSelect
              name="billedTo.country"
              control={control}
              label="Country"
              options={COUNTRY_OPTIONS}
              error={errors.billedTo?.country?.message}
            />
            <SearchableSelect
              name="billedTo.state"
              control={control}
              label="State / Province"
              options={billedToStateOptions}
              placeholder="Select state..."
              error={errors.billedTo?.state?.message}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" error={errors.billedTo?.email?.message} {...register('billedTo.email')} />
            <Input label="Phone" error={errors.billedTo?.phone?.message} {...register('billedTo.phone')} />
          </div>
          <Input label="GSTIN / Tax Number (optional)" error={errors.billedTo?.gstin?.message} {...register('billedTo.gstin')} />
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionTitle>Items</SectionTitle>
        <LineItemsTable
          control={control}
          register={register}
          errors={errors}
          setValue={setValue}
          getValues={getValues}
          currency={currency}
        />
      </div>

      {/* Totals Config */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionTitle>Currency & Totals</SectionTitle>
        {/* Row 1: Currency | Discount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Currency <span className="text-red-500">*</span>
            </label>
            <select
              {...register('currency')}
              className="w-full rounded-lg border-2 border-[#7C3AED] bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#5B21B6] focus:outline-none focus:ring-1 focus:ring-[#5B21B6] font-medium"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Discount (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0"
            {...register('discountRate')}
          />
        </div>
        {/* Row 2: CGST | SGST */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Input
            label="CGST Rate (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0"
            helperText="Central GST (intra-state)"
            {...register('cgstRate')}
          />
          <Input
            label="SGST Rate (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0"
            helperText="State GST (intra-state)"
            {...register('sgstRate')}
          />
        </div>
      </div>

      {/* Bank Details */}
      <CollapsibleSection title="Bank Details" defaultOpen={false}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Account Name" {...register('bankDetails.accountName')} />
            <Input label="Account Number" {...register('bankDetails.accountNumber')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Bank Name" {...register('bankDetails.bank')} />
            <Input label="Branch" {...register('bankDetails.branch')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="IFSC Code" {...register('bankDetails.ifsc')} />
            <Input label="SWIFT Code" {...register('bankDetails.swift')} />
          </div>
          <Input label="Routing Number" {...register('bankDetails.routingNumber')} />
        </div>
      </CollapsibleSection>

      {/* Currency Conversion */}
      <CollapsibleSection title="Currency Conversion" defaultOpen={false}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="To Currency (e.g. INR)" placeholder="INR" {...register('conversionDetails.toCurrency')} />
            <Input label="Conversion Rate" type="number" step="0.01" placeholder="82.88" {...register('conversionDetails.conversionRate')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Bank Charges" type="number" step="0.01" placeholder="0" {...register('conversionDetails.charges')} />
            <Input label="Converted Amount" type="number" step="0.01" placeholder="Enter manually or auto-calculate" helperText="Auto-filled from total, but you can edit it." {...register('conversionDetails.convertedAmount')} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Payments */}
      <CollapsibleSection
        title="Payment Records"
        defaultOpen={false}
        badge={watchedPayments.length > 0 ? String(watchedPayments.length) : undefined}
      >
        <div className="space-y-3">
          {watchedPayments.map((payment, index) => (
            <div key={payment?.id || index} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-600">Payment {index + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const current = form.getValues('payments') || []
                    setValue('payments', current.filter((_, i) => i !== index))
                  }}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Date" type="date" {...register(`payments.${index}.date`)} />
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Mode</label>
                  <select
                    {...register(`payments.${index}.mode`)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                  >
                    {PAYMENT_MODES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Amount Received" type="number" step="0.01" {...register(`payments.${index}.amountReceived`)} />
                <Input label="Payment Account" placeholder="e.g. Account #1234" {...register(`payments.${index}.paymentAccount`)} />
              </div>
              <Input label="Notes" placeholder="e.g. Reference ID" {...register(`payments.${index}.notes`)} />
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              const current = form.getValues('payments') || []
              const items = form.getValues('items')
              const discountRate = Number(form.getValues('discountRate')) || 0
              const cgstRate = Number(form.getValues('cgstRate')) || 0
              const sgstRate = Number(form.getValues('sgstRate')) || 0
              const { total } = calculateTotals(items, discountRate, cgstRate, sgstRate)
              setValue('payments', [
                ...current,
                {
                  id: uuidv4(),
                  date: new Date().toISOString().split('T')[0],
                  mode: 'Bank Transfer',
                  amountReceived: total,
                  paymentAccount: '',
                  notes: '',
                },
              ])
            }}
          >
            + Add Payment
          </Button>
        </div>
      </CollapsibleSection>

      {/* Notes & Terms */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionTitle>Notes & Terms</SectionTitle>
        <div className="space-y-3">
          <Input
            as="textarea"
            label="Notes"
            placeholder="Thank you for your business!"
            rows={2}
            {...register('notes')}
          />
          <Input
            as="textarea"
            label="Terms & Conditions"
            placeholder="Payment is due within 15 days..."
            rows={2}
            {...register('terms')}
          />
        </div>
      </div>

      {/* Reset */}
      <div className="pb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm('Reset invoice? Your company profile (name, address, bank details) will be kept.')) {
              resetInvoice({
                billedBy: profileStore.profile.billedBy,
                bankDetails: profileStore.profile.bankDetails,
                logo: profileStore.profile.logo,
              })
              window.location.reload()
            }
          }}
          className="text-gray-400 hover:text-red-500"
        >
          Reset Invoice
        </Button>
      </div>
    </form>
  )
}
