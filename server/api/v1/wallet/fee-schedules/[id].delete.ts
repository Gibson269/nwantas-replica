import { database } from '~~/server/database'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Fee schedule ID is required.' })
  }

  const result = database.deleteFeeSchedule(id)
  return {
    success: true,
    data: result
  }
})
