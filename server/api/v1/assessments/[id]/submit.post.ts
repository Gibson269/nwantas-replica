import { database } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const assessmentId = getRouterParam(event, 'id')
  if (!assessmentId) {
    throw createError({ statusCode: 400, statusMessage: 'Assessment ID is required' })
  }

  const body = await readBody(event)
  const { answers, studentId, studentName } = body || {}

  const assessment = database.getAssessmentById(assessmentId)
  if (!assessment) {
    throw createError({ statusCode: 404, statusMessage: 'Assessment not found' })
  }

  const questions = assessment.questions || []
  let correctCount = 0

  const questionResults = questions.map((q: any) => {
    const selected = answers?.[q.id]
    const isCorrect = selected === q.correctIndex
    if (isCorrect) correctCount++

    return {
      questionId: q.id,
      selected,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation || 'See textbook reference'
    }
  })

  const totalQuestions = questions.length || 1
  const score = Math.round((correctCount / totalQuestions) * assessment.totalMarks)
  const percentage = Math.round((correctCount / totalQuestions) * 100)
  const passed = percentage >= 50

  const submission = database.recordAssessmentSubmission({
    assessmentId: assessment.id,
    studentId: studentId || 'usr-stud-01',
    studentName: studentName || 'Chidi Okonkwo',
    score,
    totalMarks: assessment.totalMarks,
    percentage,
    passed,
    questionResults
  })

  return {
    success: true,
    data: {
      ...submission,
      correctCount,
      totalQuestions
    }
  }
})

