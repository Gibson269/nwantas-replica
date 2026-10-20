import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.title || !body.amount) {
    throw createError({ statusCode: 400, statusMessage: 'Fee title and amount are required.' })
  }

  const newFee = database.createFeeSchedule('apex-academy', body)
  return {
    success: true,
    data: newFee
  }
})
