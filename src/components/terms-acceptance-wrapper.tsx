'use client'

import { useState, PropsWithChildren } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTanStackSubmit } from '@/hooks/use-tanstack-fetch'
import { TermsAcceptanceModal } from './terms-acceptance-modal'

export function TermsAcceptanceWrapper({ children }: PropsWithChildren) {
  const [showModal, setShowModal] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')
  const { mutate: acceptTerms } = useTanStackSubmit<void, void>('/api/accept-terms', {
    method: 'POST',
    showErrorToast: true,
    onSuccess: () => {
      setShowModal(false)
      redirectUrl ? router.push(redirectUrl) : router.refresh()
    },
  })

  return (
    <>
      <TermsAcceptanceModal open={showModal} onAccept={() => acceptTerms()} />
      {children}
    </>
  )
}
