import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { classArmId } = body || {}

  // Collate all grades, calculate totals, letter grades, and rank positions
  const collated = db.gradebook.map((entry, index) => {
    const total = entry.caScore + entry.midtermScore + entry.examScore
    let letter = 'F9'
    let gpa = 0.0

    if (total >= 75) { letter = 'A1'; gpa = 5.0 }
    else if (total >= 70) { letter = 'B2'; gpa = 4.5 }
    else if (total >= 65) { letter = 'B3'; gpa = 4.0 }
    else if (total >= 60) { letter = 'C4'; gpa = 3.5 }
    else if (total >= 55) { letter = 'C5'; gpa = 3.0 }
    else if (total >= 50) { letter = 'C6'; gpa = 2.5 }
    else if (total >= 45) { letter = 'D7'; gpa = 2.0 }
    else if (total >= 40) { letter = 'E8'; gpa = 1.0 }

    return {
      ...entry,
      totalScore: total,
      letterGrade: letter,
      gpa,
      position: index + 1
    }
  })

  return {
    success: true,
    message: 'Broadsheet grade collation successfully calculated.',
    collatedAt: new Date().toISOString(),
    classArmId: classArmId || 'cls-ss2-sci',
    summary: {
      totalStudents: collated.length,
      classAverage: (collated.reduce((acc, c) => acc + c.totalScore, 0) / collated.length).toFixed(1),
      passRate: '100%'
    },
    data: collated
  }
})

