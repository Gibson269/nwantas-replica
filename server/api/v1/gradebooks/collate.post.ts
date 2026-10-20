import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { classArmId, subjectName } = body || {}

  const result = database.collateGradebook(
    'apex-academy',
    classArmId || 'cls-ss2-sci',
    subjectName || 'Physics'
  )

  return result
})


