// Sample data used by the mock API (see api.ts). Delete or ignore once
// VITE_API_BASE_URL points at the real backend.
import type { Activity, Category, Priority, RequestStatus, ServiceRequest, User } from './types'
import { STATUS_FLOW } from './meta'

const HOUR = 3_600_000
const ago = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString()

export const DEMO_PASSWORD = 'campus123'

export const seedUsers: User[] = [
  { id: 'u-stu-1', name: 'Aisha Rahman', email: 'aisha@campus.edu', role: 'STUDENT', studentId: 'CS21B042', department: 'Computer Science', active: true, joinedAt: ago(24 * 220) },
  { id: 'u-stu-2', name: 'Leo Martins', email: 'leo@campus.edu', role: 'STUDENT', studentId: 'ME22B017', department: 'Mechanical Eng.', active: true, joinedAt: ago(24 * 160) },
  { id: 'u-stu-3', name: 'Priya Nair', email: 'priya@campus.edu', role: 'STUDENT', studentId: 'BT21B008', department: 'Biotechnology', active: true, joinedAt: ago(24 * 300) },
  { id: 'u-stu-4', name: 'Daniel Okafor', email: 'daniel@campus.edu', role: 'STUDENT', studentId: 'EE23B051', department: 'Electrical Eng.', active: false, joinedAt: ago(24 * 40) },
  { id: 'u-stf-1', name: 'Marcus Chen', email: 'marcus@campus.edu', role: 'STAFF', department: 'Facilities', phone: '+1 555 0142', active: true, joinedAt: ago(24 * 700) },
  { id: 'u-stf-2', name: 'Sofia Alvarez', email: 'sofia@campus.edu', role: 'STAFF', department: 'IT Services', phone: '+1 555 0177', active: true, joinedAt: ago(24 * 540) },
  { id: 'u-stf-3', name: 'Ravi Iyer', email: 'ravi@campus.edu', role: 'STAFF', department: 'Electrical', phone: '+1 555 0119', active: true, joinedAt: ago(24 * 410) },
  { id: 'u-stf-4', name: 'Hannah Weber', email: 'hannah@campus.edu', role: 'STAFF', department: 'Housekeeping', phone: '+1 555 0163', active: true, joinedAt: ago(24 * 280) },
  { id: 'u-adm-1', name: 'Dr. Elena Ross', email: 'admin@campus.edu', role: 'ADMIN', department: 'Campus Operations', active: true, joinedAt: ago(24 * 900) },
]

type Seed = {
  title: string
  description: string
  category: Category
  priority: Priority
  status: RequestStatus
  building: string
  room?: string
  by: string
  to?: string
  age: number // hours since creation
  resolution?: string
  rating?: number
}

