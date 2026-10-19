import { dbQuery } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Student ID is required' })
  }

  const body = await readBody(event)
  const updated = dbQuery.updateStudent(id, body)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Student record not found' })
  }

  return {
    success: true,
    message: 'Student record updated successfully',
    data: updated
  }
})
