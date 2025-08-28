'use client'

import { ReactNode, useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import AuthenticatedLayout from './authenticated-layout'
import { LoadingSpinner } from './ui/loading-spinner'

function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="ifclca-theme"
      enableColorScheme={false}>
      <QueryClientProvider client={queryClient}>
        <AuthenticatedLayout>{children}</AuthenticatedLayout>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default Providers
