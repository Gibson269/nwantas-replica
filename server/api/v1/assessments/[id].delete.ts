import { database } from '~~/server/database'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Assessment ID is required' })
  }

  const result = database.deleteAssessment(id)
  return {
    success: true,
    data: result
  }
})
