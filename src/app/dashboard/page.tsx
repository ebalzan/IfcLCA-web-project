import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Dashboard from '@/components/dashboard'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/')
  }

  return <Dashboard />
}
