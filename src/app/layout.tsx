import { PropsWithChildren } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import Providers from '@/components/providers'
import { nunitoSans } from '@/styles/fonts'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'IfcLCA',
  description: 'LCA Analysis for Ifc Models',
}

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <ClerkProvider dynamic>
      <html lang="en" className={nunitoSans.variable} suppressHydrationWarning>
        <body suppressHydrationWarning>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
