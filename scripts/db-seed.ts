import { getDatabase, seedInitialData } from '../server/database/connection.ts'

console.log('[Nwantas DB CLI] Connecting to SQLite database...')
const db = getDatabase()

console.log('[Nwantas DB CLI] Running seedInitialData...')
seedInitialData(db)

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[]
console.log(`[Nwantas DB CLI] Successfully verified database at .data/nwantas.db. Found ${tables.length} tables:`)
tables.forEach((t, i) => {
  const count = (db.prepare(`SELECT count(*) as c FROM ${t.name}`).get() as { c: number }).c
  console.log(`  ${i + 1}. ${t.name.padEnd(25)} -> ${count} records`)
})

console.log('[Nwantas DB CLI] Database seeding & verification complete.')

