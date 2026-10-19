import { resetDatabase } from '../server/database/connection.ts'

console.log('[Nwantas DB CLI] Resetting SQLite database at .data/nwantas.db...')
const db = resetDatabase()

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[]
console.log(`[Nwantas DB CLI] Successfully re-created and seeded database. Found ${tables.length} tables:`)
tables.forEach((t, i) => {
  const count = (db.prepare(`SELECT count(*) as c FROM ${t.name}`).get() as { c: number }).c
  console.log(`  ${i + 1}. ${t.name.padEnd(25)} -> ${count} records`)
})

console.log('[Nwantas DB CLI] Reset complete. Fresh state ready.')
