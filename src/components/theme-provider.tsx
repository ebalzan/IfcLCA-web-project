'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering theme provider until mounted
  if (!mounted) {
    return <>{children}</>
  }

  // Wrap in error boundary to catch any theme provider issues
  try {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
  } catch (error) {
    console.error('Theme provider error:', error)
    // Fallback to basic rendering without theme provider
    return <>{children}</>
  }
}
