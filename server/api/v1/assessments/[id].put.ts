import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Assessment ID is required' })
  }

  const body = await readBody(event)
  const updated = database.updateAssessment(id, body)

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: `Assessment ${id} not found` })
  }

  return {
    success: true,
    data: updated
  }
})
