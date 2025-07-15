"use client";

import { useState, ReactNode } from "react";
import { TermsAcceptanceModal } from "./terms-acceptance-modal";
import { useRouter, useSearchParams } from "next/navigation";
import { useFetch } from "@/hooks/use-fetch";

export function TermsAcceptanceWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const response = useFetch("/api/accept-terms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  async function handleAcceptTerms() {
    try {
      await response.execute()
      setShowModal(false)

      redirectUrl ? router.push(redirectUrl) : router.refresh()
    } catch (error) {
      console.error("Failed to accept terms:", error);
    }
  };

  return (
    <>
      <TermsAcceptanceModal
        open={showModal}
        onAccept={handleAcceptTerms}
      />
      {children}
    </>
  );
}
