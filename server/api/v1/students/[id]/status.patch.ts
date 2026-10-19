import { dbQuery } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Student ID is required' })
  }

  const body = await readBody(event)
  const { status } = body || {}
  if (!status) {
    throw createError({ statusCode: 400, statusMessage: 'Status value is required' })
  }

  const updated = dbQuery.updateStudentStatus(id, status)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Student not found' })
  }

  return {
    success: true,
    message: `Student status changed to ${status}`,
    data: updated
  }
})
