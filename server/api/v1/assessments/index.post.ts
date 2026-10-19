import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.title || !body.subject || !body.classLevel) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title, subject, and class level are mandatory fields.'
    })
  }

  const newAssessment = database.createAssessment({
    title: body.title,
    type: body.type || 'CBT Exam',
    subject: body.subject,
    classLevel: body.classLevel,
    durationMinutes: Number(body.durationMinutes) || 45,
    totalMarks: Number(body.totalMarks) || 40,
    instructions: body.instructions || 'Anti-cheat monitoring is active. Do not exit fullscreen or switch tabs.',
    antiCheatEnabled: body.antiCheatEnabled !== false,
    isPublished: body.isPublished !== false,
    questions: Array.isArray(body.questions) && body.questions.length > 0 ? body.questions : [
      {
        id: `q-${Date.now()}-1`,
        questionText: `Sample question for ${body.subject}: What is the fundamental concept of this unit?`,
        options: ['Option A: Foundational principle', 'Option B: Secondary phenomenon', 'Option C: Inverse coefficient', 'Option D: Null hypothesis'],
        correctIndex: 0,
        explanation: 'Option A provides the correct foundational principle according to the curriculum standard.'
      }
    ]
  })

  return {
    success: true,
    data: newAssessment
  }
})
