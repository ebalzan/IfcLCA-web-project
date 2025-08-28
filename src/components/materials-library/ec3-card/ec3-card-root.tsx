import { PropsWithChildren } from 'react'

export function EC3CardRoot({ children }: PropsWithChildren) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow w-1/2 h-[calc(70vh-1rem)] flex flex-col overflow-hidden">
      {children}
    </div>
  )
}
