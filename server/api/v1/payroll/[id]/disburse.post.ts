import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Payroll run ID is required.' })
  }

  const body = await readBody(event).catch(() => ({}))
  const approver = body?.approver || 'Chief Anthony Balogun (Owner)'

  const disbursed = database.disbursePayroll(id, approver)
  if (!disbursed) {
    throw createError({ statusCode: 404, statusMessage: `Payroll run ${id} not found.` })
  }

  return {
    success: true,
    message: 'Staff payroll successfully authorized and disbursed.',
    data: disbursed
  }
})
