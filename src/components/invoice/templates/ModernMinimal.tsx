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

export function ModernMinimal({ invoice, totals }: TemplateProps) {
  const status = STATUS_CONFIG[invoice.status]
  const currencySymbol = CURRENCY_SYMBOLS[invoice.currency]
  const hasHsn = invoice.items.some(item => item.hsn)
  const hasItemTax = invoice.items.some(item => item.taxRate)
  const hasBankDetails =
    invoice.bankDetails?.accountName || invoice.bankDetails?.accountNumber ||
    invoice.bankDetails?.ifsc || invoice.bankDetails?.swift ||
    invoice.bankDetails?.bank || invoice.bankDetails?.routingNumber || invoice.bankDetails?.branch
  const hasConversion =
    invoice.conversionDetails?.conversionRate !== undefined ||
    invoice.conversionDetails?.convertedAmount !== undefined ||
    invoice.conversionDetails?.charges !== undefined ||
    Boolean(invoice.conversionDetails?.toCurrency)
  const hasPayments = invoice.payments && invoice.payments.length > 0

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '13px',
        color: '#1E293B',
        padding: '48px',
        minHeight: '1123px',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          {invoice.logo ? (
            <img src={invoice.logo} alt="Logo" style={{ maxHeight: '60px', maxWidth: '160px', objectFit: 'contain', marginBottom: '16px', display: 'block' }} />
          ) : (
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#1E40AF', marginBottom: '16px', letterSpacing: '-0.5px' }}>
              {invoice.billedBy.name || 'Your Company'}
            </div>
          )}
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                Invoice No
              </div>
              <div style={{ fontWeight: '700', color: '#0F172A' }}>{invoice.invoiceNo}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                Date
              </div>
              <div style={{ fontWeight: '600', color: '#0F172A' }}>{formatDate(invoice.invoiceDate)}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                Due Date
              </div>
              <div style={{ fontWeight: '600', color: '#0F172A' }}>{formatDate(invoice.dueDate)}</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#2563EB', letterSpacing: '-1px', marginBottom: '8px' }}>
            INVOICE
          </div>
          <span style={{
            display: 'inline-block',
            backgroundColor: status.bg,
            color: status.text,
            height: '24px',
            padding: '0 8px',
            lineHeight: '24px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textAlign: 'center',
            verticalAlign: 'middle',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '2px solid #2563EB', marginBottom: '28px' }} />

      {/* Billed By / Billed To */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
            From
          </div>
          <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px', marginBottom: '4px' }}>{invoice.billedBy.name}</div>
          {invoice.billedBy.address && <div style={{ color: '#475569', lineHeight: '1.6' }}>{invoice.billedBy.address}</div>}
          {invoice.billedBy.city && (
            <div style={{ color: '#475569' }}>
              {[invoice.billedBy.city, invoice.billedBy.state].filter(Boolean).join(', ')}
            </div>
          )}
          {invoice.billedBy.country && (
            <div style={{ color: '#475569' }}>
              {[invoice.billedBy.country, invoice.billedBy.zipCode].filter(Boolean).join(' ') }
            </div>
          )}
          {invoice.billedBy.gstin && (
            <div style={{ color: '#475569', marginTop: '4px', fontSize: '12px' }}>
              GSTIN: {invoice.billedBy.gstin}
            </div>
          )}
          {invoice.billedBy.email && <div style={{ color: '#2563EB', marginTop: '4px', fontSize: '12px' }}>{invoice.billedBy.email}</div>}
          {invoice.billedBy.phone && <div style={{ color: '#475569', fontSize: '12px' }}>{invoice.billedBy.phone}</div>}
          {invoice.billedBy.attendee && (
            <div style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>
              Attendee: {invoice.billedBy.attendee}
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
            Bill To
          </div>
          <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px', marginBottom: '4px' }}>{invoice.billedTo.name}</div>
          {invoice.billedTo.address && <div style={{ color: '#475569', lineHeight: '1.6' }}>{invoice.billedTo.address}</div>}
          {invoice.billedTo.city && (
            <div style={{ color: '#475569' }}>
              {[invoice.billedTo.city, invoice.billedTo.state].filter(Boolean).join(', ')}
            </div>
          )}
          {invoice.billedTo.country && (
            <div style={{ color: '#475569' }}>
              {[invoice.billedTo.country, invoice.billedTo.zipCode].filter(Boolean).join(' ')}
            </div>
          )}
          {invoice.billedTo.gstin && (
            <div style={{ color: '#475569', marginTop: '4px', fontSize: '12px' }}>GSTIN: {invoice.billedTo.gstin}</div>
          )}
          {invoice.billedTo.email && <div style={{ color: '#2563EB', marginTop: '4px', fontSize: '12px' }}>{invoice.billedTo.email}</div>}
          {invoice.billedTo.phone && <div style={{ color: '#475569', fontSize: '12px' }}>{invoice.billedTo.phone}</div>}
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '28px' }}>
        <thead>
          <tr style={{ backgroundColor: '#EFF6FF', borderBottom: '2px solid #2563EB' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '1px' }}>#</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</th>
            {hasHsn && <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '1px' }}>HSN/SAC</th>}
            <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Qty</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Rate</th>
            {hasItemTax && <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Tax %</th>}
            {hasItemTax && <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Tax Amt</th>}
            <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => {
            const itemTax = item.taxRate ? Math.round(item.amount * (item.taxRate / 100) * 100) / 100 : 0
            return (
              <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '12px', color: '#94A3B8', fontSize: '12px' }}>{index + 1}</td>
                <td style={{ padding: '12px', color: '#0F172A' }}>{item.description}</td>
                {hasHsn && <td style={{ padding: '12px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>{item.hsn || '—'}</td>}
                <td style={{ padding: '12px', textAlign: 'right', color: '#475569' }}>{item.quantity}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#475569' }}>
                  {currencySymbol}{formatNumber(item.rate)}
                </td>
                {hasItemTax && <td style={{ padding: '12px', textAlign: 'right', color: '#475569' }}>{item.taxRate ? `${item.taxRate}%` : '—'}</td>}
                {hasItemTax && <td style={{ padding: '12px', textAlign: 'right', color: '#475569' }}>{currencySymbol}{formatNumber(itemTax)}</td>}
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#0F172A' }}>
                  {currencySymbol}{formatNumber(item.amount)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Totals + Bank Details */}
      <div style={{ display: 'grid', gridTemplateColumns: hasBankDetails ? '1fr 1fr' : '1fr', gap: '24px', marginBottom: '28px' }}>
        {hasBankDetails && (
          <div style={{ borderLeft: '3px solid #2563EB', paddingLeft: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
              Bank Details
            </div>
            <table style={{ borderCollapse: 'collapse' }}>
              <tbody>
                {invoice.bankDetails?.accountName && (
                  <tr>
                    <td style={{ paddingRight: '12px', paddingBottom: '4px', color: '#64748B', fontSize: '11px' }}>Account Name</td>
                    <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#0F172A', fontSize: '12px' }}>{invoice.bankDetails.accountName}</td>
                  </tr>
                )}
                {invoice.bankDetails?.accountNumber && (
                  <tr>
                    <td style={{ paddingRight: '12px', paddingBottom: '4px', color: '#64748B', fontSize: '11px' }}>Account No.</td>
                    <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#0F172A', fontSize: '12px' }}>{invoice.bankDetails.accountNumber}</td>
                  </tr>
                )}
                {invoice.bankDetails?.bank && (
                  <tr>
                    <td style={{ paddingRight: '12px', paddingBottom: '4px', color: '#64748B', fontSize: '11px' }}>Bank</td>
                    <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#0F172A', fontSize: '12px' }}>{invoice.bankDetails.bank}</td>
                  </tr>
                )}
                {invoice.bankDetails?.branch && (
                  <tr>
                    <td style={{ paddingRight: '12px', paddingBottom: '4px', color: '#64748B', fontSize: '11px' }}>Branch</td>
                    <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#0F172A', fontSize: '12px' }}>{invoice.bankDetails.branch}</td>
                  </tr>
                )}
                {invoice.bankDetails?.ifsc && (
                  <tr>
                    <td style={{ paddingRight: '12px', paddingBottom: '4px', color: '#64748B', fontSize: '11px' }}>IFSC</td>
                    <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#0F172A', fontSize: '12px' }}>{invoice.bankDetails.ifsc}</td>
                  </tr>
                )}
                {invoice.bankDetails?.swift && (
                  <tr>
                    <td style={{ paddingRight: '12px', paddingBottom: invoice.bankDetails?.routingNumber ? '4px' : undefined, color: '#64748B', fontSize: '11px' }}>SWIFT</td>
                    <td style={{ paddingBottom: invoice.bankDetails?.routingNumber ? '4px' : undefined, fontWeight: '600', color: '#0F172A', fontSize: '12px' }}>{invoice.bankDetails.swift}</td>
                  </tr>
                )}
                {invoice.bankDetails?.routingNumber && (
                  <tr>
                    <td style={{ paddingRight: '12px', color: '#64748B', fontSize: '11px' }}>Routing No.</td>
                    <td style={{ fontWeight: '600', color: '#0F172A', fontSize: '12px' }}>{invoice.bankDetails.routingNumber}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div>
          {(totals.taxAmount > 0 || totals.cgstAmount > 0 || totals.sgstAmount > 0 || totals.discountAmount > 0) && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748B', fontSize: '12px' }}>Taxable Value</span>
                <span style={{ color: '#334155', fontSize: '12px' }}>{formatCurrency(totals.subtotal, invoice.currency)}</span>
              </div>
              {totals.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748B', fontSize: '12px' }}>Tax</span>
                  <span style={{ color: '#334155', fontSize: '12px' }}>+{formatCurrency(totals.taxAmount, invoice.currency)}</span>
                </div>
              )}
              {totals.cgstAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748B', fontSize: '12px' }}>CGST ({invoice.cgstRate}%)</span>
                  <span style={{ color: '#334155', fontSize: '12px' }}>+{formatCurrency(totals.cgstAmount, invoice.currency)}</span>
                </div>
              )}
              {totals.sgstAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748B', fontSize: '12px' }}>SGST ({invoice.sgstRate}%)</span>
                  <span style={{ color: '#334155', fontSize: '12px' }}>+{formatCurrency(totals.sgstAmount, invoice.currency)}</span>
                </div>
              )}
              {totals.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748B', fontSize: '12px' }}>Discount ({invoice.discountRate}%)</span>
                  <span style={{ color: '#059669', fontSize: '12px' }}>-{formatCurrency(totals.discountAmount, invoice.currency)}</span>
                </div>
              )}
            </>
          )}
          <div style={{ borderTop: '2px solid #2563EB', paddingTop: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '16px' }}>Total</span>
            <span style={{ fontWeight: '800', color: '#2563EB', fontSize: '22px' }}>
              {formatCurrency(totals.total, invoice.currency)}
            </span>
          </div>

          {hasConversion && (
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
              {invoice.conversionDetails?.conversionRate !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ color: '#94A3B8', fontSize: '11px' }}>Conversion Rate</span>
                  <span style={{ color: '#475569', fontSize: '11px' }}>{invoice.conversionDetails.conversionRate}</span>
                </div>
              )}
              {invoice.conversionDetails?.charges !== undefined && invoice.conversionDetails.charges > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ color: '#94A3B8', fontSize: '11px' }}>Bank Charges</span>
                  <span style={{ color: '#475569', fontSize: '11px' }}>{formatNumber(invoice.conversionDetails.charges)}</span>
                </div>
              )}
              {invoice.conversionDetails?.convertedAmount !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8', fontSize: '11px' }}>
                    {invoice.conversionDetails?.toCurrency ? `In ${invoice.conversionDetails.toCurrency}` : 'Converted Amount'}
                  </span>
                  <span style={{ color: '#0F172A', fontSize: '11px', fontWeight: '600' }}>
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
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
            Payment History
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '6px 0', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '6px 0', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase' }}>Mode</th>
                <th style={{ padding: '6px 0', textAlign: 'right', fontSize: '10px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '6px 0', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', paddingLeft: '12px' }}>Account</th>
                <th style={{ padding: '6px 0', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', paddingLeft: '12px' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {invoice.payments?.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '8px 0', fontSize: '12px', color: '#334155' }}>{formatDate(payment.date)}</td>
                  <td style={{ padding: '8px 0', fontSize: '12px', color: '#334155' }}>{payment.mode}</td>
                  <td style={{ padding: '8px 0', fontSize: '12px', fontWeight: '600', color: '#0F172A', textAlign: 'right' }}>
                    {currencySymbol}{formatNumber(payment.amountReceived)}
                  </td>
                  <td style={{ padding: '8px 0', fontSize: '12px', color: '#334155', paddingLeft: '12px' }}>{payment.paymentAccount}</td>
                  <td style={{ padding: '8px 0', fontSize: '12px', color: '#64748B', paddingLeft: '12px' }}>{payment.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes */}
      {(invoice.notes || invoice.terms) && (
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', marginBottom: '24px' }}>
          {invoice.notes && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Notes</div>
              <div style={{ color: '#475569', fontSize: '12px', lineHeight: '1.6' }}>{invoice.notes}</div>
            </div>
          )}
          {invoice.terms && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Terms</div>
              <div style={{ color: '#475569', fontSize: '12px', lineHeight: '1.6' }}>{invoice.terms}</div>
            </div>
          )}
        </div>
      )}

      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', textAlign: 'center' }}>
        <p style={{ color: '#CBD5E1', fontSize: '11px' }}>
          This is an electronically generated document, no signature is required.
        </p>
      </div>
    </div>
  )
}
