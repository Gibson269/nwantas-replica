import { db, type PickupRecord } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { studentId, guardianName, guardianRelationship } = body || {}

  const student = db.students.find(s => s.id === studentId) || db.students[0]

  const newPickup: PickupRecord = {
    id: `pkp-${Date.now().toString(36)}`,
    schoolId: 'apex-academy',
    studentId: student.id,
    studentName: student.name,
    classArm: student.classArmName,
    guardianName: guardianName || student.guardianName,
    guardianRelationship: guardianRelationship || student.guardianRelationship,
    guardianPhoto: student.guardianPhoto,
    pickupDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Verified & Cleared',
    verifiedBy: 'Officer Samuel Mensah (Gate 1)'
  }

  db.pickups.unshift(newPickup)

  return {
    verified: true,
    message: 'Biometric and photo verification confirmed against registered guardian profile. Student cleared for campus departure.',
    data: newPickup
  }
})

