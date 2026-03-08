import Image from 'next/image'
import { InvoicePageClient } from '@/components/invoice/InvoicePageClient'

export default function Home() {
  return (
    <main>
      {/* SEO Hero — server-rendered for indexability */}
      <header className="bg-gradient-to-r from-[#fff] to-[#000] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: BuildingDots branding */}
          <div className="flex items-center gap-3">
            <a
              href="https://buildingdots.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-85 transition-opacity"
              aria-label="BuildingDots — visit website"
            >
              {/* Swap to /buildingdots-logo.png once you drop the PNG in public/ */}
              <Image
                src="/buildingdots.png"
                alt="BuildingDots"
                height={5}
                width={50}
              />
            </a>
            <div className="w-px h-6 bg-white/20 hidden sm:block" />
            <div className="hidden sm:block">
              <h1 className="text-sm text-black font-bold leading-tight">Free Invoice Generator</h1>
              <p className="text-black text-xs mt-0.5">No signup · Instant PDF · 4 templates</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-sm font-bold leading-tight">Free Invoice Generator</h1>
            </div>
          </div>
          {/* Right: feature badges */}
          <div className="flex items-center gap-3 text-xs text-purple-100">
            <span className="hidden sm:flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              100% Free
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No Signup
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              PDF Download
            </span>
          </div>
        </div>
      </header>

      {/* Main Invoice Builder (client-side only) */}
      <InvoicePageClient />

      {/* SEO Content Section — below the fold, server-rendered */}
      <section className="bg-white border-t border-gray-100 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            The Best Free Online Invoice Generator
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Create professional invoices in seconds. No account required — just fill in your details and download your PDF invoice instantly.
          </p>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: '📄',
                title: '4 Professional Templates',
                desc: 'Choose from Classic Purple, Modern Minimal, Professional Dark, or Creative Bold. Switch anytime.',
              },
              {
                icon: '⚡',
                title: 'Instant PDF Download',
                desc: 'Download your invoice as a pixel-perfect PDF in one click. No watermarks, no limits.',
              },
              {
                icon: '🔓',
                title: 'No Account Required',
                desc: "Start creating immediately. Your data is saved in your browser — no signup, no email, no password.",
              },
              {
                icon: '☁️',
                title: 'Google Drive Integration',
                desc: 'Save your invoices directly to Google Drive with one click. Organize your billing in the cloud.',
              },
              {
                icon: '🧾',
                title: 'GST Invoice Support',
                desc: 'Add GSTIN, tax rates, and create GST-compliant invoices for Indian businesses.',
              },
              {
                icon: '💱',
                title: 'Multi-Currency & Conversion',
                desc: 'Support for USD, EUR, GBP, INR, CAD and more. Add currency conversion details for international invoices.',
              },
              {
                icon: '🏦',
                title: 'Bank Details Section',
                desc: 'Include your bank account details, IFSC, SWIFT codes for seamless payment collection.',
              },
              {
                icon: '📱',
                title: 'Mobile Friendly',
                desc: 'Create invoices on any device. Fully responsive design works on mobile, tablet, and desktop.',
              },
              {
                icon: '🔄',
                title: 'Auto-Save',
                desc: "Your invoice is automatically saved as you type. Come back anytime — your work won't be lost.",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-3 p-4 rounded-xl border border-gray-100 hover:border-[#7C3AED30] hover:shadow-sm transition-all">
                <span className="text-2xl flex-shrink-0">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{feature.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
              Create a Professional Invoice in 3 Simple Steps
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Fill Your Details', desc: 'Enter your company info, client details, and invoice items. Add bank details, tax rates, and more.' },
                { step: '2', title: 'Choose a Template', desc: 'Pick from 4 beautiful templates. See your invoice come to life instantly in the live preview.' },
                { step: '3', title: 'Download or Save', desc: 'Download as PDF for free or save directly to Google Drive. No watermarks, no fees.' },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                { q: 'Is this invoice generator really free?', a: 'Yes, completely free. No hidden fees, no premium plans, no credit card required. Create unlimited invoices and download them as PDFs at no cost.' },
                { q: 'Do I need to create an account?', a: 'No account needed. Your invoice data is saved automatically in your browser, so you can resume editing anytime without logging in.' },
                { q: 'Can I upload my invoice to Google Drive?', a: 'Yes! Click "Save to Drive" to upload your invoice PDF directly to Google Drive. Just authorize Google Drive access when prompted — the file is uploaded to your Drive, not shared with us.' },
                { q: 'Does it support GST invoices for India?', a: 'Yes, you can add your GSTIN number, apply tax rates, and create GST-compliant invoices. Perfect for Indian freelancers and businesses.' },
                { q: 'Can I add my company logo?', a: 'Yes, upload your company logo (up to 2MB) and it will appear on your invoice. The logo is stored locally in your browser and included in the PDF.' },
                { q: 'What currencies are supported?', a: 'We support USD, EUR, GBP, INR, CAD, AUD, JPY, SGD, AED, and CHF. You can also add currency conversion details for international invoices.' },
              ].map((faq) => (
                <div key={faq.q} className="border border-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">{faq.q}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4 text-center">
        <p className="text-sm text-gray-500">
          Free Invoice Generator — Create professional invoices online for free. No signup required.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          © {new Date().getFullYear()} Free Invoice Generator. All rights reserved.
        </p>
        <p className="text-xs text-gray-400 mt-3">
          Made with{' '}
          <span className="text-red-400">❤️</span>
          {' '}by{' '}
          <a
            href="https://buildingdots.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-[#7C3AED] font-medium transition-colors"
          >
            BuildingDots
          </a>
        </p>
      </footer>
    </main>
  )
}
