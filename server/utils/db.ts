import { dbQuery } from '~~/server/database'

export interface SchoolRecord {
  id: string
  name: string
  slug: string
  motto: string
  currency: 'NGN' | 'GBP' | 'USD'
  symbol: string
  address: string
  country: string
  email: string
  phone: string
  planId: string
  totalEnrolled: number
  totalStaff: number
  walletBalance: number
}

export interface ClassArmRecord {
  id: string
  level: string
  arm: string
  displayName: string
  formTeacher: string
  studentCount: number
  capacity: number
  subjects: string[]
}

export interface StudentRecord {
  id: string
  schoolId: string
  name: string
  admissionNo: string
  classArmId: string
  classArmName: string
  gender: 'Male' | 'Female'
  dateOfBirth: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  guardianRelationship: string
  guardianPhoto: string
  avatar: string
  status: 'Active' | 'Suspended' | 'Graduated'
  attendanceRate: number
  feeStatus: 'Paid in Full' | 'Partial' | 'Unpaid'
  feeAmountDue: number
  hostelInfo?: {
    building: string
    room: string
    bed: string
  }
}

export interface LessonNoteRecord {
  id: string
  schoolId: string
  subject: string
  topic: string
  classLevel: string
  term: string
  week: number
  author: string
  authorRole: string
  status: 'Draft' | 'Submitted' | 'HOD Approved' | 'Principal Approved'
  objectives: string[]
  prerequisites: string
  materials: string[]
  contentSections: { title: string; body: string }[]
  assessmentQuestions: string[]
  comments: { id: string; author: string; role: string; text: string; date: string }[]
  createdAt: string
  updatedAt: string
}

export interface CBTQuestion {
  id: string
  questionText: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface AssessmentRecord {
  id: string
  schoolId: string
  title: string
  type: 'CBT Exam' | 'Midterm Test' | 'Continuous Assessment' | 'Practice Quiz'
  subject: string
  classLevel: string
  durationMinutes: number
  totalMarks: number
  instructions: string
  antiCheatEnabled: boolean
  isPublished: boolean
  questions: CBTQuestion[]
  submissionsCount: number
  averageScore?: number
}

export interface AntiCheatEventRecord {
  id: string
  assessmentId: string
  studentId: string
  studentName: string
  eventType: 'tab_switch' | 'window_blur' | 'copy_paste_attempt' | 'fullscreen_exit'
  details: string
  timestamp: string
}

export interface GradeEntry {
  studentId: string
  studentName: string
  admissionNo: string
  caScore: number
  midtermScore: number
  examScore: number
  totalScore: number
  letterGrade: string
  gpa: number
  position: number
  teacherRemarks: string
  principalRemarks: string
}

export interface ExeatRecord {
  id: string
  schoolId: string
  studentId: string
  studentName: string
  classArm: string
  type: 'Medical' | 'Weekend Exeat' | 'Emergency' | 'Day Pass'
  departureTime: string
  expectedReturn: string
  actualReturn?: string
  status: 'Pending' | 'Approved' | 'Departed' | 'Returned' | 'Overdue'
  approvedBy: string
  guardianPickupName: string
}

export interface PickupRecord {
  id: string
  schoolId: string
  studentId: string
  studentName: string
  classArm: string
  guardianName: string
  guardianRelationship: string
  guardianPhoto: string
  pickupDate: string
  status: 'Verified & Cleared' | 'Flagged'
  verifiedBy: string
}

export interface HostelBedRecord {
  id: string
  buildingName: string
  roomNumber: string
  bedCode: string
  status: 'Occupied' | 'Vacant' | 'Maintenance'
  studentName?: string
  studentId?: string
}

export interface GoChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderRole: string
  senderAvatar: string
  text: string
  timestamp: string
  reactions: Record<string, number>
}

