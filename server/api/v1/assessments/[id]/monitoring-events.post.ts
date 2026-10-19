import { db, type AntiCheatEventRecord } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const assessmentId = getRouterParam(event, 'id') || 'asm-cbt-01'
  const body = await readBody(event)
  const { studentId, studentName, eventType, details } = body || {}

  const newLog: AntiCheatEventRecord = {
    id: `ace-${Date.now()}`,
    assessmentId,
    studentId: studentId || 'usr-stud-01',
    studentName: studentName || 'Chidi Okonkwo',
    eventType: eventType || 'tab_switch',
    details: details || 'Window blur detected during active exam session',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }

  db.antiCheatEvents.unshift(newLog)

  return {
    success: true,
    data: newLog
  }
})
