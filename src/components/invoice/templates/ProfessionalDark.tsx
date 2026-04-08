import { format } from 'date-fns'
import type { Invoice } from '@/types/invoice'
import type { InvoiceTotals } from '@/lib/calculations'
import { formatCurrency, formatNumber } from '@/lib/calculations'
import { CURRENCY_SYMBOLS } from '@/types/invoice'

interface TemplateProps {
  invoice: Invoice
  totals: InvoiceTotals
  isPdfExport?: boolean
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM dd, yyyy')
  } catch {
    return dateStr
  }
}

const STATUS_DARK: Record<string, { label: string; border: string; color: string }> = {
  paid: { label: 'PAID', border: '#10B981', color: '#10B981' },
  unpaid: { label: 'UNPAID', border: '#EF4444', color: '#EF4444' },
  pending: { label: 'PENDING', border: '#F59E0B', color: '#F59E0B' },
  overdue: { label: 'OVERDUE', border: '#F43F5E', color: '#F43F5E' },
}

export function ProfessionalDark({ invoice, totals }: TemplateProps) {
  const status = STATUS_DARK[invoice.status] || STATUS_DARK.unpaid
  const currencySymbol = CURRENCY_SYMBOLS[invoice.currency]
  const hasHsn = invoice.items.some(item => item.hsn)
  const hasItemTax = invoice.items.some(item => item.taxRate)
  const hasBankDetails =
    invoice.bankDetails?.accountName || invoice.bankDetails?.accountNumber ||
    invoice.bankDetails?.ifsc || invoice.bankDetails?.swift ||
    invoice.bankDetails?.bank || invoice.bankDetails?.routingNumber || invoice.bankDetails?.branch
  const hasConversion = invoice.conversionDetails?.conversionRate
  const hasPayments = invoice.payments && invoice.payments.length > 0

  // Using explicit hex colors throughout (not CSS vars) for html2canvas compatibility
  const BG = '#0F172A'
  const SURFACE = '#1E293B'
  const BORDER = '#334155'
  const GOLD = '#D97706'
  const TEXT_PRIMARY = '#F8FAFC'
  const TEXT_SECONDARY = '#94A3B8'
  const TEXT_MUTED = '#64748B'

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '13px',
        color: TEXT_PRIMARY,
        backgroundColor: BG,
        padding: '0',
        minHeight: '1123px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header Bar */}
      <div style={{ backgroundColor: SURFACE, padding: '28px 40px', borderBottom: `2px solid ${GOLD}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: GOLD, letterSpacing: '-0.5px' }}>
              INVOICE
            </div>
            <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
              <div>
                <div style={{ fontSize: '10px', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>No.</div>
                <div style={{ fontWeight: '700', color: TEXT_PRIMARY, fontSize: '13px' }}>{invoice.invoiceNo}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Date</div>
                <div style={{ fontWeight: '600', color: TEXT_PRIMARY, fontSize: '13px' }}>{formatDate(invoice.invoiceDate)}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Due</div>
                <div style={{ fontWeight: '600', color: TEXT_PRIMARY, fontSize: '13px' }}>{formatDate(invoice.dueDate)}</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {invoice.logo ? (
              <img src={invoice.logo} alt="Logo" style={{ maxHeight: '70px', maxWidth: '160px', objectFit: 'contain', marginBottom: '10px', display: 'block', marginLeft: 'auto' }} />
            ) : null}
            <span style={{
              display: 'inline-block',
              border: `2px solid ${status.border}`,
              color: status.color,
              height: '24px',
              padding: '0 8px',
              lineHeight: '20px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '2px',
              textAlign: 'center',
              verticalAlign: 'middle',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
            }}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 40px' }}>
        {/* Billed By / Billed To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          <div style={{ backgroundColor: SURFACE, borderRadius: '6px', padding: '18px', borderLeft: `3px solid ${GOLD}` }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
              From
            </div>
            <div style={{ fontWeight: '700', color: TEXT_PRIMARY, fontSize: '14px', marginBottom: '4px' }}>{invoice.billedBy.name}</div>
            {invoice.billedBy.address && <div style={{ color: TEXT_SECONDARY, lineHeight: '1.6', fontSize: '12px' }}>{invoice.billedBy.address}</div>}
            {invoice.billedBy.city && (
              <div style={{ color: TEXT_SECONDARY, fontSize: '12px' }}>
                {[invoice.billedBy.city, invoice.billedBy.state].filter(Boolean).join(', ')}
              </div>
            )}
            {invoice.billedBy.country && (
              <div style={{ color: TEXT_SECONDARY, fontSize: '12px' }}>
                {[invoice.billedBy.country, invoice.billedBy.zipCode].filter(Boolean).join(' ')}
              </div>
            )}
            {invoice.billedBy.gstin && (
              <div style={{ color: TEXT_SECONDARY, fontSize: '11px', marginTop: '4px' }}>
                GSTIN: {invoice.billedBy.gstin}
              </div>
            )}
            {invoice.billedBy.email && <div style={{ color: GOLD, fontSize: '11px', marginTop: '4px' }}>{invoice.billedBy.email}</div>}
            {invoice.billedBy.phone && <div style={{ color: TEXT_SECONDARY, fontSize: '11px' }}>{invoice.billedBy.phone}</div>}
            {invoice.billedBy.attendee && <div style={{ color: TEXT_SECONDARY, fontSize: '11px', marginTop: '4px' }}>Attendee: {invoice.billedBy.attendee}</div>}
          </div>
          <div style={{ backgroundColor: SURFACE, borderRadius: '6px', padding: '18px', borderLeft: `3px solid ${BORDER}` }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
              Bill To
            </div>
            <div style={{ fontWeight: '700', color: TEXT_PRIMARY, fontSize: '14px', marginBottom: '4px' }}>{invoice.billedTo.name}</div>
            {invoice.billedTo.address && <div style={{ color: TEXT_SECONDARY, lineHeight: '1.6', fontSize: '12px' }}>{invoice.billedTo.address}</div>}
            {invoice.billedTo.city && (
              <div style={{ color: TEXT_SECONDARY, fontSize: '12px' }}>
                {[invoice.billedTo.city, invoice.billedTo.state].filter(Boolean).join(', ')}
              </div>
            )}
            {invoice.billedTo.country && (
              <div style={{ color: TEXT_SECONDARY, fontSize: '12px' }}>
                {[invoice.billedTo.country, invoice.billedTo.zipCode].filter(Boolean).join(' ')}
              </div>
            )}
            {invoice.billedTo.gstin && (
              <div style={{ color: TEXT_SECONDARY, fontSize: '11px', marginTop: '4px' }}>GSTIN: {invoice.billedTo.gstin}</div>
            )}
            {invoice.billedTo.email && <div style={{ color: TEXT_SECONDARY, fontSize: '11px', marginTop: '4px' }}>{invoice.billedTo.email}</div>}
            {invoice.billedTo.phone && <div style={{ color: TEXT_SECONDARY, fontSize: '11px' }}>{invoice.billedTo.phone}</div>}
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ backgroundColor: '#0F1B2D' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '1px' }}>#</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '1px' }}>Description</th>
              {hasHsn && <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '1px' }}>HSN/SAC</th>}
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '1px' }}>Qty</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '1px' }}>Rate</th>
              {hasItemTax && <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '1px' }}>Tax %</th>}
              {hasItemTax && <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '1px' }}>Tax Amt</th>}
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '1px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => {
              const itemTax = item.taxRate ? Math.round(item.amount * (item.taxRate / 100) * 100) / 100 : 0
              return (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? SURFACE : '#162032',
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                >
                  <td style={{ padding: '11px 12px', color: TEXT_MUTED, fontSize: '12px' }}>{index + 1}</td>
                  <td style={{ padding: '11px 12px', color: TEXT_PRIMARY }}>{item.description}</td>
                  {hasHsn && <td style={{ padding: '11px 12px', textAlign: 'center', color: TEXT_MUTED, fontSize: '12px' }}>{item.hsn || '—'}</td>}
                  <td style={{ padding: '11px 12px', textAlign: 'right', color: TEXT_SECONDARY }}>{item.quantity}</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', color: TEXT_SECONDARY }}>
                    {currencySymbol}{formatNumber(item.rate)}
                  </td>
                  {hasItemTax && <td style={{ padding: '11px 12px', textAlign: 'right', color: TEXT_SECONDARY }}>{item.taxRate ? `${item.taxRate}%` : '—'}</td>}
                  {hasItemTax && <td style={{ padding: '11px 12px', textAlign: 'right', color: TEXT_SECONDARY }}>{currencySymbol}{formatNumber(itemTax)}</td>}
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: '700', color: TEXT_PRIMARY }}>
                    {currencySymbol}{formatNumber(item.amount)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Bank Details + Totals */}
        <div style={{ display: 'grid', gridTemplateColumns: hasBankDetails ? '1fr 1fr' : '1fr', gap: '16px', marginBottom: '24px' }}>
          {hasBankDetails && (
            <div style={{ backgroundColor: SURFACE, borderRadius: '6px', padding: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Bank Details</div>
              <table style={{ borderCollapse: 'collapse' }}>
                <tbody>
                  {invoice.bankDetails?.accountName && (
                    <tr>
                      <td style={{ paddingRight: '12px', paddingBottom: '5px', color: TEXT_MUTED, fontSize: '11px' }}>Account Name</td>
                      <td style={{ paddingBottom: '5px', color: TEXT_PRIMARY, fontSize: '12px', fontWeight: '600' }}>{invoice.bankDetails.accountName}</td>
                    </tr>
                  )}
                  {invoice.bankDetails?.accountNumber && (
                    <tr>
                      <td style={{ paddingRight: '12px', paddingBottom: '5px', color: TEXT_MUTED, fontSize: '11px' }}>Account No.</td>
                      <td style={{ paddingBottom: '5px', color: TEXT_PRIMARY, fontSize: '12px', fontWeight: '600' }}>{invoice.bankDetails.accountNumber}</td>
                    </tr>
                  )}
                  {invoice.bankDetails?.bank && (
                    <tr>
                      <td style={{ paddingRight: '12px', paddingBottom: '5px', color: TEXT_MUTED, fontSize: '11px' }}>Bank</td>
                      <td style={{ paddingBottom: '5px', color: TEXT_PRIMARY, fontSize: '12px', fontWeight: '600' }}>{invoice.bankDetails.bank}</td>
                    </tr>
                  )}
                  {invoice.bankDetails?.branch && (
                    <tr>
                      <td style={{ paddingRight: '12px', paddingBottom: '5px', color: TEXT_MUTED, fontSize: '11px' }}>Branch</td>
                      <td style={{ paddingBottom: '5px', color: TEXT_PRIMARY, fontSize: '12px', fontWeight: '600' }}>{invoice.bankDetails.branch}</td>
                    </tr>
                  )}
                  {invoice.bankDetails?.ifsc && (
                    <tr>
                      <td style={{ paddingRight: '12px', paddingBottom: '5px', color: TEXT_MUTED, fontSize: '11px' }}>IFSC</td>
                      <td style={{ paddingBottom: '5px', color: TEXT_PRIMARY, fontSize: '12px', fontWeight: '600' }}>{invoice.bankDetails.ifsc}</td>
                    </tr>
                  )}
                  {invoice.bankDetails?.swift && (
                    <tr>
                      <td style={{ paddingRight: '12px', paddingBottom: invoice.bankDetails?.routingNumber ? '5px' : undefined, color: TEXT_MUTED, fontSize: '11px' }}>SWIFT</td>
                      <td style={{ paddingBottom: invoice.bankDetails?.routingNumber ? '5px' : undefined, color: TEXT_PRIMARY, fontSize: '12px', fontWeight: '600' }}>{invoice.bankDetails.swift}</td>
                    </tr>
                  )}
                  {invoice.bankDetails?.routingNumber && (
                    <tr>
                      <td style={{ paddingRight: '12px', color: TEXT_MUTED, fontSize: '11px' }}>Routing No.</td>
                      <td style={{ color: TEXT_PRIMARY, fontSize: '12px', fontWeight: '600' }}>{invoice.bankDetails.routingNumber}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ backgroundColor: SURFACE, borderRadius: '6px', padding: '16px' }}>
            {(totals.taxAmount > 0 || totals.cgstAmount > 0 || totals.sgstAmount > 0 || totals.discountAmount > 0) && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: TEXT_MUTED, fontSize: '12px' }}>Taxable Value</span>
                  <span style={{ color: TEXT_SECONDARY, fontSize: '12px' }}>{formatCurrency(totals.subtotal, invoice.currency)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: TEXT_MUTED, fontSize: '12px' }}>Tax</span>
                    <span style={{ color: TEXT_SECONDARY, fontSize: '12px' }}>+{formatCurrency(totals.taxAmount, invoice.currency)}</span>
                  </div>
                )}
                {totals.cgstAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: TEXT_MUTED, fontSize: '12px' }}>CGST ({invoice.cgstRate}%)</span>
                    <span style={{ color: TEXT_SECONDARY, fontSize: '12px' }}>+{formatCurrency(totals.cgstAmount, invoice.currency)}</span>
                  </div>
                )}
                {totals.sgstAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: TEXT_MUTED, fontSize: '12px' }}>SGST ({invoice.sgstRate}%)</span>
                    <span style={{ color: TEXT_SECONDARY, fontSize: '12px' }}>+{formatCurrency(totals.sgstAmount, invoice.currency)}</span>
                  </div>
                )}
                {totals.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: TEXT_MUTED, fontSize: '12px' }}>Discount ({invoice.discountRate}%)</span>
                    <span style={{ color: '#10B981', fontSize: '12px' }}>-{formatCurrency(totals.discountAmount, invoice.currency)}</span>
                  </div>
                )}
                <div style={{ borderTop: `1px solid ${BORDER}`, marginBottom: '8px', marginTop: '4px' }} />
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: TEXT_SECONDARY, fontSize: '14px', fontWeight: '700' }}>Total ({invoice.currency})</span>
              <span style={{ color: GOLD, fontSize: '22px', fontWeight: '800' }}>
                {formatCurrency(totals.total, invoice.currency)}
              </span>
            </div>

            {hasConversion && (
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '10px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: TEXT_MUTED, fontSize: '11px' }}>Conversion Rate</span>
                  <span style={{ color: TEXT_SECONDARY, fontSize: '11px' }}>{invoice.conversionDetails?.conversionRate}</span>
                </div>
                {invoice.conversionDetails?.charges !== undefined && invoice.conversionDetails.charges > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: TEXT_MUTED, fontSize: '11px' }}>Bank Charges</span>
                    <span style={{ color: TEXT_SECONDARY, fontSize: '11px' }}>{formatNumber(invoice.conversionDetails.charges)}</span>
                  </div>
                )}
                {invoice.conversionDetails?.convertedAmount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: TEXT_MUTED, fontSize: '11px' }}>In {invoice.conversionDetails.toCurrency}</span>
                    <span style={{ color: TEXT_PRIMARY, fontSize: '11px', fontWeight: '600' }}>
                      {formatNumber(invoice.conversionDetails.convertedAmount)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {invoice.status === 'paid' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ color: TEXT_MUTED, fontSize: '12px' }}>Amount Paid</span>
                <span style={{ color: '#10B981', fontSize: '12px', fontWeight: '600' }}>
                  ({formatCurrency(totals.total, invoice.currency)})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payments */}
        {hasPayments && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
              Payments
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                  {['Date', 'Mode', 'Amount', 'Account', 'Notes'].map((h) => (
                    <th key={h} style={{ padding: '6px 0', textAlign: h === 'Amount' ? 'right' : 'left', fontSize: '10px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', paddingLeft: h === 'Account' || h === 'Notes' ? '12px' : undefined }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.payments?.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: '8px 0', fontSize: '12px', color: TEXT_SECONDARY }}>{formatDate(payment.date)}</td>
                    <td style={{ padding: '8px 0', fontSize: '12px', color: TEXT_SECONDARY }}>{payment.mode}</td>
                    <td style={{ padding: '8px 0', fontSize: '12px', fontWeight: '600', color: TEXT_PRIMARY, textAlign: 'right' }}>
                      {currencySymbol}{formatNumber(payment.amountReceived)}
                    </td>
                    <td style={{ padding: '8px 0', fontSize: '12px', color: TEXT_SECONDARY, paddingLeft: '12px' }}>{payment.paymentAccount}</td>
                    <td style={{ padding: '8px 0', fontSize: '12px', color: TEXT_MUTED, paddingLeft: '12px' }}>{payment.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes */}
        {(invoice.notes || invoice.terms) && (
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '16px', marginBottom: '20px' }}>
            {invoice.notes && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Notes</div>
                <div style={{ color: TEXT_SECONDARY, fontSize: '12px', lineHeight: '1.6' }}>{invoice.notes}</div>
              </div>
            )}
            {invoice.terms && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Terms</div>
                <div style={{ color: TEXT_SECONDARY, fontSize: '12px', lineHeight: '1.6' }}>{invoice.terms}</div>
              </div>
            )}
          </div>
        )}

        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '12px', textAlign: 'center' }}>
          <p style={{ color: TEXT_MUTED, fontSize: '11px' }}>
            This is an electronically generated document, no signature is required.
          </p>
        </div>
      </div>
    </div>
  )
}
