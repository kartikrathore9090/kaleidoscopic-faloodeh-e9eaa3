import { useCallback, useEffect, useRef, useState } from 'react'

/** Minimal async data hook: { data, loading, error, reload, setData }. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const call = useRef(0)

  const run = useCallback(
    (silent = false) => {
      const id = ++call.current
      if (!silent) setLoading(true)
      setError(null)
      fn()
        .then((d) => id === call.current && setData(d))
        .catch((e: Error) => id === call.current && setError(e))
        .finally(() => id === call.current && setLoading(false))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  )

  useEffect(() => {
    run()
  }, [run])

  return { data, loading, error, reload: run, setData }
}

export function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

/** Adds .is-visible to the element when it scrolls into view. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-visible')
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}
