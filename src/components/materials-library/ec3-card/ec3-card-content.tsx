import { PropsWithChildren } from 'react'

export function EC3CardContent({ children }: PropsWithChildren) {
  return <div className="flex-1 overflow-y-auto h-full py-4 custom-scrollbar">{children}</div>
}
