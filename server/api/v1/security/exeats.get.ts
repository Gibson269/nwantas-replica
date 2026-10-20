import { database } from '~~/server/database'

export default defineEventHandler(() => {
  const exeats = database.getExeats('apex-academy')
  return {
    data: exeats,
    total: exeats.length
  }
})
