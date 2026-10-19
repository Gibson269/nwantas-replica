import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, role } = body || {}

  const school = db.schools[0]

  return {
    status: 'success',
    token: `jwt-${Date.now()}-mock-nwantas`,
    user: {
      id: `usr-${role || 'admin'}-01`,
      email: email || 'user@apexacademy.edu.ng',
      role: role || 'admin',
      schoolId: school.id,
      schoolName: school.name
    },
    school
  }
})

