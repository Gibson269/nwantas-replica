import { database } from '~~/server/database'

export default defineEventHandler(() => {
  const pickups = database.getGuardianPickups('apex-academy')
  return {
    data: pickups,
    total: pickups.length
  }
})
