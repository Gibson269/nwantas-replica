import { db } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const studentId = getRouterParam(event, 'studentId')
  const student = db.students.find(s => s.id === studentId) || db.students[0]
  const school = db.schools[0]

  const subjects = [
    { subject: 'Mathematics', ca: 19, midterm: 18, exam: 56, total: 93, grade: 'A1', remarks: 'Exceptional computational speed and reasoning.' },
    { subject: 'English Language', ca: 17, midterm: 18, exam: 50, total: 85, grade: 'A1', remarks: 'Very expressive vocabulary and essay structure.' },
    { subject: 'Physics', ca: 19, midterm: 18, exam: 54, total: 91, grade: 'A1', remarks: 'Strong theoretical insight and practical dexterity.' },
    { subject: 'Chemistry', ca: 18, midterm: 17, exam: 52, total: 87, grade: 'A1', remarks: 'Mastery of chemical equations and stoichiometry.' },
    { subject: 'Biology', ca: 18, midterm: 16, exam: 53, total: 87, grade: 'A1', remarks: 'Accurate biological diagrams and clear deductions.' },
    { subject: 'Further Mathematics', ca: 19, midterm: 19, exam: 55, total: 93, grade: 'A1', remarks: 'Outstanding analytical proofs and calculus mastery.' }
  ]

  const totalPoints = subjects.reduce((sum, s) => sum + s.total, 0)
  const average = (totalPoints / subjects.length).toFixed(1)

  return {
    reportId: `TR-${student.admissionNo}-2026-T2`,
    school: {
      name: school.name,
      address: school.address,
      motto: school.motto,
      phone: school.phone,
      email: school.email
    },
    student: {
      id: student.id,
      name: student.name,
      admissionNo: student.admissionNo,
      classArm: student.classArmName,
      attendanceRate: `${student.attendanceRate}%`,
      timesSchoolOpened: 110,
      timesPresent: 108
    },
    termInfo: {
      session: '2025/2026 Academic Session',
      term: 'Second Term (Lent Term)',
      nextTermBegins: 'Monday, 27th April 2026'
    },
    subjects,
    summary: {
      totalScore: totalPoints,
      maxPossibleScore: subjects.length * 100,
      average: `${average}%`,
      classPosition: '1st out of 28',
      overallGrade: 'Distinction (A1)',
      classTeacherRemark: 'Chidi is a diligent, focused, and intellectually curious young scholar. Highly recommended for the National Olympiad.',
      classTeacherSignature: 'Mr. David Adeleke',
      principalRemark: 'An exemplary academic report card. Consistently demonstrates academic leadership and good character.',
      principalSignature: 'Dr. Chukwuemeka Eze'
    }
  }
})
