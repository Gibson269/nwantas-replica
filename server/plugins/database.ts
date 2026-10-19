import { getDatabase } from '~~/server/database/connection'

export default defineNitroPlugin(() => {
  try {
    const db = getDatabase()
    const tenantsRow = db.prepare('SELECT count(*) as count FROM tenants').get() as { count: number }
    const studentsRow = db.prepare('SELECT count(*) as count FROM students').get() as { count: number }
    const classesRow = db.prepare('SELECT count(*) as count FROM classes').get() as { count: number }

    console.log(
      `[Nwantas Enterprise Engine] SQLite persistent database connected successfully at .data/nwantas.db ` +
      `(${tenantsRow.count} institutions, ${classesRow.count} class arms, ${studentsRow.count} students). WAL mode active.`
    )
  } catch (err) {
    console.error('[Nwantas Enterprise Engine] Database initialization error:', err)
  }
})
