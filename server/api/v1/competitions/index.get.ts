import { db } from '~~/server/utils/db'

export default defineEventHandler(() => {
  return {
    data: db.competitions,
    total: db.competitions.length
  }
})

