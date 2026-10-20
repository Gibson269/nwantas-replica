import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Exeat ID is required.' })
  }

  const body = await readBody(event)
  if (!body.status) {
    throw createError({ statusCode: 400, statusMessage: 'Status is required.' })
  }

  const updated = database.updateExeatStatus(id, body.status, body.actualReturn)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: `Exeat ${id} not found.` })
  }

  return {
    success: true,
    data: updated
  }
})
