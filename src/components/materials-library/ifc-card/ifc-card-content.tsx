import { PropsWithChildren } from 'react'

export function IFCCardContent({ children }: PropsWithChildren) {
  return (
    <div className="flex-1 overflow-y-auto h-full py-4 divide-y divide-secondary/50 custom-scrollbar">
      {children}
    </div>
  )
}
