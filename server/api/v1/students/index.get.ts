import { dbQuery } from '~~/server/database'

export default defineEventHandler((event) => {
  const tenantId = (getHeader(event, 'x-tenant-id') as string) || 'apex-academy'
  const query = getQuery(event)
  const classArmId = query.classArmId as string | undefined
  const search = ((query.search as string) || '').trim().toLowerCase()
  const status = query.status as string | undefined
  const feeStatus = query.feeStatus as string | undefined
  const gender = query.gender as string | undefined

  let list = dbQuery.getStudents(tenantId, classArmId)

  // Search filter
  if (search) {
    list = list.filter(s =>
      s.name.toLowerCase().includes(search) ||
      s.admissionNo.toLowerCase().includes(search) ||
      s.guardianName.toLowerCase().includes(search)
    )
  }

  // Status filter
  if (status) {
    list = list.filter(s => s.status.toLowerCase() === status.toLowerCase())
  }

  // Fee status filter
  if (feeStatus) {
    list = list.filter(s => s.feeStatus.toLowerCase() === feeStatus.toLowerCase())
  }

  // Gender filter
  if (gender) {
    list = list.filter(s => s.gender.toLowerCase() === gender.toLowerCase())
  }

  // Compute aggregate stats across tenant
  const allStudents = dbQuery.getStudents(tenantId)
  const stats = {
    total: allStudents.length,
    active: allStudents.filter(s => s.status === 'Active').length,
    male: allStudents.filter(s => s.gender === 'Male').length,
    female: allStudents.filter(s => s.gender === 'Female').length,
    boarders: allStudents.filter(s => Boolean(s.hostelInfo)).length,
    feeCompliant: allStudents.filter(s => s.feeStatus === 'Paid in Full').length
  }

  return {
    data: list,
    total: list.length,
    stats
  }
})
