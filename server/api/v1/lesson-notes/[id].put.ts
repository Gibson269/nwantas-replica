import { dbQuery } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Lesson note ID is required' })
  }

  const body = await readBody(event)
  const updated = dbQuery.updateLessonNote(id, body)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Lesson note not found' })
  }

  return {
    success: true,
    message: 'Lesson note updated successfully',
    data: updated
  }
})
