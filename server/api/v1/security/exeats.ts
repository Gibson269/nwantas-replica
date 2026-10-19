import { db, type ExeatRecord } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  if (event.node.req.method === 'POST') {
    return handlePost(event)
  }

  return {
    data: db.exeats,
    total: db.exeats.length
  }
})

async function handlePost(event: any) {
  const body = await readBody(event)
  const { studentName, classArm, type, expectedReturn, guardianPickupName } = body || {}

  const newExeat: ExeatRecord = {
    id: `ext-${Date.now().toString(36)}`,
    schoolId: 'apex-academy',
    studentId: 'usr-stud-01',
    studentName: studentName || 'Chidi Okonkwo',
    classArm: classArm || 'SS 2 Science',
    type: type || 'Weekend Exeat',
    departureTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
    expectedReturn: expectedReturn || '2026-10-21 17:00',
    status: 'Approved',
    approvedBy: 'Campus Gate Control',
    guardianPickupName: guardianPickupName || 'Dr. Kenneth Okonkwo'
  }

  db.exeats.unshift(newExeat)

  return {
    success: true,
    data: newExeat
  }
}

