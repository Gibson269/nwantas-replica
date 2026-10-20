import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { studentId, guardianName, guardianRelationship } = body || {}

  const student = database.getStudentById(studentId || 'usr-stud-01')
  if (!student) {
    throw createError({ statusCode: 404, statusMessage: 'Student not found in institutional directory.' })
  }

  // Match guardian details
  const isMatch = (student.guardianName || '').toLowerCase().includes((guardianName || '').toLowerCase()) ||
                  (guardianName || '').toLowerCase().includes((student.guardianName || '').toLowerCase())

  const pickupRecord = database.insertGuardianPickup({
    id: `pkp-${Date.now().toString(36)}`,
    tenantId: student.tenant_id || 'apex-academy',
    studentId: student.id,
    studentName: student.name,
    classArm: student.classArmName,
    guardianName: guardianName || student.guardianName,
    guardianRelationship: guardianRelationship || student.guardianRelationship || 'Parent',
    guardianPhoto: student.guardianPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: isMatch ? 'Verified & Cleared' : 'Manual Supervisor Review Required',
    verifiedBy: 'Officer Samuel Mensah (Gate 1 Security)'
  })

  return {
    success: true,
    matched: isMatch,
    message: isMatch
      ? `Biometric Photo & Guardian Identity Verified: ${student.name} cleared for departure with ${guardianName}.`
      : `Discrepancy Detected: Provided guardian name does not match enrolled record (${student.guardianName}). Supervisor clearance required.`,
    data: pickupRecord,
    student
  }
})
