import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'
import LandingPage from '@/components/landing-page'
import { TermsAcceptanceWrapper } from '@/components/terms-acceptance-wrapper'
import DashboardPage from './dashboard/page'

export default async function HomePage() {
  const { userId } = await auth()
  const cookieStore = await cookies()
  const hasAcceptedTerms = cookieStore.has('terms_accepted')

  // If user is not authenticated, show landing page
  if (!userId) {
    return <LandingPage />
  }

  // If user is authenticated but hasn't accepted terms, show terms acceptance
  if (!hasAcceptedTerms) {
    return (
      <TermsAcceptanceWrapper>
        <DashboardPage />
      </TermsAcceptanceWrapper>
    )
  }

  // If user is authenticated and has accepted terms, show dashboard
  return <DashboardPage />
}
