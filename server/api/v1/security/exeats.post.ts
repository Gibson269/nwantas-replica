import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.studentName || !body.type) {
    throw createError({ statusCode: 400, statusMessage: 'Student name and exeat type are required.' })
  }

  const newExeat = database.insertExeat(body)
  return {
    success: true,
    data: newExeat
  }
})
