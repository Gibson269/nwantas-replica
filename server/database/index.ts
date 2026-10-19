import { getDatabase, resetDatabase } from './connection'

export { getDatabase, resetDatabase }

export interface QueryOptions {
  tenantId?: string
}

export const dbQuery = {
  // 1. Tenants
  getTenants() {
    const db = getDatabase()
    return db.prepare('SELECT * FROM tenants').all() as any[]
  },
  getTenantBySlug(slug: string) {
    const db = getDatabase()
    return db.prepare('SELECT * FROM tenants WHERE slug = ? OR id = ?').get(slug, slug) as any
  },

  // 2. Users & RBAC
  getUsers(tenantId = 'apex-academy') {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM users WHERE tenant_id = ?').all(tenantId) as any[]
    return rows.map(r => ({
      ...r,
      roleTitle: r.role_title,
      permissions: JSON.parse(r.permissions_json || '[]')
    }))
  },
  getUserById(id: string) {
    const db = getDatabase()
    const r = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any
    if (!r) return null
    return {
      ...r,
      roleTitle: r.role_title,
      permissions: JSON.parse(r.permissions_json || '[]')
    }
  },

  // 3. Classes
  getClasses(tenantId = 'apex-academy') {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM classes WHERE tenant_id = ?').all(tenantId) as any[]
    return rows.map(r => ({
      ...r,
      studentCount: r.student_count,
      displayName: r.display_name,
      formTeacher: r.form_teacher,
      subjects: JSON.parse(r.subjects_json || '[]')
    }))
  },

  // 4. Students
  getStudents(tenantId = 'apex-academy', classArmId?: string) {
    const db = getDatabase()
    let query = 'SELECT * FROM students WHERE tenant_id = ?'
    const params: any[] = [tenantId]
    if (classArmId) {
      query += ' AND class_arm_id = ?'
      params.push(classArmId)
    }
    const rows = db.prepare(query).all(...params) as any[]
    return rows.map(r => ({
      ...r,
      admissionNo: r.admission_no,
      classArmId: r.class_arm_id,
      classArmName: r.class_arm_name,
      dateOfBirth: r.date_of_birth,
      guardianName: r.guardian_name,
      guardianPhone: r.guardian_phone,
      guardianEmail: r.guardian_email,
      guardianRelationship: r.guardian_relationship,
      guardianPhoto: r.guardian_photo,
      attendanceRate: r.attendance_rate,
      feeStatus: r.fee_status,
      feeAmountDue: r.fee_amount_due,
      hostelInfo: r.hostel_building ? {
        building: r.hostel_building,
        room: r.hostel_room,
        bed: r.hostel_bed
      } : undefined
    }))
  },
  getStudentById(id: string) {
    const db = getDatabase()
    const r = db.prepare('SELECT * FROM students WHERE id = ?').get(id) as any
    if (!r) return null
    return {
      ...r,
      admissionNo: r.admission_no,
      classArmId: r.class_arm_id,
      classArmName: r.class_arm_name,
      dateOfBirth: r.date_of_birth,
      guardianName: r.guardian_name,
      guardianPhone: r.guardian_phone,
      guardianEmail: r.guardian_email,
      guardianRelationship: r.guardian_relationship,
      guardianPhoto: r.guardian_photo,
      attendanceRate: r.attendance_rate,
      feeStatus: r.fee_status,
      feeAmountDue: r.fee_amount_due,
      hostelInfo: r.hostel_building ? {
        building: r.hostel_building,
        room: r.hostel_room,
        bed: r.hostel_bed
      } : undefined
    }
  },

  // 5. Lesson Notes
  getLessonNotes(tenantId = 'apex-academy') {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM lesson_notes WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId) as any[]
    return rows.map(r => ({
      ...r,
      classLevel: r.class_level,
      authorRole: r.author_role,
      objectives: JSON.parse(r.objectives_json || '[]'),
      materials: JSON.parse(r.materials_json || '[]'),
      contentSections: JSON.parse(r.sections_json || '[]'),
      assessmentQuestions: JSON.parse(r.assessment_questions_json || '[]'),
      comments: JSON.parse(r.comments_json || '[]'),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }))
  },
  insertLessonNote(note: any) {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO lesson_notes (id, tenant_id, subject, topic, class_level, term, week, author, author_role, status, objectives_json, prerequisites, materials_json, sections_json, assessment_questions_json, comments_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      note.id,
      note.schoolId || note.tenantId || 'apex-academy',
      note.subject,
      note.topic,
      note.classLevel,
      note.term || 'Second Term',
      note.week || 1,
      note.author,
      note.authorRole,
      note.status || 'Draft',
      JSON.stringify(note.objectives || []),
      note.prerequisites || '',
      JSON.stringify(note.materials || []),
      JSON.stringify(note.contentSections || []),
      JSON.stringify(note.assessmentQuestions || []),
      JSON.stringify(note.comments || [])
    )
    return note
  },
  updateLessonNoteStatus(id: string, status: string, approver: string, role: string) {
    const db = getDatabase()
    const row = db.prepare('SELECT * FROM lesson_notes WHERE id = ?').get(id) as any
    if (!row) return null

    const comments = JSON.parse(row.comments_json || '[]')
    comments.push({
      id: `c-${Date.now()}`,
      author: approver,
      role: role,
      text: `Endorsed and approved as ready for academic delivery. Status updated to ${status}.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    })

    db.prepare('UPDATE lesson_notes SET status = ?, comments_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, JSON.stringify(comments), id)

    return {
      ...row,
      status,
      comments
    }
  },

  // 6. Assessments & CBT Engine
  getAssessments(tenantId = 'apex-academy') {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM assessments WHERE tenant_id = ?').all(tenantId) as any[]
    return rows.map(r => ({
      ...r,
      classLevel: r.class_level,
      durationMinutes: r.duration_minutes,
      totalMarks: r.total_marks,
      antiCheatEnabled: Boolean(r.anti_cheat_enabled),
      isPublished: Boolean(r.is_published),
      submissionsCount: r.submissions_count,
      averageScore: r.average_score,
      questions: JSON.parse(r.questions_json || '[]')
    }))
  },
  getAssessmentById(id: string) {
    const db = getDatabase()
    const r = db.prepare('SELECT * FROM assessments WHERE id = ?').get(id) as any
    if (!r) return null
    return {
      ...r,
      classLevel: r.class_level,
      durationMinutes: r.duration_minutes,
      totalMarks: r.total_marks,
      antiCheatEnabled: Boolean(r.anti_cheat_enabled),
      isPublished: Boolean(r.is_published),
      submissionsCount: r.submissions_count,
      averageScore: r.average_score,
      questions: JSON.parse(r.questions_json || '[]')
    }
  },
  recordAntiCheatEvent(event: any) {
    const db = getDatabase()
    db.prepare(`
      INSERT INTO anti_cheat_events (id, assessment_id, student_id, student_name, event_type, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      event.id,
      event.assessmentId,
      event.studentId,
      event.studentName,
      event.eventType,
      event.details,
      event.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19)
    )
    return event
  },
  getAntiCheatEvents(assessmentId?: string) {
    const db = getDatabase()
    let query = 'SELECT * FROM anti_cheat_events'
    const params: any[] = []
    if (assessmentId) {
      query += ' WHERE assessment_id = ?'
      params.push(assessmentId)
    }
    query += ' ORDER BY timestamp DESC'
    return db.prepare(query).all(...params)
  },

  // 7. Broadsheet & Gradebook
  getGradebook(tenantId = 'apex-academy', classArmId?: string) {
    const db = getDatabase()
    let query = 'SELECT * FROM gradebook_entries WHERE tenant_id = ?'
    const params: any[] = [tenantId]
    if (classArmId) {
      query += ' AND class_arm_id = ?'
      params.push(classArmId)
    }
    const rows = db.prepare(query).all(...params) as any[]
    return rows.map(r => ({
      studentId: r.student_id,
      studentName: r.student_name,
      admissionNo: r.admission_no,
      caScore: r.ca_score,
      midtermScore: r.midterm_score,
      examScore: r.exam_score,
      totalScore: r.total_score,
      letterGrade: r.letter_grade,
      gpa: r.gpa,
      position: r.position,
      teacherRemarks: r.teacher_remarks,
      principalRemarks: r.principal_remarks
    }))
  },

  // 8. Wallets, Transactions, Fees & Payroll
  getWalletData(tenantId = 'apex-academy') {
    const db = getDatabase()
    const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId) as any
    const feeSchedules = db.prepare('SELECT * FROM fee_schedules WHERE tenant_id = ?').all(tenantId) as any[]
    const recentTransactions = db.prepare('SELECT * FROM transactions WHERE tenant_id = ? ORDER BY date DESC LIMIT 10').all(tenantId) as any[]
    const payrollRuns = db.prepare('SELECT * FROM payroll_runs WHERE tenant_id = ? ORDER BY month DESC').all(tenantId) as any[]

    return {
      wallet: {
        balance: tenant ? tenant.wallet_balance : 48650000,
        currency: tenant ? tenant.currency : 'NGN',
        symbol: tenant ? tenant.symbol : '₦',
        bankAccount: {
          bankName: 'Zenith Bank PLC',
          accountNumber: '1019283746',
          accountName: 'Apex International Academy Ltd'
        }
      },
      feeSchedules,
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        studentName: t.student_name,
        type: t.type,
        amount: t.amount,
        channel: t.channel,
        status: t.status,
        date: t.date
      })),
      payrollRuns: payrollRuns.map(p => ({
        id: p.id,
        month: p.month,
        totalStaff: p.total_staff,
        grossSalary: p.gross_salary,
        deductions: p.deductions,
        netDisbursement: p.net_disbursement,
        status: p.status,
        disbursedDate: p.disbursed_date,
        approvedBy: p.approved_by
      }))
    }
  },

  // 9. Hostels & Beds
  getHostelBuildings(tenantId = 'apex-academy') {
    const db = getDatabase()
    const buildings = db.prepare('SELECT * FROM hostel_buildings WHERE tenant_id = ?').all(tenantId) as any[]
    const beds = db.prepare('SELECT * FROM hostel_beds').all() as any[]
    return {
      buildings: buildings.map(b => ({
        id: b.id,
        name: b.name,
        warden: b.warden,
        totalRooms: b.total_rooms,
        totalBeds: b.total_beds,
        occupiedBeds: b.occupied_beds,
        vacantBeds: b.vacant_beds
      })),
      beds: beds.map(b => ({
        id: b.id,
        buildingId: b.building_id,
        buildingName: b.building_name,
        roomNumber: b.room_number,
        bedCode: b.bed_code,
        status: b.status,
        studentName: b.student_name,
        studentId: b.student_id
      }))
    }
  },

  // 10. Campus Gate Security & Exeats
  getExeats(tenantId = 'apex-academy') {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM exeats WHERE tenant_id = ? ORDER BY departure_time DESC').all(tenantId) as any[]
    return rows.map(r => ({
      id: r.id,
      schoolId: r.tenant_id,
      studentId: r.student_id,
      studentName: r.student_name,
      classArm: r.class_arm,
      type: r.type,
      departureTime: r.departure_time,
      expectedReturn: r.expected_return,
      actualReturn: r.actual_return,
      status: r.status,
      approvedBy: r.approved_by,
      guardianPickupName: r.guardian_pickup_name
    }))
  },
  insertExeat(exeat: any) {
    const db = getDatabase()
    db.prepare(`
      INSERT INTO exeats (id, tenant_id, student_id, student_name, class_arm, type, departure_time, expected_return, status, approved_by, guardian_pickup_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      exeat.id,
      exeat.schoolId || exeat.tenant_id || 'apex-academy',
      exeat.studentId,
      exeat.studentName,
      exeat.classArm,
      exeat.type,
      exeat.departureTime,
      exeat.expectedReturn,
      exeat.status || 'Approved',
      exeat.approvedBy || 'Gate Control',
      exeat.guardianPickupName
    )
    return exeat
  },
  getGuardianPickups(tenantId = 'apex-academy') {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM guardian_pickups WHERE tenant_id = ? ORDER BY pickup_date DESC').all(tenantId) as any[]
    return rows.map(r => ({
      id: r.id,
      schoolId: r.tenant_id,
      studentId: r.student_id,
      studentName: r.student_name,
      classArm: r.class_arm,
      guardianName: r.guardian_name,
      guardianRelationship: r.guardian_relationship,
      guardianPhoto: r.guardian_photo,
      pickupDate: r.pickup_date,
      status: r.status,
      verifiedBy: r.verified_by
    }))
  },
  insertGuardianPickup(pickup: any) {
    const db = getDatabase()
    db.prepare(`
      INSERT INTO guardian_pickups (id, tenant_id, student_id, student_name, class_arm, guardian_name, guardian_relationship, guardian_photo, pickup_date, status, verified_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      pickup.id,
      pickup.schoolId || pickup.tenantId || 'apex-academy',
      pickup.studentId,
      pickup.studentName,
      pickup.classArm,
      pickup.guardianName,
      pickup.guardianRelationship,
      pickup.guardianPhoto,
      pickup.pickupDate || new Date().toISOString().replace('T', ' ').substring(0, 16),
      pickup.status || 'Verified & Cleared',
      pickup.verifiedBy || 'Security Desk'
    )
    return pickup
  },

  // 11. GoChats Messenger
  getChatRooms(tenantId = 'apex-academy') {
    const db = getDatabase()
    return db.prepare('SELECT * FROM chat_rooms WHERE tenant_id = ?').all(tenantId) as any[]
  },
  getChatMessages(roomId: string) {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM chat_messages WHERE room_id = ? ORDER BY timestamp ASC').all(roomId) as any[]
    return rows.map(r => ({
      id: r.id,
      roomId: r.room_id,
      senderId: r.sender_id,
      senderName: r.sender_name,
      senderRole: r.sender_role,
      senderAvatar: r.sender_avatar,
      text: r.text,
      timestamp: r.timestamp,
      reactions: JSON.parse(r.reactions_json || '{}')
    }))
  },
  insertChatMessage(msg: any) {
    const db = getDatabase()
    db.prepare(`
      INSERT INTO chat_messages (id, room_id, sender_id, sender_name, sender_role, sender_avatar, text, timestamp, reactions_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      msg.id,
      msg.roomId,
      msg.senderId,
      msg.senderName,
      msg.senderRole,
      msg.senderAvatar,
      msg.text,
      msg.timestamp,
      JSON.stringify(msg.reactions || {})
    )
    return msg
  },

  // 12. Admissions Pipeline
  getAdmissions(tenantId = 'apex-academy') {
    const db = getDatabase()
    const cycles = db.prepare('SELECT * FROM admission_cycles WHERE tenant_id = ?').all(tenantId) as any[]
    const applications = db.prepare('SELECT a.* FROM admission_applications a JOIN admission_cycles c ON a.cycle_id = c.id WHERE c.tenant_id = ?').all(tenantId) as any[]

    return {
      cycles: cycles.map(c => ({
        id: c.id,
        title: c.title,
        targetClasses: JSON.parse(c.target_classes_json || '[]'),
        applicationFee: c.application_fee,
        currency: c.currency,
        startDate: c.start_date,
        endDate: c.end_date,
        status: c.status,
        applicantsCount: c.applicants_count,
        acceptedCount: c.accepted_count
      })),
      applications: applications.map(a => ({
        id: a.id,
        applicantName: a.applicant_name,
        applyingForClass: a.applying_for_class,
        parentName: a.parent_name,
        parentPhone: a.parent_phone,
        parentEmail: a.parent_email,
        submissionDate: a.submission_date,
        entranceExamScore: a.entrance_exam_score,
        status: a.status,
        documents: JSON.parse(a.documents_json || '[]')
      }))
    }
  },

  // 13. Past Questions & Competitions
  getPastQuestions() {
    const db = getDatabase()
    return db.prepare('SELECT * FROM past_questions').all() as any[]
  },
  getCompetitions() {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM competitions').all() as any[]
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      organizer: r.organizer,
      currentRound: r.current_round,
      participantsCount: r.participants_count,
      leaderboard: JSON.parse(r.leaderboard_json || '[]')
    }))
  },

  // 14. Government Regulatory Compliance
  getGovernmentCompliance(tenantId = 'apex-academy') {
    const db = getDatabase()
    const r = db.prepare('SELECT * FROM government_compliance WHERE tenant_id = ?').get(tenantId) as any
    if (!r) return null
    return {
      accreditationRating: r.accreditation_rating,
      lastAuditDate: r.last_audit_date,
      inspectorLead: r.inspector_lead,
      curriculumCompliance: r.curriculum_compliance,
      categories: JSON.parse(r.categories_json || '[]'),
      activeCitations: JSON.parse(r.citations_json || '[]')
    }
  }
}
