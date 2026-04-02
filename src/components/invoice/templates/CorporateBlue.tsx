import { format } from 'date-fns'
import type { Invoice } from '@/types/invoice'
import type { InvoiceTotals } from '@/lib/calculations'
import { formatNumber } from '@/lib/calculations'
import { STATUS_CONFIG, CURRENCY_SYMBOLS } from '@/types/invoice'

interface TemplateProps {
  invoice: Invoice
  totals: InvoiceTotals
  isPdfExport?: boolean
}

const BLUE = '#1877C8'
const DARK_BLUE = '#0D5FA0'
const LIGHT_BLUE_BG = '#EBF4FF'
const WHITE = '#FFFFFF'
const TEXT_DARK = '#1A1A2E'
const TEXT_GRAY = '#4A5568'

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM dd, yyyy')
  } catch {
    return dateStr
  }
}

function numberToWords(num: number, currency: string): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function convert(n: number): string {
    if (n === 0) return ''
    if (n < 20) return ones[n] + ' '
    if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10] + ' '
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + convert(n % 100)
    if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + convert(n % 1000)
    if (n < 10000000) return convert(Math.floor(n / 100000)) + 'Lakh ' + convert(n % 100000)
    return convert(Math.floor(n / 10000000)) + 'Crore ' + convert(n % 10000000)
  }

  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)
  const currencyNames: Record<string, string> = {
    INR: 'Rupees', USD: 'Dollars', EUR: 'Euros', GBP: 'Pounds',
    CAD: 'Dollars', AUD: 'Dollars', SGD: 'Dollars', AED: 'Dirhams', CHF: 'Francs', JPY: 'Yen',
  }
  const unitName = currencyNames[currency] || currency
  const result = convert(intPart).trim() || 'Zero'
  return decPart > 0
    ? `${result} ${unitName} and ${convert(decPart).trim()} Cents Only`
    : `${result} ${unitName} Only`
}

