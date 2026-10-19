import { db } from '~~/server/utils/db'

export default defineEventHandler(() => {
  return {
    data: db.classes,
    total: db.classes.length
  }
})

