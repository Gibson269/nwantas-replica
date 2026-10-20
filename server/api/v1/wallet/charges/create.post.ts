import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.studentName || !body.amount) {
    throw createError({ statusCode: 400, statusMessage: 'Student name and amount are required.' })
  }

  const token = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`
  const paymentUrl = `https://nwantas.com/payments/checkout/${token}`

  // If immediate settlement requested (e.g. simulate online card payment success)
  let transaction = null
  if (body.settleImmediately) {
    transaction = database.recordTransaction({
      studentName: body.studentName,
      type: body.type || 'Tuition Fee Payment',
      amount: Number(body.amount),
      channel: body.channel || 'Paystack Direct Debit'
    })
  }

  return {
    success: true,
    token,
    paymentUrl,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    transaction
  }
})
