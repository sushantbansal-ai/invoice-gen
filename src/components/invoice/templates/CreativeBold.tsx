import { format } from 'date-fns'
import type { Invoice } from '@/types/invoice'
import type { InvoiceTotals } from '@/lib/calculations'
import { formatCurrency, formatNumber } from '@/lib/calculations'
import { STATUS_CONFIG, CURRENCY_SYMBOLS } from '@/types/invoice'

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

export function CreativeBold({ invoice, totals }: TemplateProps) {
  const status = STATUS_CONFIG[invoice.status]
  const currencySymbol = CURRENCY_SYMBOLS[invoice.currency]
  const hasBankDetails =
    invoice.bankDetails?.accountName || invoice.bankDetails?.accountNumber ||
    invoice.bankDetails?.ifsc || invoice.bankDetails?.swift ||
    invoice.bankDetails?.bank || invoice.bankDetails?.routingNumber || invoice.bankDetails?.branch
  const hasConversion = invoice.conversionDetails?.conversionRate
  const hasPayments = invoice.payments && invoice.payments.length > 0

  const GRADIENT = 'linear-gradient(135deg, #EC4899, #8B5CF6)'
  const PINK = '#EC4899'
  const VIOLET = '#8B5CF6'
  const LIGHT_BG = '#FDF4FF'
  const PINK_LIGHT = '#FDF2F8'
  const BORDER_COLOR = '#E879F9'

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '13px',
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
        minHeight: '1123px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Gradient Header Bar */}
      <div style={{ background: GRADIENT, padding: '28px 40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-1px', lineHeight: 1 }}>
              INVOICE
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>No.</div>
                <div style={{ fontWeight: '700', color: '#FFFFFF', fontSize: '13px' }}>{invoice.invoiceNo}</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Date</div>
                <div style={{ fontWeight: '600', color: '#FFFFFF', fontSize: '13px' }}>{formatDate(invoice.invoiceDate)}</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Due</div>
                <div style={{ fontWeight: '600', color: '#FFFFFF', fontSize: '13px' }}>{formatDate(invoice.dueDate)}</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {invoice.logo ? (
              <img
                src={invoice.logo}
                alt="Logo"
                style={{ maxHeight: '64px', maxWidth: '150px', objectFit: 'contain', marginBottom: '8px', display: 'block', marginLeft: 'auto', filter: 'brightness(0) invert(1)' }}
              />
            ) : null}
            <span style={{
              display: 'inline-block',
              backgroundColor: status.bg,
              color: status.text,
              padding: '3px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '800',
            }}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 40px' }}>
        {/* Billed By / Billed To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          <div style={{ backgroundColor: PINK_LIGHT, borderRadius: '8px', padding: '16px', borderLeft: `4px solid ${PINK}` }}>
            <div style={{ fontWeight: '800', color: PINK, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
              Billed By
            </div>
            <div style={{ fontWeight: '700', color: '#111827', fontSize: '14px', marginBottom: '4px' }}>{invoice.billedBy.name}</div>
            {invoice.billedBy.address && <div style={{ color: '#4B5563', lineHeight: '1.6', fontSize: '12px' }}>{invoice.billedBy.address}</div>}
            {invoice.billedBy.city && (
              <div style={{ color: '#4B5563', fontSize: '12px' }}>
                {[invoice.billedBy.city, invoice.billedBy.state].filter(Boolean).join(', ')}
              </div>
            )}
            {invoice.billedBy.country && (
              <div style={{ color: '#4B5563', fontSize: '12px' }}>
                {[invoice.billedBy.country, invoice.billedBy.zipCode].filter(Boolean).join(' ')}
              </div>
            )}
            {invoice.billedBy.gstin && (
              <div style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>GSTIN: {invoice.billedBy.gstin}</div>
            )}
            {invoice.billedBy.email && <div style={{ color: PINK, fontSize: '11px', marginTop: '4px' }}>{invoice.billedBy.email}</div>}
            {invoice.billedBy.attendee && (
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                <span style={{ fontWeight: '700', color: '#374151' }}>Attendee: </span>
                <span style={{ color: '#4B5563' }}>{invoice.billedBy.attendee}</span>
              </div>
            )}
          </div>

          <div style={{ backgroundColor: LIGHT_BG, borderRadius: '8px', padding: '16px', borderLeft: `4px solid ${VIOLET}` }}>
            <div style={{ fontWeight: '800', color: VIOLET, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
              Billed To
            </div>
            <div style={{ fontWeight: '700', color: '#111827', fontSize: '14px', marginBottom: '4px' }}>{invoice.billedTo.name}</div>
            {invoice.billedTo.address && <div style={{ color: '#4B5563', lineHeight: '1.6', fontSize: '12px' }}>{invoice.billedTo.address}</div>}
            {invoice.billedTo.city && (
              <div style={{ color: '#4B5563', fontSize: '12px' }}>
                {[invoice.billedTo.city, invoice.billedTo.state].filter(Boolean).join(', ')}
              </div>
            )}
            {invoice.billedTo.country && (
              <div style={{ color: '#4B5563', fontSize: '12px' }}>
                {[invoice.billedTo.country, invoice.billedTo.zipCode].filter(Boolean).join(' ')}
              </div>
            )}
            {invoice.billedTo.email && <div style={{ color: VIOLET, fontSize: '11px', marginTop: '4px' }}>{invoice.billedTo.email}</div>}
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ background: GRADIENT }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#FFFFFF' }}>#</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#FFFFFF' }}>Item</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: '#FFFFFF' }}>Qty</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: '#FFFFFF' }}>Rate</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: '#FFFFFF' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr
                key={item.id}
                style={{
                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FDF4FF',
                  borderBottom: `1px solid ${BORDER_COLOR}30`,
                }}
              >
                <td style={{ padding: '11px 12px', color: '#9CA3AF', fontSize: '12px' }}>{index + 1}.</td>
                <td style={{ padding: '11px 12px', color: '#111827' }}>{item.description}</td>
                <td style={{ padding: '11px 12px', textAlign: 'right', color: '#4B5563' }}>{item.quantity}</td>
                <td style={{ padding: '11px 12px', textAlign: 'right', color: '#4B5563' }}>
                  {currencySymbol}{formatNumber(item.rate)}
                </td>
                <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: '700', color: '#111827' }}>
                  {currencySymbol}{formatNumber(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bank Details + Totals */}
        <div style={{ display: 'grid', gridTemplateColumns: hasBankDetails ? '1fr 1fr' : '1fr', gap: '16px', marginBottom: '24px' }}>
          {hasBankDetails && (
            <div style={{ backgroundColor: PINK_LIGHT, borderRadius: '8px', padding: '16px', borderTop: `3px solid ${PINK}` }}>
              <div style={{ fontWeight: '800', color: PINK, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
                Bank Details
              </div>
              <table style={{ borderCollapse: 'collapse' }}>
                <tbody>
                  {invoice.bankDetails?.accountName && (
                    <tr>
                      <td style={{ paddingRight: '12px', paddingBottom: '4px', color: '#9CA3AF', fontSize: '11px' }}>Account Name</td>
                      <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#111827', fontSize: '12px' }}>{invoice.bankDetails.accountName}</td>
                    </tr>
                  )}
                  {invoice.bankDetails?.accountNumber && (
                    <tr>
                      <td style={{ paddingRight: '12px', paddingBottom: '4px', color: '#9CA3AF', fontSize: '11px' }}>Account No.</td>
                      <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#111827', fontSize: '12px' }}>{invoice.bankDetails.accountNumber}</td>
                    </tr>
                  )}
                  {invoice.bankDetails?.bank && (
                    <tr>
                      <td style={{ paddingRight: '12px', paddingBottom: '4px', color: '#9CA3AF', fontSize: '11px' }}>Bank</td>
                      <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#111827', fontSize: '12px' }}>{invoice.bankDetails.bank}</td>
                    </tr>
                  )}
                  {invoice.bankDetails?.swift && (
                    <tr>
                      <td style={{ paddingRight: '12px', color: '#9CA3AF', fontSize: '11px' }}>SWIFT</td>
                      <td style={{ fontWeight: '600', color: '#111827', fontSize: '12px' }}>{invoice.bankDetails.swift}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ backgroundColor: LIGHT_BG, borderRadius: '8px', padding: '16px', borderTop: `3px solid ${VIOLET}` }}>
            {(totals.taxAmount > 0 || totals.discountAmount > 0) && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '12px' }}>Subtotal</span>
                  <span style={{ color: '#374151', fontSize: '12px' }}>{formatCurrency(totals.subtotal, invoice.currency)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{invoice.taxName || 'Tax'} ({invoice.taxRate}%)</span>
                    <span style={{ color: '#374151', fontSize: '12px' }}>+{formatCurrency(totals.taxAmount, invoice.currency)}</span>
                  </div>
                )}
                {totals.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#9CA3AF', fontSize: '12px' }}>Discount ({invoice.discountRate}%)</span>
                    <span style={{ color: '#10B981', fontSize: '12px' }}>-{formatCurrency(totals.discountAmount, invoice.currency)}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid #E879F920', marginBottom: '8px', marginTop: '4px' }} />
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '800', color: '#111827', fontSize: '15px' }}>Total</span>
              <span style={{ fontWeight: '900', fontSize: '24px', background: GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {formatCurrency(totals.total, invoice.currency)}
              </span>
            </div>

            {hasConversion && (
              <div style={{ borderTop: '1px solid #E879F920', paddingTop: '10px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '11px' }}>Conversion Rate</span>
                  <span style={{ color: '#4B5563', fontSize: '11px' }}>{invoice.conversionDetails?.conversionRate}</span>
                </div>
                {invoice.conversionDetails?.convertedAmount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9CA3AF', fontSize: '11px' }}>In {invoice.conversionDetails.toCurrency}</span>
                    <span style={{ color: '#111827', fontSize: '11px', fontWeight: '600' }}>
                      {formatNumber(invoice.conversionDetails.convertedAmount)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payments */}
        {hasPayments && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: '800', color: PINK, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', borderLeft: `3px solid ${PINK}`, paddingLeft: '8px' }}>
              Payments
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${BORDER_COLOR}40` }}>
                  {['Date', 'Mode', 'Amount', 'Account', 'Notes'].map((h) => (
                    <th key={h} style={{ padding: '6px 0', textAlign: h === 'Amount' ? 'right' : 'left', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', paddingLeft: h === 'Account' || h === 'Notes' ? '12px' : undefined }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.payments?.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: `1px solid ${BORDER_COLOR}20` }}>
                    <td style={{ padding: '8px 0', fontSize: '12px', color: '#374151' }}>{formatDate(payment.date)}</td>
                    <td style={{ padding: '8px 0', fontSize: '12px', color: '#374151' }}>{payment.mode}</td>
                    <td style={{ padding: '8px 0', fontSize: '12px', fontWeight: '700', color: '#111827', textAlign: 'right' }}>
                      {currencySymbol}{formatNumber(payment.amountReceived)}
                    </td>
                    <td style={{ padding: '8px 0', fontSize: '12px', color: '#374151', paddingLeft: '12px' }}>{payment.paymentAccount}</td>
                    <td style={{ padding: '8px 0', fontSize: '12px', color: '#6B7280', paddingLeft: '12px' }}>{payment.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes */}
        {(invoice.notes || invoice.terms) && (
          <div style={{ marginBottom: '20px' }}>
            {invoice.notes && (
              <div style={{ marginBottom: '10px', borderLeft: `3px solid ${PINK}`, paddingLeft: '10px' }}>
                <div style={{ fontWeight: '800', color: PINK, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Notes</div>
                <div style={{ color: '#4B5563', fontSize: '12px', lineHeight: '1.6' }}>{invoice.notes}</div>
              </div>
            )}
            {invoice.terms && (
              <div style={{ borderLeft: `3px solid ${VIOLET}`, paddingLeft: '10px' }}>
                <div style={{ fontWeight: '800', color: VIOLET, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Terms</div>
                <div style={{ color: '#4B5563', fontSize: '12px', lineHeight: '1.6' }}>{invoice.terms}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: GRADIENT, padding: '12px 40px', marginTop: 'auto', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0 }}>
          This is an electronically generated document, no signature is required.
        </p>
      </div>
    </div>
  )
}
