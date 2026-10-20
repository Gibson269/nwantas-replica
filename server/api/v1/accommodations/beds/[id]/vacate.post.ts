import { database } from '~~/server/database'

export default defineEventHandler((event) => {
  const bedId = getRouterParam(event, 'id')
  if (!bedId) {
    throw createError({ statusCode: 400, statusMessage: 'Bed ID is required.' })
  }

  const vacated = database.vacateBed(bedId)
  if (!vacated) {
    throw createError({ statusCode: 404, statusMessage: `Bed ${bedId} not found.` })
  }

  return {
    success: true,
    data: vacated
  }
})
