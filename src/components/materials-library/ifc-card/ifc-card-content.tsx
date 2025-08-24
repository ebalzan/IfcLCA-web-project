import { PropsWithChildren } from 'react'

export function IFCCardContent({ children }: PropsWithChildren) {
  return <div className="flex-1 overflow-y-auto min-h-0 p-2">{children}</div>
}
