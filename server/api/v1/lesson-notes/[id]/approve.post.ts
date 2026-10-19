import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { approver, role, nextStatus } = body || {}

  const note = db.lessonNotes.find(n => n.id === id)
  if (!note) {
    throw createError({ statusCode: 404, statusMessage: 'Lesson note not found' })
  }

  note.status = nextStatus || (note.status === 'Draft' ? 'HOD Approved' : 'Principal Approved')
  note.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16)
  note.comments.push({
    id: `c-${Date.now()}`,
    author: approver || 'Principal',
    role: role || 'Principal',
    text: `Endorsed and approved as ready for academic delivery. Status updated to ${note.status}.`,
    date: note.updatedAt
  })

  return {
    success: true,
    data: note
  }
})
