'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Footer } from '@/components/footer'
import { NavigationBar } from '@/components/navigation-bar'
import { SidebarNavigation } from '@/components/sidebar-navigation'

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (!isLoaded) {
    return <div className="min-h-screen" />
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {isSignedIn ? (
        <>
          <NavigationBar notifications={[]} />
          <div className="flex flex-1">
            <aside className="w-12 flex-shrink-0">
              <SidebarNavigation />
            </aside>
            <div className="flex-1 flex flex-col min-w-0">
              <main className="flex-1 w-full">
                <div className="max-w-[2000px] mx-auto w-full px-6">{children}</div>
              </main>
            </div>
          </div>
          <Footer />
        </>
      ) : (
        children
      )}
    </div>
  )
}
