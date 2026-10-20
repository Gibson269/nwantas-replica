import { database } from '~~/server/database'

export default defineEventHandler((event) => {
  const studentId = getRouterParam(event, 'studentId')
  if (!studentId) {
    throw createError({ statusCode: 400, statusMessage: 'Student ID is required' })
  }

  const query = getQuery(event)
  const term = (query.term as string) || 'Second Term'
  const session = (query.session as string) || '2026/2027'

  const reportCard = database.getStudentTermReport(studentId, term, session)
  if (!reportCard) {
    throw createError({ statusCode: 404, statusMessage: `Student ${studentId} not found or has no term records.` })
  }

  return reportCard
})
