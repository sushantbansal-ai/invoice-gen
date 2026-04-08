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

export function ClassicPurple({ invoice, totals, isPdfExport = false }: TemplateProps) {
  const status = STATUS_CONFIG[invoice.status]
  const currencySymbol = CURRENCY_SYMBOLS[invoice.currency]
  const hasHsn = invoice.items.some(item => item.hsn)
  const hasItemTax = invoice.items.some(item => item.taxRate)
  const hasBankDetails =
    invoice.bankDetails?.accountName || invoice.bankDetails?.accountNumber ||
    invoice.bankDetails?.ifsc || invoice.bankDetails?.swift ||
    invoice.bankDetails?.bank || invoice.bankDetails?.routingNumber || invoice.bankDetails?.branch
  const hasConversion = invoice.conversionDetails?.conversionRate
  const hasPayments = invoice.payments && invoice.payments.length > 0

  return (
    <div
      className="bg-white font-sans"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '13px',
        color: '#374151',
        padding: '40px',
        minHeight: '1123px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '36px', fontWeight: '700', color: '#7C3AED', lineHeight: 1 }}>
              Invoice
            </span>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: status.bg,
                color: status.text,
                height: '24px',
                padding: '0 8px',
                lineHeight: '24px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                textAlign: 'center',
                verticalAlign: 'middle',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box'
              }}
            >
              {status.label}
            </span>
          </div>
          <table style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ paddingRight: '16px', paddingBottom: '4px', color: '#6B7280', fontSize: '12px' }}>Invoice No #</td>
                <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#111827' }}>{invoice.invoiceNo}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: '16px', paddingBottom: '4px', color: '#6B7280', fontSize: '12px' }}>Invoice Date</td>
                <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#111827' }}>{formatDate(invoice.invoiceDate)}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: '16px', color: '#6B7280', fontSize: '12px' }}>Due Date</td>
                <td style={{ fontWeight: '600', color: '#111827' }}>{formatDate(invoice.dueDate)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'right' }}>
          {invoice.logo ? (
            <img
              src={invoice.logo}
              alt="Company Logo"
              style={{ maxHeight: '80px', maxWidth: '180px', objectFit: 'contain' }}
            />
          ) : (
            <div style={{
              width: '120px', height: '60px', borderRadius: '8px',
              backgroundColor: '#efebf9', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#9CA3AF', fontSize: '11px'
            }}>
              Your Logo
            </div>
          )}
        </div>
      </div>

      {/* Billed By / Billed To */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#efebf9', borderRadius: '8px', padding: '16px' }}>
          <div style={{ color: '#7C3AED', fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>Billed By</div>
          <div style={{ fontWeight: '700', color: '#111827', marginBottom: '2px' }}>{invoice.billedBy.name}</div>
          {invoice.billedBy.address && <div style={{ color: '#374151' }}>{invoice.billedBy.address}</div>}
          {invoice.billedBy.city && (
            <div style={{ color: '#374151' }}>
              {[invoice.billedBy.city, invoice.billedBy.state].filter(Boolean).join(', ')}
            </div>
          )}
          {invoice.billedBy.country && (
            <div style={{ color: '#374151' }}>
              {[invoice.billedBy.country, invoice.billedBy.zipCode].filter(Boolean).join(' - ')}
            </div>
          )}
          {invoice.billedBy.gstin && (
            <div style={{ marginTop: '4px' }}>
              <span style={{ fontWeight: '700', color: '#111827' }}>GSTIN: </span>
              <span style={{ color: '#374151' }}>{invoice.billedBy.gstin}</span>
            </div>
          )}
          {invoice.billedBy.email && (
            <div style={{ color: '#374151', marginTop: '2px' }}>{invoice.billedBy.email}</div>
          )}
          {invoice.billedBy.phone && (
            <div style={{ color: '#374151' }}>{invoice.billedBy.phone}</div>
          )}
          {invoice.billedBy.attendee && (
            <div style={{ marginTop: '4px' }}>
              <span style={{ fontWeight: '700', color: '#111827' }}>Attendee: </span>
              <span style={{ color: '#374151' }}>{invoice.billedBy.attendee}</span>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#efebf9', borderRadius: '8px', padding: '16px' }}>
          <div style={{ color: '#7C3AED', fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>Billed To</div>
          <div style={{ fontWeight: '700', color: '#111827', marginBottom: '2px' }}>{invoice.billedTo.name}</div>
          {invoice.billedTo.address && <div style={{ color: '#374151' }}>{invoice.billedTo.address}</div>}
          {invoice.billedTo.city && (
            <div style={{ color: '#374151' }}>
              {[invoice.billedTo.city, invoice.billedTo.state].filter(Boolean).join(', ')}
            </div>
          )}
          {invoice.billedTo.country && (
            <div style={{ color: '#374151' }}>
              {[invoice.billedTo.country, invoice.billedTo.zipCode].filter(Boolean).join(' - ')}
            </div>
          )}
          {invoice.billedTo.gstin && (
            <div style={{ marginTop: '4px' }}>
              <span style={{ fontWeight: '700', color: '#111827' }}>GSTIN: </span>
              <span style={{ color: '#374151' }}>{invoice.billedTo.gstin}</span>
            </div>
          )}
          {invoice.billedTo.email && (
            <div style={{ color: '#374151', marginTop: '4px' }}>{invoice.billedTo.email}</div>
          )}
          {invoice.billedTo.phone && (
            <div style={{ color: '#374151' }}>{invoice.billedTo.phone}</div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <thead>
          <tr style={{ backgroundColor: '#6539c0', color: '#FFFFFF' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', fontSize: '12px', borderRadius: '0' }}>#</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', fontSize: '12px' }}>Item</th>
            {hasHsn && <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', fontSize: '12px' }}>HSN/SAC</th>}
            <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '12px' }}>Quantity</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '12px' }}>Rate</th>
            {hasItemTax && <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '12px' }}>Tax %</th>}
            {hasItemTax && <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '12px' }}>Tax Amt</th>}
            <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '12px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => {
            const itemTax = item.taxRate ? Math.round(item.amount * (item.taxRate / 100) * 100) / 100 : 0
            return (
              <tr
                key={item.id}
                style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}
              >
                <td style={{ padding: '10px 12px', color: '#6B7280' }}>{index + 1}.</td>
                <td style={{ padding: '10px 12px', color: '#111827' }}>{item.description}</td>
                {hasHsn && <td style={{ padding: '10px 12px', textAlign: 'center', color: '#6B7280', fontSize: '12px' }}>{item.hsn || '—'}</td>}
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#374151' }}>{item.quantity}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#374151' }}>
                  {currencySymbol}{formatNumber(item.rate)}
                </td>
                {hasItemTax && <td style={{ padding: '10px 12px', textAlign: 'right', color: '#374151' }}>{item.taxRate ? `${item.taxRate}%` : '—'}</td>}
                {hasItemTax && <td style={{ padding: '10px 12px', textAlign: 'right', color: '#374151' }}>{currencySymbol}{formatNumber(itemTax)}</td>}
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: '#111827' }}>
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
          <div style={{ backgroundColor: '#efebf9', borderRadius: '8px', padding: '16px' }}>
            <div style={{ color: '#7C3AED', fontWeight: '700', fontSize: '13px', marginBottom: '10px' }}>Bank Details</div>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                {invoice.bankDetails?.accountName && (
                  <tr>
                    <td style={{ paddingBottom: '4px', paddingRight: '12px', color: '#6B7280', fontSize: '12px', whiteSpace: 'nowrap' }}>Account Name</td>
                    <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#111827' }}>{invoice.bankDetails.accountName}</td>
                  </tr>
                )}
                {invoice.bankDetails?.accountNumber && (
                  <tr>
                    <td style={{ paddingBottom: '4px', paddingRight: '12px', color: '#6B7280', fontSize: '12px', whiteSpace: 'nowrap' }}>Account Number</td>
                    <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#111827' }}>{invoice.bankDetails.accountNumber}</td>
                  </tr>
                )}
                {invoice.bankDetails?.ifsc && (
                  <tr>
                    <td style={{ paddingBottom: '4px', paddingRight: '12px', color: '#6B7280', fontSize: '12px' }}>IFSC</td>
                    <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#111827' }}>{invoice.bankDetails.ifsc}</td>
                  </tr>
                )}
                {invoice.bankDetails?.swift && (
                  <tr>
                    <td style={{ paddingBottom: '4px', paddingRight: '12px', color: '#6B7280', fontSize: '12px' }}>SWIFT Code</td>
                    <td style={{ paddingBottom: '4px', fontWeight: '600', color: '#111827' }}>{invoice.bankDetails.swift}</td>
                  </tr>
                )}
                {invoice.bankDetails?.bank && (
                  <tr>
                    <td style={{ paddingBottom: invoice.bankDetails?.branch || invoice.bankDetails?.routingNumber ? '4px' : undefined, paddingRight: '12px', color: '#6B7280', fontSize: '12px' }}>Bank</td>
                    <td style={{ paddingBottom: invoice.bankDetails?.branch || invoice.bankDetails?.routingNumber ? '4px' : undefined, fontWeight: '600', color: '#111827' }}>{invoice.bankDetails.bank}</td>
                  </tr>
                )}
                {invoice.bankDetails?.branch && (
                  <tr>
                    <td style={{ paddingBottom: invoice.bankDetails?.routingNumber ? '4px' : undefined, paddingRight: '12px', color: '#6B7280', fontSize: '12px' }}>Branch</td>
                    <td style={{ paddingBottom: invoice.bankDetails?.routingNumber ? '4px' : undefined, fontWeight: '600', color: '#111827' }}>{invoice.bankDetails.branch}</td>
                  </tr>
                )}
                {invoice.bankDetails?.routingNumber && (
                  <tr>
                    <td style={{ paddingRight: '12px', color: '#6B7280', fontSize: '12px' }}>Routing No.</td>
                    <td style={{ fontWeight: '600', color: '#111827' }}>{invoice.bankDetails.routingNumber}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div style={{ padding: '16px' }}>
          {/* Subtotal / Tax / Discount */}
          {(totals.taxAmount > 0 || totals.cgstAmount > 0 || totals.sgstAmount > 0 || totals.discountAmount > 0) && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#6B7280' }}>Taxable Value</span>
                <span style={{ color: '#374151' }}>{formatCurrency(totals.subtotal, invoice.currency)}</span>
              </div>
              {totals.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#6B7280' }}>Tax</span>
                  <span style={{ color: '#374151' }}>+{formatCurrency(totals.taxAmount, invoice.currency)}</span>
                </div>
              )}
              {totals.cgstAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#6B7280' }}>CGST ({invoice.cgstRate}%)</span>
                  <span style={{ color: '#374151' }}>+{formatCurrency(totals.cgstAmount, invoice.currency)}</span>
                </div>
              )}
              {totals.sgstAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#6B7280' }}>SGST ({invoice.sgstRate}%)</span>
                  <span style={{ color: '#374151' }}>+{formatCurrency(totals.sgstAmount, invoice.currency)}</span>
                </div>
              )}
              {totals.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#6B7280' }}>Discount ({invoice.discountRate}%)</span>
                  <span style={{ color: '#10B981' }}>-{formatCurrency(totals.discountAmount, invoice.currency)}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid #E5E7EB', marginTop: '8px', paddingTop: '8px' }} />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
              Total ({invoice.currency})
            </span>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#111827' }}>
              {formatCurrency(totals.total, invoice.currency)}
            </span>
          </div>

          {hasConversion && (
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Conversion Rate</span>
                <span style={{ color: '#374151', fontSize: '12px' }}>{invoice.conversionDetails?.conversionRate}</span>
              </div>
              {invoice.conversionDetails?.charges !== undefined && invoice.conversionDetails.charges > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#6B7280', fontSize: '12px' }}>Bank Charges</span>
                  <span style={{ color: '#374151', fontSize: '12px' }}>{invoice.conversionDetails.charges}</span>
                </div>
              )}
              {invoice.conversionDetails?.convertedAmount && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#6B7280', fontSize: '12px' }}>In {invoice.conversionDetails.toCurrency}</span>
                  <span style={{ color: '#374151', fontSize: '12px', fontWeight: '600' }}>
                    {formatNumber(invoice.conversionDetails.convertedAmount)}
                  </span>
                </div>
              )}
            </div>
          )}

          {invoice.status === 'paid' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ color: '#6B7280', fontSize: '12px' }}>Amount Paid</span>
              <span style={{ color: '#065F46', fontSize: '12px', fontWeight: '600' }}>
                ({formatCurrency(totals.total, invoice.currency)})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payments Section */}
      {hasPayments && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ color: '#7C3AED', fontWeight: '700', fontSize: '14px', marginBottom: '10px' }}>Payments</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Date</th>
                <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Mode</th>
                <th style={{ padding: '8px 0', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Amount Received</th>
                <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', paddingLeft: '16px' }}>Payment Account</th>
                <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', paddingLeft: '16px' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {invoice.payments?.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '8px 0', fontSize: '12px', color: '#374151' }}>{formatDate(payment.date)}</td>
                  <td style={{ padding: '8px 0', fontSize: '12px', color: '#374151' }}>{payment.mode}</td>
                  <td style={{ padding: '8px 0', fontSize: '12px', color: '#374151', textAlign: 'right' }}>
                    {currencySymbol}{formatNumber(payment.amountReceived)}
                  </td>
                  <td style={{ padding: '8px 0', fontSize: '12px', color: '#374151', paddingLeft: '16px' }}>{payment.paymentAccount}</td>
                  <td style={{ padding: '8px 0', fontSize: '12px', color: '#374151', paddingLeft: '16px' }}>{payment.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes & Terms */}
      {(invoice.notes || invoice.terms) && (
        <div style={{ marginBottom: '24px' }}>
          {invoice.notes && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ color: '#7C3AED', fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>Notes</div>
              <div style={{ color: '#374151', fontSize: '12px', lineHeight: '1.6' }}>{invoice.notes}</div>
            </div>
          )}
          {invoice.terms && (
            <div>
              <div style={{ color: '#7C3AED', fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>Terms & Conditions</div>
              <div style={{ color: '#374151', fontSize: '12px', lineHeight: '1.6' }}>{invoice.terms}</div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', textAlign: 'center' }}>
        <p style={{ color: '#9CA3AF', fontSize: '11px', fontStyle: 'italic' }}>
          This is an electronically generated document, no signature is required.
        </p>
      </div>
    </div>
  )
}
