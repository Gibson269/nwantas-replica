import { db } from '~~/server/utils/db'

export default defineEventHandler(() => {
  return {
    data: db.assessments,
    total: db.assessments.length
  }
})

