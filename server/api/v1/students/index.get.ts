import { db } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const classArmId = query.classArmId as string

  let list = db.students
  if (classArmId) {
    list = list.filter(s => s.classArmId === classArmId)
  }

  return {
    data: list,
    total: list.length
  }
})

