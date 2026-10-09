import { useEffect, useState } from 'react'
import { api } from './api'
import type { User } from './types'

// Shared, lazily-loaded user directory so any component can resolve an id -> user.
let cache: Map<string, User> | null = null
let pending: Promise<Map<string, User>> | null = null
const listeners = new Set<(m: Map<string, User>) => void>()

function load() {
  pending ??= api.listUsers().then((users) => {
    cache = new Map(users.map((u) => [u.id, u]))
    listeners.forEach((l) => l(cache!))
    return cache
  })
  return pending
}

export function refreshDirectory() {
  pending = null
  return load()
}

export function useDirectory() {
  const [map, setMap] = useState<Map<string, User>>(cache ?? new Map())
  useEffect(() => {
    listeners.add(setMap)
    if (cache) setMap(cache)
    else load()
    return () => {
      listeners.delete(setMap)
    }
  }, [])
  return map
}
