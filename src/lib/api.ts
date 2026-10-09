// Single entry point for all data access.
//
// When VITE_API_BASE_URL is set (e.g. https://api.campus.edu), every call goes
// to the Java 17 + MongoDB backend over REST. Otherwise a mock implementation
// backed by localStorage + fixtures.ts is used so the UI is fully clickable.
//
// Expected REST contract (JSON, ISO-8601 dates, Bearer token auth):
//   POST   /api/auth/login              { email, password }        -> { token, user }
//   POST   /api/auth/register           RegisterInput              -> { token, user }
//   GET    /api/requests?status&priority&category&createdBy&assignedTo&q -> ServiceRequest[]
//   GET    /api/requests/{id}                                      -> ServiceRequest
//   POST   /api/requests                CreateRequestInput         -> ServiceRequest
//   PATCH  /api/requests/{id}/status    { status, note?, resolution? } -> ServiceRequest
//   PATCH  /api/requests/{id}/assign    { staffId }                -> ServiceRequest
//   POST   /api/requests/{id}/comments  { message }                -> ServiceRequest
//   PATCH  /api/requests/{id}/rating    { rating }                 -> ServiceRequest
//   GET    /api/users?role                                         -> User[]
//   POST   /api/users                   NewUserInput               -> User
//   PATCH  /api/users/{id}              Partial<User>              -> User

import type {
  Activity,
  CreateRequestInput,
  RegisterInput,
  RequestFilter,
  RequestStatus,
  Role,
  ServiceRequest,
  User,
} from './types'
import { DEMO_PASSWORD, seedRequests, seedUsers } from './fixtures'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
const TOKEN_KEY = 'cc-token'

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message)
  }
}

export interface AuthResult {
  token: string
  user: User
}

export interface StatusUpdate {
  status: RequestStatus
  note?: string
  resolution?: string
}

interface Api {
  login(email: string, password: string): Promise<AuthResult>
  register(input: RegisterInput): Promise<AuthResult>
  listRequests(filter?: RequestFilter): Promise<ServiceRequest[]>
  getRequest(id: string): Promise<ServiceRequest>
  createRequest(input: CreateRequestInput, actorId: string): Promise<ServiceRequest>
  updateStatus(id: string, update: StatusUpdate, actorId: string): Promise<ServiceRequest>
  assign(id: string, staffId: string, actorId: string): Promise<ServiceRequest>
  comment(id: string, message: string, actorId: string): Promise<ServiceRequest>
  rate(id: string, rating: number): Promise<ServiceRequest>
  listUsers(role?: Role): Promise<User[]>
  createUser(input: NewUserInput): Promise<User>
  updateUser(id: string, patch: Partial<User>): Promise<User>
}

export type NewUserInput = Pick<User, 'name' | 'email' | 'role' | 'department'>

/* ------------------------------------------------------------------ */
/* HTTP implementation (Java backend)                                  */
/* ------------------------------------------------------------------ */

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body.message ?? `Request failed (${res.status})`, res.status)
  }
  return res.json() as Promise<T>
}

const qs = (o: object) => {
  const p = new URLSearchParams()
  Object.entries(o).forEach(([k, v]) => v && v !== 'ALL' && p.set(k, String(v)))
  const s = p.toString()
  return s ? `?${s}` : ''
}

const httpApi: Api = {
  login: (email, password) => http('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (input) => http('/api/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  listRequests: (filter = {}) => http(`/api/requests${qs(filter)}`),
  getRequest: (id) => http(`/api/requests/${id}`),
  createRequest: (input) => http('/api/requests', { method: 'POST', body: JSON.stringify(input) }),
  updateStatus: (id, update) => http(`/api/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify(update) }),
  assign: (id, staffId) => http(`/api/requests/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ staffId }) }),
  comment: (id, message) => http(`/api/requests/${id}/comments`, { method: 'POST', body: JSON.stringify({ message }) }),
  rate: (id, rating) => http(`/api/requests/${id}/rating`, { method: 'PATCH', body: JSON.stringify({ rating }) }),
  listUsers: (role) => http(`/api/users${qs({ role })}`),
  createUser: (input) => http('/api/users', { method: 'POST', body: JSON.stringify(input) }),
  updateUser: (id, patch) => http(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
}

/* ------------------------------------------------------------------ */
/* Mock implementation (localStorage + fixtures)                       */
/* ------------------------------------------------------------------ */

const DB_KEY = 'cc-mock-db-v1'

interface MockDb {
  users: User[]
  requests: ServiceRequest[]
  passwords: Record<string, string>
}

let memoryDb: MockDb | null = null

function db(): MockDb {
  if (memoryDb) return memoryDb
  const fresh = (): MockDb => ({
    users: structuredClone(seedUsers),
    requests: structuredClone(seedRequests),
    passwords: {},
  })
  if (typeof localStorage === 'undefined') return (memoryDb = fresh())
  try {
    const raw = localStorage.getItem(DB_KEY)
    memoryDb = raw ? (JSON.parse(raw) as MockDb) : fresh()
  } catch {
    memoryDb = fresh()
  }
  return memoryDb
}

function save() {
  if (typeof localStorage !== 'undefined' && memoryDb) localStorage.setItem(DB_KEY, JSON.stringify(memoryDb))
}

export function resetMockData() {
  memoryDb = null
  if (typeof localStorage !== 'undefined') localStorage.removeItem(DB_KEY)
}

