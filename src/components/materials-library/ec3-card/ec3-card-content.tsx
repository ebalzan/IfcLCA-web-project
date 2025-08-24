import { PropsWithChildren } from 'react'

export function EC3CardContent({ children }: PropsWithChildren) {
  return <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
}
