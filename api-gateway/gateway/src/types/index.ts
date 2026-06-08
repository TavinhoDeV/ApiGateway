export interface JwtPayload {
  sub: string
  email: string
  role: 'admin' | 'user'
  plan: 'free' | 'pro' | 'enterprise'
  iat?: number
  exp?: number
}

export interface RateLimitConfig {
  free:       { max: number; windowMs: number }
  pro:        { max: number; windowMs: number }
  enterprise: { max: number; windowMs: number }
}

export const RATE_LIMITS: RateLimitConfig = {
  free:       { max: 30,   windowMs: 60_000 },
  pro:        { max: 200,  windowMs: 60_000 },
  enterprise: { max: 1000, windowMs: 60_000 },
}

export interface UpstreamService {
  name:   string
  prefix: string
  target: string
}

export const UPSTREAM_SERVICES: UpstreamService[] = [
  { name: 'jsonplaceholder', prefix: '/proxy/posts',   target: 'https://jsonplaceholder.typicode.com' },
  { name: 'jokes',           prefix: '/proxy/jokes',   target: 'https://official-joke-api.appspot.com' },
  { name: 'catfacts',        prefix: '/proxy/catfacts', target: 'https://catfact.ninja' },
]

export interface LogEntry {
  id:              string
  userId?:         string
  userName?:       string
  method:          string
  path:            string
  statusCode:      number
  responseTimeMs:  number
  ip:              string
  userAgent?:      string
  upstream?:       string
  rateLimited:     boolean
  createdAt:       string
}

export interface DashboardStats {
  totalRequests:     number
  requestsToday:     number
  rateLimitedToday:  number
  avgResponseTimeMs: number
  topPaths:          { path: string; count: number }[]
  topUsers:          { userId: string; name: string; count: number }[]
  statusBreakdown:   { status: string; count: number }[]
  requestsByHour:    { hour: string; count: number }[]
  recentLogs:        LogEntry[]
}
