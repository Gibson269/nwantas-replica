import { db } from '~~/server/utils/db'

export default defineEventHandler(() => {
  return {
    buildings: [
      {
        id: 'bld-01',
        name: 'Nelson Mandela Hall (Boys Senior Boarding)',
        warden: 'Mr. Jude Okafor',
        totalRooms: 24,
        totalBeds: 96,
        occupiedBeds: 82,
        vacantBeds: 14
      },
      {
        id: 'bld-02',
        name: 'Queen Amina Hostel (Girls Senior Boarding)',
        warden: 'Mrs. Grace Danjuma',
        totalRooms: 24,
        totalBeds: 96,
        occupiedBeds: 88,
        vacantBeds: 8
      }
    ],
    beds: db.hostelBeds
  }
})

