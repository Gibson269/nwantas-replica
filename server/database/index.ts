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
  insertClass(cls: any) {
    const db = getDatabase()
    const id = cls.id || `cls-${cls.level.toLowerCase().replace(/\s+/g, '')}-${cls.arm.toLowerCase().replace(/\s+/g, '')}`
    const displayName = cls.displayName || `${cls.level} ${cls.arm}`
    db.prepare(`
      INSERT INTO classes (id, tenant_id, level, arm, display_name, form_teacher, student_count, capacity, subjects_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      cls.tenantId || cls.tenant_id || 'apex-academy',
      cls.level,
      cls.arm,
      displayName,
      cls.formTeacher || '',
      cls.studentCount || 0,
      cls.capacity || 35,
      JSON.stringify(cls.subjects || [])
    )
    return {
      id,
      tenantId: cls.tenantId || 'apex-academy',
      level: cls.level,
      arm: cls.arm,
      displayName,
      formTeacher: cls.formTeacher || '',
      studentCount: cls.studentCount || 0,
      capacity: cls.capacity || 35,
      subjects: cls.subjects || []
    }
  },
  updateClass(id: string, updates: any) {
    const db = getDatabase()
    const existing = db.prepare('SELECT * FROM classes WHERE id = ?').get(id) as any
    if (!existing) return null

    const level = updates.level ?? existing.level
    const arm = updates.arm ?? existing.arm
    const displayName = updates.displayName ?? `${level} ${arm}`
    const formTeacher = updates.formTeacher ?? existing.form_teacher
    const capacity = updates.capacity ?? existing.capacity
    const subjects = updates.subjects ? JSON.stringify(updates.subjects) : existing.subjects_json

    db.prepare(`
      UPDATE classes
      SET level = ?, arm = ?, display_name = ?, form_teacher = ?, capacity = ?, subjects_json = ?
      WHERE id = ?
    `).run(level, arm, displayName, formTeacher, capacity, subjects, id)

    return {
      id,
      level,
      arm,
      displayName,
      formTeacher,
      capacity,
      subjects: JSON.parse(subjects || '[]')
    }
  },
  deleteClass(id: string) {
    const db = getDatabase()
    const studentCount = (db.prepare('SELECT count(*) as c FROM students WHERE class_arm_id = ?').get(id) as { c: number } | undefined)?.c || 0
    if (studentCount > 0) {
      throw new Error(`Cannot delete class arm with ${studentCount} active enrolled students. Please re-assign students first.`)
    }
    db.prepare('DELETE FROM classes WHERE id = ?').run(id)
    return { success: true, id }
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
  insertStudent(st: any) {
    const db = getDatabase()
    const id = st.id || `usr-stud-${Date.now().toString(36)}`
    
    let admissionNo = st.admissionNo
    if (!admissionNo) {
      const year = new Date().getFullYear()
      const rand = Math.floor(100 + Math.random() * 900)
      admissionNo = `APX-${year}-${rand}`
    }

    const defaultAvatar = st.gender === 'Female'
      ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'

    db.prepare(`
      INSERT INTO students (
        id, tenant_id, admission_no, name, class_arm_id, class_arm_name,
        gender, date_of_birth, guardian_name, guardian_phone, guardian_email,
        guardian_relationship, guardian_photo, avatar, status, attendance_rate,
        fee_status, fee_amount_due, hostel_building, hostel_room, hostel_bed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      st.tenantId || st.schoolId || 'apex-academy',
      admissionNo,
      st.name,
      st.classArmId,
      st.classArmName,
      st.gender || 'Male',
      st.dateOfBirth || '2010-01-01',
      st.guardianName || 'Guardian',
      st.guardianPhone || '+234 800 000 0000',
      st.guardianEmail || '',
      st.guardianRelationship || 'Father',
      st.guardianPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      st.avatar || defaultAvatar,
      st.status || 'Active',
      st.attendanceRate ?? 100.0,
      st.feeStatus || 'Unpaid',
      st.feeAmountDue ?? 0,
      st.hostelInfo?.building || null,
      st.hostelInfo?.room || null,
      st.hostelInfo?.bed || null
    )

    this.syncClassStudentCount(st.classArmId)
    return this.getStudentById(id)
  },
  updateStudent(id: string, updates: any) {
    const db = getDatabase()
    const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(id) as any
    if (!existing) return null

    const oldClassArmId = existing.class_arm_id

    db.prepare(`
      UPDATE students SET
        name = COALESCE(?, name),
        class_arm_id = COALESCE(?, class_arm_id),
        class_arm_name = COALESCE(?, class_arm_name),
        gender = COALESCE(?, gender),
        date_of_birth = COALESCE(?, date_of_birth),
        guardian_name = COALESCE(?, guardian_name),
        guardian_phone = COALESCE(?, guardian_phone),
        guardian_email = COALESCE(?, guardian_email),
        guardian_relationship = COALESCE(?, guardian_relationship),
        guardian_photo = COALESCE(?, guardian_photo),
        avatar = COALESCE(?, avatar),
        status = COALESCE(?, status),
        attendance_rate = COALESCE(?, attendance_rate),
        fee_status = COALESCE(?, fee_status),
        fee_amount_due = COALESCE(?, fee_amount_due),
        hostel_building = COALESCE(?, hostel_building),
        hostel_room = COALESCE(?, hostel_room),
        hostel_bed = COALESCE(?, hostel_bed)
      WHERE id = ?
    `).run(
      updates.name,
      updates.classArmId,
      updates.classArmName,
      updates.gender,
      updates.dateOfBirth,
      updates.guardianName,
      updates.guardianPhone,
      updates.guardianEmail,
      updates.guardianRelationship,
      updates.guardianPhoto,
      updates.avatar,
      updates.status,
      updates.attendanceRate,
      updates.feeStatus,
      updates.feeAmountDue,
      updates.hostelInfo ? updates.hostelInfo.building : (updates.hostelBuilding ?? null),
      updates.hostelInfo ? updates.hostelInfo.room : (updates.hostelRoom ?? null),
      updates.hostelInfo ? updates.hostelInfo.bed : (updates.hostelBed ?? null),
      id
    )

    if (updates.classArmId && updates.classArmId !== oldClassArmId) {
      this.syncClassStudentCount(oldClassArmId)
      this.syncClassStudentCount(updates.classArmId)
    }

    return this.getStudentById(id)
  },
  updateStudentStatus(id: string, status: string) {
    const db = getDatabase()
    db.prepare('UPDATE students SET status = ? WHERE id = ?').run(status, id)
    return this.getStudentById(id)
  },
  deleteStudent(id: string) {
    const db = getDatabase()
    const existing = db.prepare('SELECT class_arm_id FROM students WHERE id = ?').get(id) as any
    if (!existing) return null

    db.prepare('DELETE FROM students WHERE id = ?').run(id)
    this.syncClassStudentCount(existing.class_arm_id)
    return { success: true, id }
  },
  syncClassStudentCount(classArmId: string) {
    if (!classArmId) return
    const db = getDatabase()
    const count = (db.prepare("SELECT count(*) as c FROM students WHERE class_arm_id = ? AND status != 'Graduated'").get(classArmId) as { c: number } | undefined)?.c || 0
    db.prepare('UPDATE classes SET student_count = ? WHERE id = ?').run(count, classArmId)
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
  addLessonNoteComment(id: string, comment: any) {
    const db = getDatabase()
    const row = db.prepare('SELECT comments_json FROM lesson_notes WHERE id = ?').get(id) as any
    if (!row) return null

    const comments = JSON.parse(row.comments_json || '[]')
    const newComment = {
      id: comment.id || `c-${Date.now()}`,
      author: comment.author || 'Faculty Member',
      role: comment.role || 'Teacher',
      text: comment.text,
      date: comment.date || new Date().toISOString().replace('T', ' ').substring(0, 16)
    }
    comments.push(newComment)

    db.prepare('UPDATE lesson_notes SET comments_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(JSON.stringify(comments), id)

    return newComment
  },
  updateLessonNote(id: string, updates: any) {
    const db = getDatabase()
    const existing = db.prepare('SELECT * FROM lesson_notes WHERE id = ?').get(id) as any
    if (!existing) return null

    const topic = updates.topic ?? existing.topic
    const objectives = updates.objectives ? JSON.stringify(updates.objectives) : existing.objectives_json
    const prerequisites = updates.prerequisites ?? existing.prerequisites
    const materials = updates.materials ? JSON.stringify(updates.materials) : existing.materials_json
    const sections = updates.contentSections ? JSON.stringify(updates.contentSections) : existing.sections_json
    const assessmentQuestions = updates.assessmentQuestions ? JSON.stringify(updates.assessmentQuestions) : existing.assessment_questions_json

    db.prepare(`
      UPDATE lesson_notes
      SET topic = ?, objectives_json = ?, prerequisites = ?, materials_json = ?, sections_json = ?, assessment_questions_json = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(topic, objectives, prerequisites, materials, sections, assessmentQuestions, id)

    const updated = db.prepare('SELECT * FROM lesson_notes WHERE id = ?').get(id) as any
    return {
      ...updated,
      classLevel: updated.class_level,
      authorRole: updated.author_role,
      objectives: JSON.parse(updated.objectives_json || '[]'),
      materials: JSON.parse(updated.materials_json || '[]'),
      contentSections: JSON.parse(updated.sections_json || '[]'),
      assessmentQuestions: JSON.parse(updated.assessment_questions_json || '[]'),
      comments: JSON.parse(updated.comments_json || '[]'),
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    }
  },
  deleteLessonNote(id: string) {
    const db = getDatabase()
    db.prepare('DELETE FROM lesson_notes WHERE id = ?').run(id)
    return { success: true, id }
  },

  // 6. Assessments & CBT Engine
  getAssessments(tenantId = 'apex-academy') {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM assessments WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId) as any[]
    return rows.map(r => ({
      ...r,
      classLevel: r.class_level,
      durationMinutes: r.duration_minutes,
      totalMarks: r.total_marks,
      antiCheatEnabled: Boolean(r.anti_cheat_enabled),
      isPublished: Boolean(r.is_published),
      submissionsCount: r.submissions_count,
      averageScore: r.average_score,
      questions: JSON.parse(r.questions_json || '[]'),
      createdAt: r.created_at
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
      questions: JSON.parse(r.questions_json || '[]'),
      createdAt: r.created_at
    }
  },
  createAssessment(data: any) {
    const db = getDatabase()
    const id = data.id || `asm-${Date.now().toString(36)}`
    const tenantId = data.tenantId || 'apex-academy'
    const title = data.title || 'Untitled Assessment'
    const type = data.type || 'CBT Exam'
    const subject = data.subject || 'General Studies'
    const classLevel = data.classLevel || 'SS 1'
    const durationMinutes = Number(data.durationMinutes) || 45
    const totalMarks = Number(data.totalMarks) || 40
    const instructions = data.instructions || 'Answer all questions carefully within the allocated time.'
    const antiCheatEnabled = data.antiCheatEnabled !== false ? 1 : 0
    const isPublished = data.isPublished !== false ? 1 : 0
    const questionsJson = JSON.stringify(data.questions || [])
    const submissionsCount = 0
    const averageScore = 0

    db.prepare(`
      INSERT INTO assessments (
        id, tenant_id, title, type, subject, class_level, duration_minutes,
        total_marks, instructions, anti_cheat_enabled, is_published,
        questions_json, submissions_count, average_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, tenantId, title, type, subject, classLevel, durationMinutes,
      totalMarks, instructions, antiCheatEnabled, isPublished,
      questionsJson, submissionsCount, averageScore
    )

    return this.getAssessmentById(id)
  },
  updateAssessment(id: string, updates: any) {
    const db = getDatabase()
    const existing = db.prepare('SELECT * FROM assessments WHERE id = ?').get(id) as any
    if (!existing) return null

    const title = updates.title ?? existing.title
    const type = updates.type ?? existing.type
    const subject = updates.subject ?? existing.subject
    const classLevel = updates.classLevel ?? existing.class_level
    const durationMinutes = updates.durationMinutes !== undefined ? Number(updates.durationMinutes) : existing.duration_minutes
    const totalMarks = updates.totalMarks !== undefined ? Number(updates.totalMarks) : existing.total_marks
    const instructions = updates.instructions ?? existing.instructions
    const antiCheatEnabled = updates.antiCheatEnabled !== undefined ? (updates.antiCheatEnabled ? 1 : 0) : existing.anti_cheat_enabled
    const isPublished = updates.isPublished !== undefined ? (updates.isPublished ? 1 : 0) : existing.is_published
    const questionsJson = updates.questions ? JSON.stringify(updates.questions) : existing.questions_json

    db.prepare(`
      UPDATE assessments SET
        title = ?,
        type = ?,
        subject = ?,
        class_level = ?,
        duration_minutes = ?,
        total_marks = ?,
        instructions = ?,
        anti_cheat_enabled = ?,
        is_published = ?,
        questions_json = ?
      WHERE id = ?
    `).run(
      title, type, subject, classLevel, durationMinutes, totalMarks,
      instructions, antiCheatEnabled, isPublished, questionsJson, id
    )

    return this.getAssessmentById(id)
  },
  deleteAssessment(id: string) {
    const db = getDatabase()
    db.prepare('DELETE FROM anti_cheat_events WHERE assessment_id = ?').run(id)
    db.prepare('DELETE FROM assessment_submissions WHERE assessment_id = ?').run(id)
    db.prepare('DELETE FROM assessments WHERE id = ?').run(id)
    return { success: true, id }
  },
  recordAssessmentSubmission(submission: any) {
    const db = getDatabase()
    const id = submission.id || `sub-${Date.now().toString(36)}`
    const assessmentId = submission.assessmentId
    const studentId = submission.studentId || 'usr-stud-01'
    const studentName = submission.studentName || 'Student Candidate'
    const score = Number(submission.score) || 0
    const totalMarks = Number(submission.totalMarks) || 40
    const percentage = Number(submission.percentage) || 0
    const passed = submission.passed ? 1 : 0
    const resultsJson = JSON.stringify(submission.results || submission.questionResults || [])
    const submittedAt = submission.submittedAt || new Date().toISOString().replace('T', ' ').substring(0, 19)

    db.prepare(`
      INSERT INTO assessment_submissions (
        id, assessment_id, student_id, student_name, score, total_marks,
        percentage, passed, results_json, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, assessmentId, studentId, studentName, score, totalMarks,
      percentage, passed, resultsJson, submittedAt
    )

    // Recalculate metrics for the assessment
    const stats = db.prepare(`
      SELECT COUNT(*) as cnt, AVG(score) as avg_score
      FROM assessment_submissions
      WHERE assessment_id = ?
    `).get(assessmentId) as { cnt: number; avg_score: number | null }

    const submissionsCount = stats?.cnt || 1
    const averageScore = Math.round((stats?.avg_score || score) * 10) / 10

    db.prepare(`
      UPDATE assessments
      SET submissions_count = ?, average_score = ?
      WHERE id = ?
    `).run(submissionsCount, averageScore, assessmentId)

    return {
      id,
      assessmentId,
      studentId,
      studentName,
      score,
      totalMarks,
      percentage,
      passed: Boolean(passed),
      questionResults: JSON.parse(resultsJson),
      submittedAt
    }
  },
  getAssessmentSubmissions(assessmentId: string) {
    const db = getDatabase()
    const rows = db.prepare(`
      SELECT * FROM assessment_submissions
      WHERE assessment_id = ?
      ORDER BY submitted_at DESC
    `).all(assessmentId) as any[]

    return rows.map(r => ({
      id: r.id,
      assessmentId: r.assessment_id,
      studentId: r.student_id,
      studentName: r.student_name,
      score: r.score,
      totalMarks: r.total_marks,
      percentage: r.percentage,
      passed: Boolean(r.passed),
      results: JSON.parse(r.results_json || '[]'),
      submittedAt: r.submitted_at
    }))
  },
  recordAntiCheatEvent(event: any) {
    const db = getDatabase()
    const id = event.id || `ace-${Date.now().toString(36)}`
    const timestamp = event.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19)
    db.prepare(`
      INSERT INTO anti_cheat_events (id, assessment_id, student_id, student_name, event_type, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      event.assessmentId,
      event.studentId,
      event.studentName,
      event.eventType,
      event.details,
      timestamp
    )
    return {
      id,
      assessmentId: event.assessmentId,
      studentId: event.studentId,
      studentName: event.studentName,
      eventType: event.eventType,
      details: event.details,
      timestamp
    }
  },
  getAntiCheatEvents(assessmentId?: string) {
    const db = getDatabase()
    let query = 'SELECT * FROM anti_cheat_events'
    const params: any[] = []
    if (assessmentId) {
      query += ' WHERE assessment_id = ?'
      params.push(assessmentId)
    }
    query += ' ORDER BY timestamp DESC LIMIT 50'
    return db.prepare(query).all(...params)
  },
  clearAntiCheatEvent(eventId: string) {
    const db = getDatabase()
    db.prepare('DELETE FROM anti_cheat_events WHERE id = ?').run(eventId)
    return { success: true, id: eventId }
  },

  // 7. Broadsheet & Gradebook
  getGradebook(tenantId = 'apex-academy', classArmId?: string, subjectName?: string) {
    const db = getDatabase()
    let query = 'SELECT * FROM gradebook_entries WHERE tenant_id = ?'
    const params: any[] = [tenantId]
    if (classArmId && classArmId !== 'All') {
      query += ' AND class_arm_id = ?'
      params.push(classArmId)
    }
    if (subjectName && subjectName !== 'All') {
      query += ' AND subject_name = ?'
      params.push(subjectName)
    }
    query += ' ORDER BY total_score DESC'
    const rows = db.prepare(query).all(...params) as any[]
    return rows.map(r => ({
      id: r.id,
      tenantId: r.tenant_id,
      studentId: r.student_id,
      studentName: r.student_name,
      admissionNo: r.admission_no,
      classArmId: r.class_arm_id,
      subjectName: r.subject_name,
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

  collateGradebook(tenantId = 'apex-academy', classArmId = 'cls-ss2-sci', subjectName?: string) {
    const db = getDatabase()
    let query = 'SELECT * FROM gradebook_entries WHERE tenant_id = ?'
    const params: any[] = [tenantId]
    if (classArmId && classArmId !== 'All') {
      query += ' AND class_arm_id = ?'
      params.push(classArmId)
    }
    if (subjectName && subjectName !== 'All') {
      query += ' AND subject_name = ?'
      params.push(subjectName)
    }
    query += ' ORDER BY (ca_score + midterm_score + exam_score) DESC'
    const rows = db.prepare(query).all(...params) as any[]

    const updateStmt = db.prepare(`
      UPDATE gradebook_entries
      SET total_score = ?, letter_grade = ?, gpa = ?, position = ?
      WHERE id = ?
    `)

    const collated = rows.map((r, index) => {
      const ca = Number(r.ca_score) || 0
      const mid = Number(r.midterm_score) || 0
      const ex = Number(r.exam_score) || 0
      const total = Math.round((ca + mid + ex) * 10) / 10

      let letter = 'F9'
      let gpa = 0.0

      if (total >= 75) { letter = 'A1'; gpa = 5.0 }
      else if (total >= 70) { letter = 'B2'; gpa = 4.5 }
      else if (total >= 65) { letter = 'B3'; gpa = 4.0 }
      else if (total >= 60) { letter = 'C4'; gpa = 3.5 }
      else if (total >= 55) { letter = 'C5'; gpa = 3.0 }
      else if (total >= 50) { letter = 'C6'; gpa = 2.5 }
      else if (total >= 45) { letter = 'D7'; gpa = 2.0 }
      else if (total >= 40) { letter = 'E8'; gpa = 1.0 }

      const position = index + 1
      updateStmt.run(total, letter, gpa, position, r.id)

      return {
        id: r.id,
        tenantId: r.tenant_id,
        studentId: r.student_id,
        studentName: r.student_name,
        admissionNo: r.admission_no,
        classArmId: r.class_arm_id,
        subjectName: r.subject_name,
        caScore: ca,
        midtermScore: mid,
        examScore: ex,
        totalScore: total,
        letterGrade: letter,
        gpa,
        position,
        teacherRemarks: r.teacher_remarks,
        principalRemarks: r.principal_remarks
      }
    })

    const totalStudents = collated.length
    const classAverage = totalStudents > 0
      ? Math.round((collated.reduce((acc, c) => acc + c.totalScore, 0) / totalStudents) * 10) / 10
      : 0
    const passCount = collated.filter(c => c.totalScore >= 50).length
    const passRate = totalStudents > 0 ? `${Math.round((passCount / totalStudents) * 100)}%` : '100%'

    return {
      success: true,
      collatedAt: new Date().toISOString(),
      classArmId,
      subjectName,
      summary: {
        totalStudents,
        classAverage,
        highestScore: totalStudents > 0 ? collated[0].totalScore : 0,
        lowestScore: totalStudents > 0 ? collated[totalStudents - 1].totalScore : 0,
        passRate
      },
      data: collated
    }
  },

  upsertGradebookEntry(entry: any) {
    const db = getDatabase()
    const id = entry.id || `gb-${Date.now().toString(36)}`
    const tenantId = entry.tenantId || 'apex-academy'
    const ca = Math.min(20, Math.max(0, Number(entry.caScore) || 0))
    const midterm = Math.min(20, Math.max(0, Number(entry.midtermScore) || 0))
    const exam = Math.min(60, Math.max(0, Number(entry.examScore) || 0))
    const total = Math.round((ca + midterm + exam) * 10) / 10

    let letter = 'F9'
    let gpa = 0.0
    if (total >= 75) { letter = 'A1'; gpa = 5.0 }
    else if (total >= 70) { letter = 'B2'; gpa = 4.5 }
    else if (total >= 65) { letter = 'B3'; gpa = 4.0 }
    else if (total >= 60) { letter = 'C4'; gpa = 3.5 }
    else if (total >= 55) { letter = 'C5'; gpa = 3.0 }
    else if (total >= 50) { letter = 'C6'; gpa = 2.5 }
    else if (total >= 45) { letter = 'D7'; gpa = 2.0 }
    else if (total >= 40) { letter = 'E8'; gpa = 1.0 }

    db.prepare(`
      INSERT OR REPLACE INTO gradebook_entries (
        id, tenant_id, student_id, student_name, admission_no, class_arm_id,
        subject_name, ca_score, midterm_score, exam_score, total_score,
        letter_grade, gpa, position, teacher_remarks, principal_remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, tenantId, entry.studentId, entry.studentName, entry.admissionNo,
      entry.classArmId, entry.subjectName, ca, midterm, exam, total,
      letter, gpa, entry.position || 1, entry.teacherRemarks || 'Satisfactory academic performance.',
      entry.principalRemarks || 'Approved.'
    )

    this.collateGradebook(tenantId, entry.classArmId, entry.subjectName)
    return db.prepare('SELECT * FROM gradebook_entries WHERE id = ?').get(id)
  },

  getStudentTermReport(studentId: string, term = 'Second Term', session = '2026/2027') {
    const db = getDatabase()
    const student = this.getStudentById(studentId)
    if (!student) return null

    const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(student.tenant_id || student.tenantId || 'apex-academy') as any

    const subjects = db.prepare(`
      SELECT * FROM gradebook_entries
      WHERE student_id = ?
      ORDER BY subject_name ASC
    `).all(studentId) as any[]

    const formattedSubjects = subjects.map(s => ({
      subject: s.subject_name,
      ca: s.ca_score,
      caScore: s.ca_score,
      midterm: s.midterm_score,
      midtermScore: s.midterm_score,
      exam: s.exam_score,
      examScore: s.exam_score,
      total: s.total_score,
      totalScore: s.total_score,
      grade: s.letter_grade,
      letterGrade: s.letter_grade,
      gpa: s.gpa,
      position: s.position,
      remarks: s.teacher_remarks,
      teacherRemarks: s.teacher_remarks
    }))

    const totalMarks = formattedSubjects.reduce((acc, s) => acc + s.totalScore, 0)
    const overallAverage = formattedSubjects.length > 0
      ? Math.round((totalMarks / formattedSubjects.length) * 10) / 10
      : 0
    const overallGpa = formattedSubjects.length > 0
      ? Math.round((formattedSubjects.reduce((acc, s) => acc + s.gpa, 0) / formattedSubjects.length) * 100) / 100
      : 0

    return {
      school: {
        name: tenant?.name || 'Apex International Academy',
        motto: tenant?.motto || 'Excellence, Character & Global Leadership',
        address: tenant?.address || 'Plot 14 Admiralty Way, Lekki Phase 1, Lagos State',
        email: tenant?.email || 'admissions@apexacademy.edu.ng',
        phone: tenant?.phone || '+234 1 800 2739',
        crest: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80'
      },
      student: {
        id: student.id,
        name: student.name,
        admissionNo: student.admissionNo,
        classArm: student.classArmName,
        gender: student.gender,
        avatar: student.avatar,
        attendanceRate: student.attendanceRate,
        guardianName: student.guardianName
      },
      termInfo: {
        term,
        session
      },
      session,
      term,
      subjects: formattedSubjects,
      summary: {
        totalSubjects: formattedSubjects.length,
        totalScore: totalMarks,
        totalMarks,
        maxPossibleScore: formattedSubjects.length * 100,
        maxPossibleMarks: formattedSubjects.length * 100,
        average: `${overallAverage}%`,
        averageScore: overallAverage,
        overallGrade: overallAverage >= 75 ? 'A1 (Distinction)' : overallAverage >= 65 ? 'B (Merit)' : 'C (Credit)',
        gpa: overallGpa,
        classPosition: formattedSubjects.length > 0 ? `#${formattedSubjects[0].position}` : '#1',
        classRank: formattedSubjects.length > 0 ? formattedSubjects[0].position : 1,
        classTeacherRemark: 'A remarkably gifted, self-disciplined, and inquisitive scholar. Maintains consistency in STEM.',
        classTeacherSignature: 'Mr. David Adeleke (B.Sc, PGDE)',
        principalRemark: 'Outstanding academic distinction. Commendable intellectual and moral standard.',
        principalSignature: 'Dr. Chukwuemeka Eze (Ph.D, FIM)',
        attendancePercentage: `${student.attendanceRate}%`,
        conduct: 'Exemplary',
        nextTermBegins: 'January 11, 2027'
      },
      affectiveDomain: [
        { trait: 'Punctuality & Regularity', rating: 5, remark: 'Always on time' },
        { trait: 'Neatness & Decorum', rating: 5, remark: 'Impeccable grooming' },
        { trait: 'Honesty & Integrity', rating: 5, remark: 'High moral integrity' },
        { trait: 'Leadership & Initiative', rating: 4, remark: 'Proactive group contributor' },
        { trait: 'Sportsmanship & Collaboration', rating: 4, remark: 'Excellent teamwork' }
      ],
      signatures: {
        formTeacher: {
          name: 'Mr. David Adeleke',
          remark: 'A remarkably gifted, self-disciplined, and inquisitive scholar. Maintains consistency in STEM.',
          signatureDate: '2026-10-19'
        },
        principal: {
          name: 'Dr. Chukwuemeka Eze',
          title: 'Principal & Academic Director',
          remark: 'Outstanding academic distinction. Commendable intellectual and moral standard.',
          approvedDate: '2026-10-19',
          officialStamp: 'VERIFIED & CERTIFIED'
        }
      }
    }
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

  getPayrollRuns(tenantId = 'apex-academy') {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM payroll_runs WHERE tenant_id = ? ORDER BY month DESC').all(tenantId) as any[]
    return rows.map(p => ({
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
  },

  createPayrollRun(data: any) {
    const db = getDatabase()
    const id = data.id || `pr-${Date.now().toString(36)}`
    const tenantId = data.tenantId || 'apex-academy'
    const month = data.month || 'November 2026'
    const totalStaff = Number(data.totalStaff) || 86
    const grossSalary = Number(data.grossSalary) || 18450000
    const deductions = Number(data.deductions) || 2150000
    const netDisbursement = grossSalary - deductions

    db.prepare(`
      INSERT INTO payroll_runs (id, tenant_id, month, total_staff, gross_salary, deductions, net_disbursement, status, disbursed_date, approved_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, tenantId, month, totalStaff, grossSalary, deductions, netDisbursement, 'Ready for Review', null, null)

    return db.prepare('SELECT * FROM payroll_runs WHERE id = ?').get(id)
  },

  disbursePayroll(id: string, approver = 'Chief Anthony Balogun (Owner)') {
    const db = getDatabase()
    const run = db.prepare('SELECT * FROM payroll_runs WHERE id = ?').get(id) as any
    if (!run) return null

    const today = new Date().toISOString().substring(0, 10)
    db.prepare(`
      UPDATE payroll_runs
      SET status = 'Disbursed', disbursed_date = ?, approved_by = ?
      WHERE id = ?
    `).run(today, approver, id)

    // Debit the central wallet balance
    db.prepare(`
      UPDATE tenants
      SET wallet_balance = MAX(0, wallet_balance - ?)
      WHERE id = ?
    `).run(run.net_disbursement, run.tenant_id)

    // Record disbursement transaction
    const txId = `tx-${Date.now().toString(36)}`
    db.prepare(`
      INSERT INTO transactions (id, tenant_id, student_name, type, amount, channel, status, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(txId, run.tenant_id, `Staff Payroll (${run.month})`, 'Payroll Salary Disbursement', run.net_disbursement, 'NIBSS NIP Bulk Transfer', 'Success', today)

    return {
      ...run,
      status: 'Disbursed',
      disbursedDate: today,
      approvedBy: approver
    }
  },

  createFeeSchedule(tenantId = 'apex-academy', data: any) {
    const db = getDatabase()
    const id = data.id || `fee-${Date.now().toString(36)}`
    db.prepare(`
      INSERT INTO fee_schedules (id, tenant_id, title, amount, category)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, tenantId, data.title, Number(data.amount) || 0, data.category || 'Mandatory')
    return { id, tenantId, title: data.title, amount: Number(data.amount) || 0, category: data.category || 'Mandatory' }
  },

  deleteFeeSchedule(id: string) {
    const db = getDatabase()
    db.prepare('DELETE FROM fee_schedules WHERE id = ?').run(id)
    return { success: true, id }
  },

  recordTransaction(data: any) {
    const db = getDatabase()
    const id = data.id || `tx-${Date.now().toString(36)}`
    const tenantId = data.tenantId || 'apex-academy'
    const today = data.date || new Date().toISOString().substring(0, 10)
    const amount = Number(data.amount) || 0

    db.prepare(`
      INSERT INTO transactions (id, tenant_id, student_name, type, amount, channel, status, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, tenantId, data.studentName, data.type || 'Tuition Fee Payment', amount, data.channel || 'Paystack Direct Debit', 'Success', today)

    // Credit central wallet
    db.prepare(`
      UPDATE tenants
      SET wallet_balance = wallet_balance + ?
      WHERE id = ?
    `).run(amount, tenantId)

    return {
      id,
      tenantId,
      studentName: data.studentName,
      type: data.type || 'Tuition Fee Payment',
      amount,
      channel: data.channel || 'Paystack Direct Debit',
      status: 'Success',
      date: today
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

  allocateBed(bedId: string, studentId: string, studentName: string) {
    const db = getDatabase()
    const bed = db.prepare('SELECT * FROM hostel_beds WHERE id = ?').get(bedId) as any
    if (!bed) return null

    db.prepare(`
      UPDATE hostel_beds
      SET status = 'Occupied', student_id = ?, student_name = ?
      WHERE id = ?
    `).run(studentId, studentName, bedId)

    // Update student's profile
    db.prepare(`
      UPDATE students
      SET hostel_building = ?, hostel_room = ?, hostel_bed = ?
      WHERE id = ?
    `).run(bed.building_name, bed.room_number, bed.bed_code, studentId)

    // Sync building occupancy count
    const occ = (db.prepare("SELECT count(*) as c FROM hostel_beds WHERE building_id = ? AND status = 'Occupied'").get(bed.building_id) as any).c
    const bld = db.prepare('SELECT total_beds FROM hostel_buildings WHERE id = ?').get(bed.building_id) as any
    const vacant = Math.max(0, (bld?.total_beds || 0) - occ)
    db.prepare('UPDATE hostel_buildings SET occupied_beds = ?, vacant_beds = ? WHERE id = ?').run(occ, vacant, bed.building_id)

    return db.prepare('SELECT * FROM hostel_beds WHERE id = ?').get(bedId)
  },

  vacateBed(bedId: string) {
    const db = getDatabase()
    const bed = db.prepare('SELECT * FROM hostel_beds WHERE id = ?').get(bedId) as any
    if (!bed) return null

    if (bed.student_id) {
      db.prepare(`
        UPDATE students
        SET hostel_building = NULL, hostel_room = NULL, hostel_bed = NULL
        WHERE id = ?
      `).run(bed.student_id)
    }

    db.prepare(`
      UPDATE hostel_beds
      SET status = 'Vacant', student_id = NULL, student_name = NULL
      WHERE id = ?
    `).run(bedId)

    // Sync building occupancy count
    const occ = (db.prepare("SELECT count(*) as c FROM hostel_beds WHERE building_id = ? AND status = 'Occupied'").get(bed.building_id) as any).c
    const bld = db.prepare('SELECT total_beds FROM hostel_buildings WHERE id = ?').get(bed.building_id) as any
    const vacant = Math.max(0, (bld?.total_beds || 0) - occ)
    db.prepare('UPDATE hostel_buildings SET occupied_beds = ?, vacant_beds = ? WHERE id = ?').run(occ, vacant, bed.building_id)

    return db.prepare('SELECT * FROM hostel_beds WHERE id = ?').get(bedId)
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
    const id = exeat.id || `ext-${Date.now().toString(36)}`
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    db.prepare(`
      INSERT INTO exeats (id, tenant_id, student_id, student_name, class_arm, type, departure_time, expected_return, status, approved_by, guardian_pickup_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      exeat.schoolId || exeat.tenant_id || 'apex-academy',
      exeat.studentId || 'usr-stud-01',
      exeat.studentName,
      exeat.classArm || 'SS 2 Science',
      exeat.type || 'Weekend Exeat',
      exeat.departureTime || now,
      exeat.expectedReturn || now,
      exeat.status || 'Approved',
      exeat.approvedBy || 'Dr. Chukwuemeka Eze (Principal)',
      exeat.guardianPickupName || 'Authorized Guardian'
    )
    return db.prepare('SELECT * FROM exeats WHERE id = ?').get(id)
  },
  updateExeatStatus(id: string, status: string, actualReturn?: string) {
    const db = getDatabase()
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    db.prepare(`
      UPDATE exeats
      SET status = ?, actual_return = COALESCE(?, actual_return)
      WHERE id = ?
    `).run(status, actualReturn || (status === 'Returned' ? now : null), id)
    return db.prepare('SELECT * FROM exeats WHERE id = ?').get(id)
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

export const database = dbQuery
export default dbQuery

