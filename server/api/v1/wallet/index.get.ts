import { database } from '~~/server/database'

export default defineEventHandler(() => {
  return database.getWalletData('apex-academy')
})


