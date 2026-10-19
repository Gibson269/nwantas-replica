import { database } from '~~/server/database'

export default defineEventHandler(() => {
  const data = database.getAssessments()
  return {
    data,
    total: data.length
  }
})


