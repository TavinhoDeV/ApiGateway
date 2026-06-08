import { incrementRateLimit, getRateLimitTTL } from './redis'
import { RATE_LIMITS } from '../types'
import type { JwtPayload } from '../types'

export interface RateLimitResult {
  allowed:   boolean
  limit:     number
  remaining: number
  resetMs:   number
}

export async function checkRateLimit(
  ip: string,
  user?: JwtPayload
): Promise<RateLimitResult> {
  const plan = user?.plan ?? 'free'
  const config = RATE_LIMITS[plan]
  const key = user ? `user:${user.sub}` : `ip:${ip}`

  const count = await incrementRateLimit(key, config.windowMs)
  const ttl   = await getRateLimitTTL(key)

  return {
    allowed:   count <= config.max,
    limit:     config.max,
    remaining: Math.max(0, config.max - count),
    resetMs:   ttl > 0 ? ttl : config.windowMs,
  }
}
