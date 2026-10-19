import { dbQuery } from '~~/server/database'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Student ID is required' })
  }

  const res = dbQuery.deleteStudent(id)
  if (!res) {
    throw createError({ statusCode: 404, statusMessage: 'Student record not found' })
  }

  return {
    success: true,
    message: 'Student record removed successfully and class enrollment updated',
    data: res
  }
})
