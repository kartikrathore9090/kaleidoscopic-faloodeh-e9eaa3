import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { ROLE_META } from '@/lib/meta'

export const Route = createFileRoute('/app/')({ component: AppIndex })

function AppIndex() {
  const { user } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (user) navigate({ to: ROLE_META[user.role].home, replace: true })
  }, [user, navigate])
  return null
}
