export default defineEventHandler((event) => {
  const query = getQuery(event)
  const assessmentId = query.assessmentId as string

  // Returns synchronized server time and remaining seconds (e.g. 45 mins = 2700s)
  const now = Date.now()
  const examDurationSeconds = 45 * 60

  return {
    serverTimestamp: now,
    assessmentId: assessmentId || 'asm-cbt-01',
    remainingSeconds: examDurationSeconds - 120, // simulate active exam with 43 minutes remaining
    isTimeUp: false
  }
})

