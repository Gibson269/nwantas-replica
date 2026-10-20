import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.studentId || !body.subjectName || !body.classArmId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Student ID, Subject Name, and Class Arm ID are required.'
    })
  }

  const updatedEntry = database.upsertGradebookEntry(body)

  return {
    success: true,
    data: updatedEntry
  }
})
