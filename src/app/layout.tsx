import type { Metadata } from 'next'
import {
  Inter,
  Playfair_Display,
  Lato,
  Poppins,
  Merriweather,
} from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins' })
const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-merriweather' })

export const metadata: Metadata = {
  title: {
    default: 'TuCarta — Carta digital para restaurantes',
    template: '%s | TuCarta',
  },
  description: 'Crea tu carta digital con código QR en minutos. Sin comisiones, sin complicaciones.',
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'TuCarta',
  },
}

const fontVars = [
  inter.variable,
  playfair.variable,
  lato.variable,
  poppins.variable,
  merriweather.variable,
].join(' ')

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontVars}>
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}