const latency = (ms = 350 + Math.random() * 450) => new Promise((r) => setTimeout(r, ms))
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`
const clone = <T>(v: T): T => structuredClone(v)

function findRequest(id: string) {
  const r = db().requests.find((x) => x.id === id || x.ticketNo === id)
  if (!r) throw new ApiError('Request not found', 404)
  return r
}

function push(r: ServiceRequest, a: Omit<Activity, 'id' | 'at'>) {
  const at = new Date().toISOString()
  r.activity.push({ ...a, id: uid('act'), at })
  r.updatedAt = at
}

const STATUS_COPY: Record<RequestStatus, string> = {
  OPEN: 'Reopened request',
  ASSIGNED: 'Assigned to technician',
  IN_PROGRESS: 'Work started',
  RESOLVED: 'Marked as resolved',
  CLOSED: 'Request closed',
}

const mockApi: Api = {
  async login(email, password) {
    await latency(700)
    const user = db().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    const expected = user ? (db().passwords[user.id] ?? DEMO_PASSWORD) : null
    if (!user || password !== expected) throw new ApiError('Invalid email or password', 401)
    if (!user.active) throw new ApiError('This account has been deactivated. Contact campus operations.', 403)
    return { token: `mock.${user.id}`, user: clone(user) }
  },
  async register(input) {
    await latency(800)
    if (db().users.some((u) => u.email.toLowerCase() === input.email.toLowerCase()))
      throw new ApiError('An account with this email already exists', 409)
    const user: User = {
      id: uid('u-stu'),
      name: input.name,
      email: input.email,
      role: 'STUDENT',
      studentId: input.studentId,
      department: input.department,
      active: true,
      joinedAt: new Date().toISOString(),
    }
    db().users.push(user)
    db().passwords[user.id] = input.password
    save()
    return { token: `mock.${user.id}`, user: clone(user) }
  },
  async listRequests(f = {}) {
    await latency()
    const q = f.q?.trim().toLowerCase()
    return clone(
      db()
        .requests.filter(
          (r) =>
            (!f.status || f.status === 'ALL' || r.status === f.status) &&
            (!f.priority || f.priority === 'ALL' || r.priority === f.priority) &&
            (!f.category || f.category === 'ALL' || r.category === f.category) &&
            (!f.createdBy || r.createdBy === f.createdBy) &&
            (!f.assignedTo || r.assignedTo === f.assignedTo) &&
            (!q ||
              [r.title, r.ticketNo, r.description, r.location.building, r.location.room ?? '']
                .join(' ')
                .toLowerCase()
                .includes(q)),
        )
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    )
  },
  async getRequest(id) {
    await latency()
    return clone(findRequest(id))
  },
  async createRequest(input, actorId) {
    await latency(900)
    const now = new Date().toISOString()
    const n = db().requests.length
    const sla = { LOW: 120, MEDIUM: 72, HIGH: 24, URGENT: 4 }[input.priority]
    const r: ServiceRequest = {
      ...input,
      id: uid('req'),
      ticketNo: `CC-${2400 + n * 7}`,
      status: 'OPEN',
      createdBy: actorId,
      createdAt: now,
      updatedAt: now,
      dueAt: new Date(Date.now() + sla * 3_600_000).toISOString(),
      activity: [{ id: uid('act'), type: 'CREATED', actorId, message: 'Request submitted', status: 'OPEN', at: now }],
    }
    db().requests.push(r)
    save()
    return clone(r)
  },
  async updateStatus(id, { status, note, resolution }, actorId) {
    await latency(600)
    const r = findRequest(id)
    r.status = status
    push(r, {
      type: status === 'RESOLVED' ? 'RESOLVED' : 'STATUS_CHANGED',
      actorId,
      status,
      message: note?.trim() || STATUS_COPY[status],
    })
    if (status === 'RESOLVED')
      r.resolution = {
        summary: resolution?.trim() || note?.trim() || 'Issue resolved.',
        resolvedBy: actorId,
        resolvedAt: new Date().toISOString(),
      }
    if (status === 'OPEN') {
      r.assignedTo = undefined
      r.resolution = undefined
    }
    save()
    return clone(r)
  },
  async assign(id, staffId, actorId) {
    await latency(600)
    const r = findRequest(id)
    const staff = db().users.find((u) => u.id === staffId)
    if (!staff) throw new ApiError('Staff member not found', 404)
    const reassign = Boolean(r.assignedTo)
    r.assignedTo = staffId
    if (r.status === 'OPEN') r.status = 'ASSIGNED'
    push(r, {
      type: 'ASSIGNED',
      actorId,
      status: r.status === 'ASSIGNED' ? 'ASSIGNED' : undefined,
      message: `${reassign ? 'Reassigned' : 'Assigned'} to ${staff.name}`,
    })
    save()
    return clone(r)
  },
  async comment(id, message, actorId) {
    await latency(400)
    const r = findRequest(id)
    push(r, { type: 'COMMENT', actorId, message })
    save()
    return clone(r)
  },
  async rate(id, rating) {
    await latency(400)
    const r = findRequest(id)
    if (r.resolution) r.resolution.rating = rating
    save()
    return clone(r)
  },
  async listUsers(role) {
    await latency()
    return clone(db().users.filter((u) => !role || u.role === role))
  },
  async createUser(input) {
    await latency(700)
    if (db().users.some((u) => u.email.toLowerCase() === input.email.toLowerCase()))
      throw new ApiError('An account with this email already exists', 409)
    const user: User = { ...input, id: uid(`u-${input.role.toLowerCase().slice(0, 3)}`), active: true, joinedAt: new Date().toISOString() }
    db().users.push(user)
    save()
    return clone(user)
  },
  async updateUser(id, patch) {
    await latency(500)
    const u = db().users.find((x) => x.id === id)
    if (!u) throw new ApiError('User not found', 404)
    Object.assign(u, patch, { id: u.id })
    save()
    return clone(u)
  },
}

export const api: Api = BASE_URL ? httpApi : mockApi
export const isMockApi = !BASE_URL
export const tokenStore = {
  get: () => (typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}
