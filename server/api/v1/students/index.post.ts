import { dbQuery } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const tenantId = (getHeader(event, 'x-tenant-id') as string) || 'apex-academy'
  const body = await readBody(event)
  const {
    name,
    admissionNo,
    classArmId,
    classArmName,
    gender,
    dateOfBirth,
    guardianName,
    guardianPhone,
    guardianEmail,
    guardianRelationship,
    guardianPhoto,
    avatar,
    feeStatus,
    feeAmountDue,
    hostelBuilding,
    hostelRoom,
    hostelBed
  } = body || {}

  if (!name || !classArmId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Student full name and class arm placement are required'
    })
  }

  // Find class arm display name if not provided
  let armName = classArmName
  if (!armName) {
    const classes = dbQuery.getClasses(tenantId)
    const found = classes.find(c => c.id === classArmId)
    armName = found ? found.displayName : classArmId
  }

  const studentData = {
    tenantId,
    name,
    admissionNo,
    classArmId,
    classArmName: armName,
    gender: gender || 'Male',
    dateOfBirth: dateOfBirth || '2010-01-01',
    guardianName: guardianName || 'Parent / Sponsor',
    guardianPhone: guardianPhone || '+234 800 000 0000',
    guardianEmail: guardianEmail || '',
    guardianRelationship: guardianRelationship || 'Father',
    guardianPhoto: guardianPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    avatar: avatar || '',
    status: 'Active',
    attendanceRate: 100.0,
    feeStatus: feeStatus || 'Unpaid',
    feeAmountDue: feeAmountDue ? Number(feeAmountDue) : (feeStatus === 'Paid in Full' ? 0 : 350000),
    hostelInfo: hostelBuilding ? {
      building: hostelBuilding,
      room: hostelRoom || 'Room 101',
      bed: hostelBed || 'Bed A'
    } : undefined
  }

  const newStudent = dbQuery.insertStudent(studentData)

  return {
    success: true,
    message: `Student ${name} successfully enrolled with admission number ${newStudent?.admissionNo}`,
    data: newStudent
  }
})
