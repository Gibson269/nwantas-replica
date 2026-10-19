import { dbQuery } from '~~/server/database'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Class ID is required' })
  }

  try {
    const res = dbQuery.deleteClass(id)
    return {
      success: true,
      message: 'Class arm deleted successfully',
      data: res
    }
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: err.message || 'Failed to delete class arm'
    })
  }
})
