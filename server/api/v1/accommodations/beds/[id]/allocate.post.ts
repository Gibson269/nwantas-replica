import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const bedId = getRouterParam(event, 'id')
  if (!bedId) {
    throw createError({ statusCode: 400, statusMessage: 'Bed ID is required.' })
  }

  const body = await readBody(event)
  if (!body.studentId || !body.studentName) {
    throw createError({ statusCode: 400, statusMessage: 'Student ID and Student Name are required.' })
  }

  const allocated = database.allocateBed(bedId, body.studentId, body.studentName)
  if (!allocated) {
    throw createError({ statusCode: 404, statusMessage: `Bed ${bedId} not found.` })
  }

  return {
    success: true,
    data: allocated
  }
})
