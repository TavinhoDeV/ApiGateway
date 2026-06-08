import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

export interface Stats {
  totalRequests: number; requestsToday: number; rateLimitedToday: number
  avgResponseTimeMs: number
  topPaths:       { path: string; count: number }[]
  topUsers:       { userId: string; name: string; count: number }[]
  statusBreakdown:{ status: string; count: number }[]
  requestsByHour: { hour: string; count: number }[]
  recentLogs:     any[]
}

export function useStats(intervalMs = 5000) {
  const { token } = useAuth()
  const [stats, setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Falha ao buscar stats')
      setStats(await res.json()); setError(null)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { fetch_() }, [fetch_])
  useEffect(() => {
    const id = setInterval(fetch_, intervalMs)
    return () => clearInterval(id)
  }, [fetch_, intervalMs])

  return { stats, loading, error, refetch: fetch_ }
}
