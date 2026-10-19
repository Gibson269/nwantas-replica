import { database } from '~~/server/database'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const assessmentId = query.assessmentId as string | undefined

  const events = database.getAntiCheatEvents(assessmentId)

  return {
    data: events,
    total: events.length
  }
})
