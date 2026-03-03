import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://invoice.buildingdots.com'),
  title: {
    default: 'Free Invoice Generator — Create Professional PDF Invoices Online',
    template: '%s | Free Invoice Generator',
  },
  description:
    'Create professional invoices online for free. No signup required. Download as PDF instantly or save to Google Drive. Multiple templates including GST invoices, currency conversion, bank details and more.',
  keywords: [
    'free invoice generator',
    'online invoice maker',
    'create invoice online free',
    'invoice template free download',
    'pdf invoice generator',
    'invoice maker no signup',
    'professional invoice generator',
    'gst invoice generator',
    'free invoice download',
    'invoice creator',
    'billing software free',
    'freelance invoice generator',
    'invoice template online',
    'make invoice online',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://invoice.buildingdots.com',
    siteName: 'Free Invoice Generator',
    title: 'Free Invoice Generator — Create Professional PDF Invoices Online',
    description:
      'Create, customize and download professional invoices as PDF. No account needed. Choose from 4 stunning templates.',
    images: [
      {
        url: '/buildingdots.png',
        width: 1200,
        height: 630,
        alt: 'Free Invoice Generator — Create Professional Invoices Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Invoice Generator',
    description:
      'Create professional PDF invoices online for free. No signup required. Multiple templates available.',
    images: ['/buildingdots.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://invoice.buildingdots.com',
  },
  authors: [{ name: 'Invoice Generator' }],
  category: 'Business Tools',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Free Invoice Generator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://invoice.buildingdots.com',
      description:
        'Create professional PDF invoices online for free. No account required. Multiple templates, GST support, currency conversion, Google Drive integration.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Free PDF invoice generation',
        'No signup required',
        '4 professional templates',
        'GST invoice support',
        'Currency conversion',
        'Google Drive upload',
        'Bank details section',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is this invoice generator really free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, completely free with no signup required. Create unlimited invoices and download them as PDFs at no cost.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to create an account?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No account needed. Your invoice data is saved automatically in your browser, so you can resume editing anytime without logging in.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I upload my invoice to Google Drive?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! You can save your invoice PDF directly to Google Drive with one click. Just authorize Google Drive access when prompted.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does it support GST invoices?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, you can add your GSTIN number, apply tax rates, and create GST-compliant invoices for Indian businesses.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I add my company logo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, upload your company logo (up to 2MB) and it will appear on your invoice. The logo is stored locally in your browser.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
