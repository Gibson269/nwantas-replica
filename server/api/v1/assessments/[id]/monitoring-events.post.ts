import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const assessmentId = getRouterParam(event, 'id') || 'asm-cbt-01'
  const body = await readBody(event)
  const { studentId, studentName, eventType, details } = body || {}

  const newLog = database.recordAntiCheatEvent({
    assessmentId,
    studentId: studentId || 'usr-stud-01',
    studentName: studentName || 'Candidate Student',
    eventType: eventType || 'tab_switch',
    details: details || 'Window blur detected during active exam session'
  })

  return {
    success: true,
    data: newLog
  }
})

