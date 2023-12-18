import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import {Providers} from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TrailBuddy MTB-rentals',
  description: 'MTB-booking and trail-assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='dark'> 
      <body className={inter.className}><Providers>{children}</Providers>
      <SpeedInsights />
      </body>
    </html>
  )
}
