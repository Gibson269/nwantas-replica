import { dbQuery } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const tenantId = (getHeader(event, 'x-tenant-id') as string) || 'apex-academy'
  const { level, arm, displayName, formTeacher, capacity, subjects } = body || {}

  if (!level || !arm) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Class level (e.g. JSS 1) and arm (e.g. Gold) are required'
    })
  }

  const newClass = dbQuery.insertClass({
    tenantId,
    level,
    arm,
    displayName: displayName || `${level} ${arm}`,
    formTeacher: formTeacher || 'Unassigned',
    capacity: capacity ? Number(capacity) : 35,
    subjects: subjects || ['Mathematics', 'English Language', 'Basic Science']
  })

  return {
    success: true,
    data: newClass
  }
})
