import { database } from '~~/server/database'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const classArmId = query.classArmId as string | undefined
  const subjectName = query.subjectName as string | undefined

  const entries = database.getGradebook('apex-academy', classArmId, subjectName)

  return {
    data: entries,
    total: entries.length
  }
})