const seeds: Seed[] = [
  { title: 'Wi-Fi drops every few minutes on 3rd floor', description: 'The eduroam connection keeps disconnecting near the study pods on the 3rd floor. It has been happening since Monday and makes online quizzes impossible.', category: 'IT', priority: 'HIGH', status: 'IN_PROGRESS', building: 'Central Library', room: 'Floor 3 – Study Pods', by: 'u-stu-1', to: 'u-stf-2', age: 30 },
  { title: 'Leaking pipe under washroom sink', description: 'Water is pooling under the second sink in the ground floor washroom. The floor is slippery and someone could fall.', category: 'PLUMBING', priority: 'URGENT', status: 'ASSIGNED', building: 'Ada Lovelace Hostel', room: 'Block B – G Washroom', by: 'u-stu-1', to: 'u-stf-1', age: 3 },
  { title: 'Projector flickering in lecture hall', description: 'The ceiling projector in LH-2 flickers and turns off every 10–15 minutes during lectures. HDMI and VGA both affected.', category: 'IT', priority: 'MEDIUM', status: 'RESOLVED', building: 'Turing Hall (CS)', room: 'LH-2', by: 'u-stu-1', to: 'u-stf-2', age: 96, resolution: 'Replaced the overheating lamp module and cleaned the intake filter. Ran a 2-hour burn-in test with no flicker.', rating: 5 },
  { title: 'Room light fixture not working', description: 'The main tube light in my room stopped working. I already replaced the starter, still nothing.', category: 'ELECTRICAL', priority: 'LOW', status: 'CLOSED', building: 'Ada Lovelace Hostel', room: 'A-214', by: 'u-stu-1', to: 'u-stf-3', age: 340, resolution: 'Faulty ballast replaced with LED panel. Tested and handed over.', rating: 4 },
  { title: 'Request deep cleaning of common room', description: 'Common room carpet has food stains after the hackathon weekend. Requesting a deep clean before parents visit on Friday.', category: 'CLEANING', priority: 'MEDIUM', status: 'OPEN', building: 'Ada Lovelace Hostel', room: 'Common Room', by: 'u-stu-1', age: 5 },
  { title: 'Access card not opening lab door', description: 'My ID card stopped working on the Robotics Lab door after the semester rollover. Other doors work fine.', category: 'SECURITY', priority: 'HIGH', status: 'OPEN', building: 'Engineering Workshop', room: 'Robotics Lab', by: 'u-stu-2', age: 2 },
  { title: 'Broken chair in reading room', description: 'One of the chairs at table 14 has a cracked leg. Tagged it with a sticky note so no one sits on it.', category: 'MAINTENANCE', priority: 'LOW', status: 'OPEN', building: 'Central Library', room: 'Reading Room – Table 14', by: 'u-stu-3', age: 20 },
  { title: 'Power outage in Lab 4', description: 'Half of the sockets in Lab 4 have no power. Breaker panel looks fine from outside. 20 PCs affected before our practical exam.', category: 'ELECTRICAL', priority: 'URGENT', status: 'IN_PROGRESS', building: 'Turing Hall (CS)', room: 'Lab 4', by: 'u-stu-2', to: 'u-stf-3', age: 6 },
  { title: 'Washing machine stuck mid-cycle', description: 'Machine #3 in the laundry room is stuck with water inside and the door locked.', category: 'HOSTEL', priority: 'MEDIUM', status: 'ASSIGNED', building: 'Raman Hostel', room: 'Laundry Room', by: 'u-stu-2', to: 'u-stf-1', age: 14 },
  { title: 'Lab PC cannot log in to student account', description: 'PC-17 shows "trust relationship failed" when logging in with student credentials.', category: 'IT', priority: 'MEDIUM', status: 'RESOLVED', building: 'Curie Science Block', room: 'Bio Computing Lab', by: 'u-stu-3', to: 'u-stf-2', age: 50, resolution: 'Re-joined PC-17 to the domain and refreshed group policies.', rating: 5 },
  { title: 'Water cooler not dispensing cold water', description: 'The cooler near the gym entrance only gives room temperature water.', category: 'PLUMBING', priority: 'LOW', status: 'IN_PROGRESS', building: 'Sports Complex', room: 'Gym Entrance', by: 'u-stu-3', to: 'u-stf-1', age: 44 },
  { title: 'Spill near cafeteria counter', description: 'Large juice spill near the billing counter — sticky and slippery.', category: 'CLEANING', priority: 'HIGH', status: 'CLOSED', building: 'Main Cafeteria', by: 'u-stu-2', to: 'u-stf-4', age: 120, resolution: 'Area mopped and dried; wet-floor sign placed for 30 minutes.', rating: 5 },
  { title: 'Window latch broken, cannot close', description: 'Window latch in my room is broken and rain gets in at night.', category: 'MAINTENANCE', priority: 'HIGH', status: 'ASSIGNED', building: 'Raman Hostel', room: 'R-108', by: 'u-stu-3', to: 'u-stf-1', age: 9 },
  { title: 'Smart board pen not calibrating', description: 'The touch input on the smart board is offset by several centimeters.', category: 'IT', priority: 'LOW', status: 'OPEN', building: 'Curie Science Block', room: 'Seminar Room 1', by: 'u-stu-3', age: 28 },
  { title: 'Sparking socket near bed', description: 'The wall socket near my bed sparked when I plugged in my laptop charger. Not using it now.', category: 'ELECTRICAL', priority: 'URGENT', status: 'OPEN', building: 'Ada Lovelace Hostel', room: 'A-305', by: 'u-stu-4', age: 1 },
  { title: 'CCTV camera offline at parking', description: 'Security desk reports the camera covering bike parking row C has been offline since yesterday.', category: 'SECURITY', priority: 'MEDIUM', status: 'IN_PROGRESS', building: 'Student Union', room: 'Bike Parking C', by: 'u-stu-2', to: 'u-stf-2', age: 26 },
  { title: 'Mess food tray return jammed', description: 'The tray conveyor in the mess hall stops every few minutes.', category: 'HOSTEL', priority: 'MEDIUM', status: 'RESOLVED', building: 'Main Cafeteria', by: 'u-stu-1', to: 'u-stf-1', age: 70, resolution: 'Realigned conveyor belt and replaced worn roller bearing.' },
  { title: 'Restroom out of supplies', description: 'No soap or paper towels in the first floor restroom since this morning.', category: 'CLEANING', priority: 'MEDIUM', status: 'ASSIGNED', building: 'Admin Building', room: 'Floor 1 Restroom', by: 'u-stu-3', to: 'u-stf-4', age: 4 },
  { title: 'Treadmill belt slipping', description: 'Treadmill #2 belt slips under load, feels unsafe at higher speeds.', category: 'MAINTENANCE', priority: 'MEDIUM', status: 'CLOSED', building: 'Sports Complex', room: 'Cardio Zone', by: 'u-stu-2', to: 'u-stf-1', age: 260, resolution: 'Belt tension adjusted and lubricated. Safety tested up to 16 km/h.', rating: 4 },
  { title: 'Printer queue stuck for library printers', description: 'Print jobs submitted from the student portal stay in "pending" forever.', category: 'IT', priority: 'HIGH', status: 'OPEN', building: 'Central Library', room: 'Print Station', by: 'u-stu-1', age: 0.5 },
  { title: 'AC making loud rattling noise', description: 'The AC unit in classroom 204 rattles loudly — hard to hear the lecturer.', category: 'ELECTRICAL', priority: 'MEDIUM', status: 'RESOLVED', building: 'Turing Hall (CS)', room: 'Room 204', by: 'u-stu-2', to: 'u-stf-3', age: 80, resolution: 'Secured loose fan housing and replaced damaged mounting bushes.' },
  { title: 'Pest sighting in pantry', description: 'Saw cockroaches in the floor pantry near the microwave.', category: 'HOSTEL', priority: 'HIGH', status: 'IN_PROGRESS', building: 'Raman Hostel', room: 'Floor 2 Pantry', by: 'u-stu-3', to: 'u-stf-4', age: 18 },
]

