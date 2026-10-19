import { dbQuery } from '~~/server/database'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Student ID is required' })
  }

  const student = dbQuery.getStudentById(id)
  if (!student) {
    throw createError({ statusCode: 404, statusMessage: 'Student not found' })
  }

  return {
    success: true,
    data: student
  }
})
