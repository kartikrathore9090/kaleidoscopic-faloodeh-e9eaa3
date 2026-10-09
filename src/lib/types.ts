// Domain types. These mirror the DTOs the Java 17 + MongoDB backend exposes,
// so swapping the mock API for the real one needs no UI changes.

export type Role = 'STUDENT' | 'STAFF' | 'ADMIN'

export type RequestStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type Category =
  | 'MAINTENANCE'
  | 'IT'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'CLEANING'
  | 'SECURITY'
  | 'HOSTEL'
  | 'OTHER'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  department?: string
  studentId?: string
  phone?: string
  active: boolean
  joinedAt: string // ISO-8601
}

export interface Location {
  building: string
  room?: string
}

export type ActivityType = 'CREATED' | 'ASSIGNED' | 'STATUS_CHANGED' | 'COMMENT' | 'RESOLVED'

export interface Activity {
  id: string
  type: ActivityType
  actorId: string
  message: string
  status?: RequestStatus
  at: string
}

export interface Resolution {
  summary: string
  resolvedBy: string
  resolvedAt: string
  rating?: number // 1-5 from the student
}

export interface ServiceRequest {
  id: string
  ticketNo: string
  title: string
  description: string
  category: Category
  priority: Priority
  status: RequestStatus
  location: Location
  createdBy: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  dueAt?: string
  resolution?: Resolution
  activity: Activity[]
}

export interface CreateRequestInput {
  title: string
  description: string
  category: Category
  priority: Priority
  location: Location
}

export interface RequestFilter {
  status?: RequestStatus | 'ALL'
  priority?: Priority | 'ALL'
  category?: Category | 'ALL'
  createdBy?: string
  assignedTo?: string
  q?: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  studentId?: string
  department?: string
}
