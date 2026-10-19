import { db } from '~~/server/utils/db'

export default defineEventHandler(() => {
  return {
    data: db.lessonNotes,
    total: db.lessonNotes.length
  }
})

