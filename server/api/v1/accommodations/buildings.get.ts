import { database } from '~~/server/database'

export default defineEventHandler(() => {
  return database.getHostelBuildings('apex-academy')
})