const ACTOR_NOTES: Partial<Record<RequestStatus, string>> = {
  ASSIGNED: 'Assigned to technician',
  IN_PROGRESS: 'Technician on site and working on the issue',
  RESOLVED: 'Marked as resolved',
  CLOSED: 'Closed after confirmation',
}

function buildActivity(s: Seed, id: string, created: number): Activity[] {
  const steps = STATUS_FLOW.slice(0, STATUS_FLOW.indexOf(s.status) + 1)
  const span = Math.max(s.age * 0.85, 0.2)
  const out: Activity[] = [
    { id: `${id}-a0`, type: 'CREATED', actorId: s.by, message: 'Request submitted', status: 'OPEN', at: new Date(created).toISOString() },
  ]
  steps.slice(1).forEach((st, i) => {
    const at = new Date(created + ((i + 1) / steps.length) * span * HOUR).toISOString()
    const actor = st === 'ASSIGNED' ? 'u-adm-1' : st === 'CLOSED' ? s.by : (s.to ?? 'u-adm-1')
    out.push({
      id: `${id}-a${i + 1}`,
      type: st === 'ASSIGNED' ? 'ASSIGNED' : st === 'RESOLVED' ? 'RESOLVED' : 'STATUS_CHANGED',
      actorId: actor,
      message: ACTOR_NOTES[st] ?? '',
      status: st,
      at,
    })
    if (st === 'IN_PROGRESS') {
      out.push({
        id: `${id}-c${i}`,
        type: 'COMMENT',
        actorId: s.to ?? 'u-adm-1',
        message: 'Inspected the issue — parts identified, fix underway. Will update shortly.',
        at: new Date(created + ((i + 1.4) / steps.length) * span * HOUR).toISOString(),
      })
    }
  })
  return out
}

export const seedRequests: ServiceRequest[] = seeds.map((s, i) => {
  const id = `req-${1001 + i}`
  const created = Date.now() - s.age * HOUR
  const activity = buildActivity(s, id, created)
  const last = activity[activity.length - 1]
  const resolvedEvt = activity.find((a) => a.status === 'RESOLVED')
  const slaHours = { LOW: 120, MEDIUM: 72, HIGH: 24, URGENT: 4 }[s.priority]
  return {
    id,
    ticketNo: `CC-${(2400 + i * 7).toString()}`,
    title: s.title,
    description: s.description,
    category: s.category,
    priority: s.priority,
    status: s.status,
    location: { building: s.building, room: s.room },
    createdBy: s.by,
    assignedTo: s.to,
    createdAt: new Date(created).toISOString(),
    updatedAt: last.at,
    dueAt: new Date(created + slaHours * HOUR).toISOString(),
    resolution:
      s.resolution && resolvedEvt
        ? { summary: s.resolution, resolvedBy: s.to ?? 'u-adm-1', resolvedAt: resolvedEvt.at, rating: s.rating }
        : undefined,
    activity,
  }
})

// Monthly volume for the admin trend chart (last 6 months).
export const monthlyVolume = {
  labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  created: [142, 118, 96, 171, 228, 196],
  resolved: [131, 120, 99, 152, 214, 181],
}
