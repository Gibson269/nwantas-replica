import { dbQuery } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Class ID is required' })
  }

  const body = await readBody(event)
  const updated = dbQuery.updateClass(id, body)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Class arm not found' })
  }

  return {
    success: true,
    data: updated
  }
})
