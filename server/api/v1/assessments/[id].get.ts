import { database } from '~~/server/database'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Assessment ID is required' })
  }

  const assessment = database.getAssessmentById(id)
  if (!assessment) {
    throw createError({ statusCode: 404, statusMessage: `Assessment ${id} not found` })
  }

  return {
    data: assessment
  }
})

