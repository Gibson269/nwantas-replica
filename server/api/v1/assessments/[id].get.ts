import { db } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const assessment = db.assessments.find(a => a.id === id) || db.assessments[0]

  return {
    data: assessment
  }
})
