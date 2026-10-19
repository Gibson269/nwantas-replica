import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const assessmentId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { answers, studentId, studentName } = body || {}

  const assessment = db.assessments.find(a => a.id === assessmentId) || db.assessments[0]
  if (!assessment) {
    throw createError({ statusCode: 404, statusMessage: 'Assessment not found' })
  }

  let correctCount = 0
  const questionResults = assessment.questions.map(q => {
    const selected = answers?.[q.id]
    const isCorrect = selected === q.correctIndex
    if (isCorrect) correctCount++

    return {
      questionId: q.id,
      selected,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation
    }
  })

  const score = Math.round((correctCount / assessment.questions.length) * assessment.totalMarks)
  const percentage = Math.round((correctCount / assessment.questions.length) * 100)

  // Increment submissions
  assessment.submissionsCount += 1

  return {
    success: true,
    data: {
      assessmentId: assessment.id,
      studentId: studentId || 'usr-stud-01',
      studentName: studentName || 'Chidi Okonkwo',
      correctCount,
      totalQuestions: assessment.questions.length,
      score,
      totalMarks: assessment.totalMarks,
      percentage,
      passed: percentage >= 50,
      questionResults,
      submittedAt: new Date().toISOString()
    }
  }
})
