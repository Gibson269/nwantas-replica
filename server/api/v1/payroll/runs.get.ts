import { database } from '~~/server/database'

export default defineEventHandler(() => {
  const runs = database.getPayrollRuns('apex-academy')
  return {
    runs,
    total: runs.length
  }
})