// Helper to create SQLite-backed array proxy
function createSyncedArray<T extends object>(
  loadFn: () => T[],
  onInsert?: (item: T) => void
): T[] {
  let cache = loadFn()

  const handler: ProxyHandler<T[]> = {
    get(target, prop, receiver) {
      if (prop === 'unshift') {
        return function (...items: T[]) {
          for (const item of items) {
            if (onInsert) {
              try { onInsert(item) } catch (e) { console.error('SQLite insert error:', e) }
            }
          }
          return Array.prototype.unshift.apply(target, items)
        }
      }
      if (prop === 'push') {
        return function (...items: T[]) {
          for (const item of items) {
            if (onInsert) {
              try { onInsert(item) } catch (e) { console.error('SQLite insert error:', e) }
            }
          }
          return Array.prototype.push.apply(target, items)
        }
      }
      return Reflect.get(target, prop, receiver)
    }
  }

  return new Proxy(cache, handler)
}

// Live SQLite-backed database bridge
export const db = {
  get schools(): SchoolRecord[] {
    const tenants = dbQuery.getTenants()
    return tenants.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      motto: t.motto || '',
      currency: (t.currency || 'NGN') as any,
      symbol: t.symbol || '₦',
      address: t.address || '',
      country: t.country || 'Nigeria',
      email: t.email || '',
      phone: t.phone || '',
      planId: t.plan_id || 'school_plus',
      totalEnrolled: 1420,
      totalStaff: 86,
      walletBalance: t.wallet_balance || 0
    }))
  },

  get classes(): ClassArmRecord[] {
    return dbQuery.getClasses() as any[]
  },

  get students(): StudentRecord[] {
    const raw = dbQuery.getStudents()
    return raw.map(s => ({
      ...s,
      schoolId: s.tenant_id || 'apex-academy'
    })) as any[]
  },

  get lessonNotes(): LessonNoteRecord[] {
    return createSyncedArray<LessonNoteRecord>(
      () => dbQuery.getLessonNotes() as any[],
      (item) => dbQuery.insertLessonNote(item)
    )
  },

  get assessments(): AssessmentRecord[] {
    return dbQuery.getAssessments().map(a => ({
      ...a,
      schoolId: a.tenant_id || 'apex-academy'
    })) as any[]
  },

  get antiCheatEvents(): AntiCheatEventRecord[] {
    return createSyncedArray<AntiCheatEventRecord>(
      () => dbQuery.getAntiCheatEvents() as any[],
      (item) => dbQuery.recordAntiCheatEvent(item)
    )
  },

  get gradebook(): GradeEntry[] {
    return dbQuery.getGradebook() as any[]
  },

  get exeats(): ExeatRecord[] {
    return createSyncedArray<ExeatRecord>(
      () => dbQuery.getExeats() as any[],
      (item) => dbQuery.insertExeat(item)
    )
  },

  get pickups(): PickupRecord[] {
    return createSyncedArray<PickupRecord>(
      () => dbQuery.getGuardianPickups() as any[],
      (item) => dbQuery.insertGuardianPickup(item)
    )
  },

  get hostelBeds(): HostelBedRecord[] {
    return dbQuery.getHostelBuildings().beds as any[]
  },

  get hostelBuildings() {
    return dbQuery.getHostelBuildings().buildings
  },

  get chatRooms() {
    return dbQuery.getChatRooms()
  },

  get chatMessages(): GoChatMessage[] {
    return createSyncedArray<GoChatMessage>(
      () => dbQuery.getChatMessages('rm-staff-general') as any[],
      (item) => dbQuery.insertChatMessage(item)
    )
  },

  get governmentCompliance() {
    return dbQuery.getGovernmentCompliance()
  },

  get admissionCycles() {
    return dbQuery.getAdmissions().cycles
  },

  get admissionApplications() {
    return dbQuery.getAdmissions().applications
  },

  get pastQuestions() {
    return dbQuery.getPastQuestions()
  },

  get competitions() {
    return dbQuery.getCompetitions()
  }
}
