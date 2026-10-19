import { db } from '~~/server/utils/db'

export default defineEventHandler(() => {
  return {
    data: db.chatRooms
  }
})

