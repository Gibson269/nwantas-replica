import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.month) {
    throw createError({ statusCode: 400, statusMessage: 'Month is required for payroll batch run.' })
  }

  const newRun = database.createPayrollRun(body)
  return {
    success: true,
    data: newRun
  }
})
