import { dbQuery } from '~~/server/database'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Lesson note ID is required' })
  }

  const res = dbQuery.deleteLessonNote(id)
  return {
    success: true,
    message: 'Lesson note removed successfully',
    data: res
  }
})
