import { dbQuery } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Lesson note ID is required' })
  }

  const body = await readBody(event)
  const { author, role, text } = body || {}

  if (!text || !text.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Comment text cannot be empty' })
  }

  const newComment = dbQuery.addLessonNoteComment(id, {
    author: author || 'Faculty Reviewer',
    role: role || 'Teacher',
    text: text.trim(),
    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
  })

  if (!newComment) {
    throw createError({ statusCode: 404, statusMessage: 'Lesson note not found' })
  }

  return {
    success: true,
    data: newComment
  }
})