export function CorporateBlue({ invoice, totals }: TemplateProps) {
  const status = STATUS_CONFIG[invoice.status]
  const currencySymbol = CURRENCY_SYMBOLS[invoice.currency]
  const hasBankDetails =
    invoice.bankDetails?.accountName || invoice.bankDetails?.accountNumber ||
    invoice.bankDetails?.ifsc || invoice.bankDetails?.swift ||
    invoice.bankDetails?.bank || invoice.bankDetails?.routingNumber || invoice.bankDetails?.branch
  const hasConversion = invoice.conversionDetails?.conversionRate
  const hasPayments = invoice.payments && invoice.payments.length > 0
  const taxRate = invoice.taxRate || 0
  const cgstRate = invoice.cgstRate || 0
  const sgstRate = invoice.sgstRate || 0
  const hasGstBreakdown = cgstRate > 0 || sgstRate > 0

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '13px',
        color: TEXT_DARK,
        minHeight: '1123px',
        backgroundColor: WHITE,
        boxSizing: 'border-box',
      }}
    >
      {/* Blue Header Block */}
      <div
        style={{
          backgroundColor: BLUE,
          padding: '32px 40px 28px',
        }}
      >
        {/* Title Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <span style={{ fontSize: '36px', fontWeight: '800', color: WHITE, letterSpacing: '-0.5px' }}>
            Invoice
          </span>
          <span
            style={{
              backgroundColor: status.bg,
              color: status.text,
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px',
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Sender + Billed To Side by Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Sender (Billed By) */}
          <div>
            {invoice.logo && (
              <img
                src={invoice.logo}
                alt="Logo"
                style={{ maxHeight: '50px', maxWidth: '140px', objectFit: 'contain', marginBottom: '10px', display: 'block' }}
              />
            )}
            <div style={{ fontWeight: '800', fontSize: '16px', color: WHITE, marginBottom: '4px' }}>
              {invoice.billedBy.name || 'Your Company'}
            </div>
            {invoice.billedBy.address && (
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>{invoice.billedBy.address}</div>
            )}
            {invoice.billedBy.city && (
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                {[invoice.billedBy.city, invoice.billedBy.state].filter(Boolean).join(', ')}
              </div>
            )}
            {invoice.billedBy.country && (
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                {[invoice.billedBy.country, invoice.billedBy.zipCode].filter(Boolean).join(' - ')}
              </div>
            )}
            {invoice.billedBy.gstin && (
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginTop: '4px' }}>
                GSTIN: {invoice.billedBy.gstin}
              </div>
            )}
            {invoice.billedBy.email && (
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>{invoice.billedBy.email}</div>
            )}
            {invoice.billedBy.phone && (
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>{invoice.billedBy.phone}</div>
            )}
          </div>

          {/* Billed To */}
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginBottom: '8px' }}>
              BILLED TO
            </div>
            <div style={{ fontWeight: '800', fontSize: '15px', color: WHITE, marginBottom: '4px' }}>
              {invoice.billedTo.name}
            </div>
            {invoice.billedTo.address && (
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>{invoice.billedTo.address}</div>
            )}
            {invoice.billedTo.city && (
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                {[invoice.billedTo.city, invoice.billedTo.state].filter(Boolean).join(', ')}
              </div>
            )}
            {invoice.billedTo.country && (
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                {[invoice.billedTo.country, invoice.billedTo.zipCode].filter(Boolean).join(' - ')}
              </div>
            )}
            {invoice.billedTo.gstin && (
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginTop: '4px' }}>
                GSTIN: {invoice.billedTo.gstin}
              </div>
            )}
            {invoice.billedTo.email && (
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>{invoice.billedTo.email}</div>
            )}
            {invoice.billedTo.phone && (
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>{invoice.billedTo.phone}</div>
            )}
            {invoice.billedTo.attendee && (
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginTop: '4px' }}>
                Attendee: <span style={{ fontWeight: '600' }}>{invoice.billedTo.attendee}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meta Info Bar */}
      <div
        style={{
          backgroundColor: LIGHT_BLUE_BG,
          borderBottom: `2px solid ${BLUE}`,
          padding: '14px 40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '10px', color: TEXT_GRAY, marginBottom: '3px' }}>Invoice No #</div>
          <div style={{ fontWeight: '700', color: TEXT_DARK, fontSize: '13px' }}>{invoice.invoiceNo}</div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: TEXT_GRAY, marginBottom: '3px' }}>Invoice Date</div>
          <div style={{ fontWeight: '600', color: TEXT_DARK, fontSize: '13px' }}>{formatDate(invoice.invoiceDate)}</div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: TEXT_GRAY, marginBottom: '3px' }}>Due Date</div>
          <div style={{ fontWeight: '600', color: TEXT_DARK, fontSize: '13px' }}>{formatDate(invoice.dueDate)}</div>
        </div>
        {invoice.billedBy.attendee && (
          <div>
            <div style={{ fontSize: '10px', color: TEXT_GRAY, marginBottom: '3px' }}>Created By</div>
            <div style={{ fontWeight: '600', color: TEXT_DARK, fontSize: '13px' }}>{invoice.billedBy.attendee}</div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div style={{ padding: '24px 40px' }}>
        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${BLUE}` }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: BLUE }}>#</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: BLUE }}>Item</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: BLUE }}>HSN/SAC</th>
              {taxRate > 0 && (
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: BLUE, whiteSpace: 'nowrap' as const }}>
                  {invoice.taxName || 'Tax'} Rate
                </th>
              )}
              {hasGstBreakdown && (
                <>
                  <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: BLUE }}>CGST%</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: BLUE }}>SGST%</th>
                </>
              )}
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: BLUE }}>Qty</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: BLUE }}>Rate</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: BLUE }}>Amount</th>
              {taxRate > 0 && (
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: BLUE }}>
                  {invoice.taxName || 'Tax'}
                </th>
              )}
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: BLUE }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => {
              const itemTax = taxRate > 0 ? Math.round(item.amount * (taxRate / 100) * 100) / 100 : 0
              const itemCgst = cgstRate > 0 ? Math.round(item.amount * (cgstRate / 100) * 100) / 100 : 0
              const itemSgst = sgstRate > 0 ? Math.round(item.amount * (sgstRate / 100) * 100) / 100 : 0
              const itemTotal = item.amount + itemTax + itemCgst + itemSgst
              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #DBEAFE',
                    backgroundColor: index % 2 === 0 ? WHITE : '#F8FBFF',
                  }}
                >
                  <td style={{ padding: '10px 8px', color: TEXT_GRAY, fontSize: '12px' }}>{index + 1}.</td>
                  <td style={{ padding: '10px 8px', color: TEXT_DARK }}>{item.description}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: TEXT_GRAY, fontSize: '12px' }}>{item.hsn || '—'}</td>
                  {taxRate > 0 && (
                    <td style={{ padding: '10px 8px', textAlign: 'center', color: TEXT_GRAY }}>{taxRate}%</td>
                  )}
                  {hasGstBreakdown && (
                    <>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: TEXT_GRAY, fontSize: '12px' }}>{cgstRate}%</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: TEXT_GRAY, fontSize: '12px' }}>{sgstRate}%</td>
                    </>
                  )}
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: TEXT_GRAY }}>{item.quantity}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: TEXT_GRAY }}>
                    {currencySymbol}{formatNumber(item.rate)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: TEXT_DARK }}>
                    {currencySymbol}{formatNumber(item.amount)}
                  </td>
                  {taxRate > 0 && (
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: TEXT_GRAY }}>
                      {currencySymbol}{formatNumber(itemTax)}
                    </td>
                  )}
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700', color: TEXT_DARK }}>
                    {currencySymbol}{formatNumber(itemTotal)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Bottom: Terms (left) + Totals (right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
          {/* Left: Terms or Bank Details */}
          <div>
            {invoice.terms && (
              <div style={{ marginBottom: hasBankDetails ? '16px' : '0' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: BLUE, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '6px' }}>
                  TERMS AND CONDITIONS
                </div>
                <div style={{ color: TEXT_GRAY, fontSize: '12px', lineHeight: '1.7' }}>{invoice.terms}</div>
              </div>
            )}
            {hasBankDetails && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: BLUE, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>
                  BANK DETAILS
                </div>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <tbody>
                    {invoice.bankDetails?.accountName && (
                      <tr>
                        <td style={{ paddingBottom: '3px', paddingRight: '10px', color: TEXT_GRAY, fontSize: '12px', whiteSpace: 'nowrap' as const }}>Account Name</td>
                        <td style={{ paddingBottom: '3px', fontWeight: '600', color: TEXT_DARK, fontSize: '12px' }}>{invoice.bankDetails.accountName}</td>
                      </tr>
                    )}
                    {invoice.bankDetails?.accountNumber && (
                      <tr>
                        <td style={{ paddingBottom: '3px', paddingRight: '10px', color: TEXT_GRAY, fontSize: '12px', whiteSpace: 'nowrap' as const }}>Account No.</td>
                        <td style={{ paddingBottom: '3px', fontWeight: '600', color: TEXT_DARK, fontSize: '12px' }}>{invoice.bankDetails.accountNumber}</td>
                      </tr>
                    )}
                    {invoice.bankDetails?.bank && (
                      <tr>
                        <td style={{ paddingBottom: '3px', paddingRight: '10px', color: TEXT_GRAY, fontSize: '12px' }}>Bank</td>
                        <td style={{ paddingBottom: '3px', fontWeight: '600', color: TEXT_DARK, fontSize: '12px' }}>{invoice.bankDetails.bank}</td>
                      </tr>
                    )}
                    {invoice.bankDetails?.branch && (
                      <tr>
                        <td style={{ paddingBottom: '3px', paddingRight: '10px', color: TEXT_GRAY, fontSize: '12px' }}>Branch</td>
                        <td style={{ paddingBottom: '3px', fontWeight: '600', color: TEXT_DARK, fontSize: '12px' }}>{invoice.bankDetails.branch}</td>
                      </tr>
                    )}
                    {invoice.bankDetails?.ifsc && (
                      <tr>
                        <td style={{ paddingBottom: '3px', paddingRight: '10px', color: TEXT_GRAY, fontSize: '12px' }}>IFSC</td>
                        <td style={{ paddingBottom: '3px', fontWeight: '600', color: TEXT_DARK, fontSize: '12px' }}>{invoice.bankDetails.ifsc}</td>
                      </tr>
                    )}
                    {invoice.bankDetails?.swift && (
                      <tr>
                        <td style={{ paddingBottom: '3px', paddingRight: '10px', color: TEXT_GRAY, fontSize: '12px' }}>SWIFT</td>
                        <td style={{ paddingBottom: '3px', fontWeight: '600', color: TEXT_DARK, fontSize: '12px' }}>{invoice.bankDetails.swift}</td>
                      </tr>
                    )}
                    {invoice.bankDetails?.routingNumber && (
                      <tr>
                        <td style={{ paddingRight: '10px', color: TEXT_GRAY, fontSize: '12px' }}>Routing No.</td>
                        <td style={{ fontWeight: '600', color: TEXT_DARK, fontSize: '12px' }}>{invoice.bankDetails.routingNumber}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {invoice.notes && (
              <div style={{ marginTop: invoice.terms || hasBankDetails ? '16px' : '0' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: BLUE, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '6px' }}>
                  NOTES
                </div>
                <div style={{ color: TEXT_GRAY, fontSize: '12px', lineHeight: '1.7' }}>{invoice.notes}</div>
              </div>
            )}
          </div>

          {/* Right: Totals Box */}
          <div style={{ border: `1px solid ${BLUE}`, borderRadius: '6px', overflow: 'hidden' }}>
            {/* Amount row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #DBEAFE' }}>
              <span style={{ color: TEXT_GRAY, fontSize: '13px' }}>Amount</span>
              <span style={{ fontWeight: '700', color: TEXT_DARK, fontSize: '13px' }}>
                {currencySymbol}{formatNumber(totals.subtotal)}
              </span>
            </div>

            {/* Tax / IGST row */}
            {totals.taxAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #DBEAFE' }}>
                <span style={{ color: TEXT_GRAY, fontSize: '13px' }}>{invoice.taxName || 'Tax'} ({taxRate}%)</span>
                <span style={{ fontWeight: '700', color: TEXT_DARK, fontSize: '13px' }}>
                  {currencySymbol}{formatNumber(totals.taxAmount)}
                </span>
              </div>
            )}
            {/* CGST row */}
            {totals.cgstAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #DBEAFE' }}>
                <span style={{ color: TEXT_GRAY, fontSize: '13px' }}>CGST ({cgstRate}%)</span>
                <span style={{ fontWeight: '700', color: TEXT_DARK, fontSize: '13px' }}>
                  {currencySymbol}{formatNumber(totals.cgstAmount)}
                </span>
              </div>
            )}
            {/* SGST row */}
            {totals.sgstAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #DBEAFE' }}>
                <span style={{ color: TEXT_GRAY, fontSize: '13px' }}>SGST ({sgstRate}%)</span>
                <span style={{ fontWeight: '700', color: TEXT_DARK, fontSize: '13px' }}>
                  {currencySymbol}{formatNumber(totals.sgstAmount)}
                </span>
              </div>
            )}

            {/* Discount row */}
            {totals.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #DBEAFE' }}>
                <span style={{ color: TEXT_GRAY, fontSize: '13px' }}>Discount ({invoice.discountRate}%)</span>
                <span style={{ fontWeight: '700', color: '#16A34A', fontSize: '13px' }}>
                  -{currencySymbol}{formatNumber(totals.discountAmount)}
                </span>
              </div>
            )}

            {/* Total row — highlighted */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: BLUE, borderBottom: invoice.status === 'paid' ? '1px solid rgba(255,255,255,0.3)' : 'none' }}>
              <span style={{ fontWeight: '700', color: WHITE, fontSize: '14px' }}>
                Total ({invoice.currency})
              </span>
              <span style={{ fontWeight: '800', color: WHITE, fontSize: '16px' }}>
                {currencySymbol}{formatNumber(totals.total)}
              </span>
            </div>

            {/* Amount Paid row */}
            {invoice.status === 'paid' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: LIGHT_BLUE_BG }}>
                <span style={{ color: TEXT_GRAY, fontSize: '13px' }}>Amount Paid</span>
                <span style={{ fontWeight: '700', color: DARK_BLUE, fontSize: '13px' }}>
                  ({currencySymbol}{formatNumber(totals.total)})
                </span>
              </div>
            )}

            {/* Conversion */}
            {hasConversion && (
              <div style={{ padding: '10px 16px', borderTop: '1px solid #DBEAFE' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ color: TEXT_GRAY, fontSize: '12px' }}>Conversion Rate</span>
                  <span style={{ color: TEXT_DARK, fontSize: '12px' }}>{invoice.conversionDetails?.conversionRate}</span>
                </div>
                {invoice.conversionDetails?.convertedAmount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: TEXT_GRAY, fontSize: '12px' }}>In {invoice.conversionDetails.toCurrency}</span>
                    <span style={{ color: TEXT_DARK, fontSize: '12px', fontWeight: '600' }}>
                      {formatNumber(invoice.conversionDetails.convertedAmount)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Total in Words */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: BLUE, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
            TOTAL IN WORDS:{' '}
          </span>
          <span style={{ color: TEXT_DARK, fontSize: '12px' }}>
            {numberToWords(totals.total, invoice.currency)}
          </span>
        </div>

        {/* Payments Section */}
        {hasPayments && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: BLUE, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '10px' }}>
              PAYMENT RECORDS
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: LIGHT_BLUE_BG, borderBottom: `2px solid ${BLUE}` }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: DARK_BLUE }}>Date</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: DARK_BLUE }}>Mode</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: DARK_BLUE }}>Amount</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: DARK_BLUE, paddingLeft: '16px' }}>Account</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: DARK_BLUE, paddingLeft: '16px' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments?.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #DBEAFE' }}>
                    <td style={{ padding: '8px 10px', fontSize: '12px', color: TEXT_GRAY }}>{formatDate(payment.date)}</td>
                    <td style={{ padding: '8px 10px', fontSize: '12px', color: TEXT_GRAY }}>{payment.mode}</td>
                    <td style={{ padding: '8px 10px', fontSize: '12px', fontWeight: '600', color: TEXT_DARK, textAlign: 'right' }}>
                      {currencySymbol}{formatNumber(payment.amountReceived)}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: '12px', color: TEXT_GRAY, paddingLeft: '16px' }}>{payment.paymentAccount}</td>
                    <td style={{ padding: '8px 10px', fontSize: '12px', color: TEXT_GRAY, paddingLeft: '16px' }}>{payment.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${BLUE}`, paddingTop: '14px', textAlign: 'center' }}>
          <p style={{ color: '#94A3B8', fontSize: '11px', fontStyle: 'italic' as const }}>
            This is an electronically generated document, no signature is required.
          </p>
        </div>
      </div>
    </div>
  )
}
