import { database } from '~~/server/database'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Event ID is required' })
  }

  const result = database.clearAntiCheatEvent(id)
  return {
    success: true,
    data: result
  }
})
