import { PropsWithChildren } from 'react'

export function IFCCardRoot({ children }: PropsWithChildren) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow w-1/2 h-[calc(100vh-100px)] flex-col overflow-hidden">
      {children}
    </div>
  )
}
