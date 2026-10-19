import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'

let dbInstance: DatabaseSync | null = null

export function getDatabase(): DatabaseSync {
  if (dbInstance) return dbInstance

  const dataDir = path.resolve(process.cwd(), '.data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = path.join(dataDir, 'nwantas.db')

  dbInstance = new DatabaseSync(dbPath)

  // Configure high-performance SQLite settings for concurrent reads and writes
  dbInstance.exec('PRAGMA journal_mode = WAL;')
  dbInstance.exec('PRAGMA foreign_keys = ON;')
  dbInstance.exec('PRAGMA synchronous = NORMAL;')

  // Initialize schema
  const schemaPath = path.resolve(process.cwd(), 'server/database/schema.sql')
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
    dbInstance.exec(schemaSql)
  }

  // Seed default dataset if database was just created or empty
  const countRow = dbInstance.prepare("SELECT count(*) as count FROM tenants").get() as { count: number }
  if (countRow.count === 0) {
    seedInitialData(dbInstance)
  }

  return dbInstance
}

export function resetDatabase(): DatabaseSync {
  const dataDir = path.resolve(process.cwd(), '.data')
  const dbPath = path.join(dataDir, 'nwantas.db')
  
  if (dbInstance) {
    try {
      dbInstance.close()
    } catch {}
    dbInstance = null
  }

  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath)
    } catch {}
    // Also remove WAL and SHM if present
    try { fs.unlinkSync(`${dbPath}-wal`) } catch {}
    try { fs.unlinkSync(`${dbPath}-shm`) } catch {}
  }

  return getDatabase()
}

export function seedInitialData(db: DatabaseSync) {
  // 1. Multi-Tenant Institutions
  const insertTenant = db.prepare(`
    INSERT INTO tenants (id, name, slug, motto, currency, symbol, address, country, email, phone, plan_id, wallet_balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertTenant.run('apex-academy', 'Apex International Academy', 'apex-academy', 'Excellence, Character & Global Leadership', 'NGN', '₦', 'Plot 14 Admiralty Way, Lekki Phase 1, Lagos State', 'Nigeria', 'admissions@apexacademy.edu.ng', '+234 1 800 2739', 'school_plus', 48650000)
  insertTenant.run('kingsway-college', 'Kingsway British College', 'kingsway', 'Knowledge is Power & Distinction', 'GBP', '£', '22 Kensington Church Street, London W8 4EP', 'United Kingdom', 'info@kingswaycollege.co.uk', '+44 20 7946 0192', 'enterprise', 245000)

  // 2. Users & RBAC Personas
  const insertUser = db.prepare(`
    INSERT INTO users (id, tenant_id, name, email, role, role_title, avatar, permissions_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const personas = [
    { id: 'usr-owner-01', tenantId: 'apex-academy', name: 'Chief Anthony Balogun', email: 'owner@apexacademy.edu.ng', role: 'school_owner', roleTitle: 'Chairman / Proprietor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', perms: ['all:manage', 'finances:approve', 'payroll:disburse'] },
    { id: 'usr-admin-01', tenantId: 'apex-academy', name: 'Mrs. Folake Adeyemi', email: 'admin@apexacademy.edu.ng', role: 'admin', roleTitle: 'School Administrator', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', perms: ['students:write', 'classes:write', 'exeats:approve', 'admissions:manage'] },
    { id: 'usr-princ-01', tenantId: 'apex-academy', name: 'Dr. Chukwuemeka Eze', email: 'principal@apexacademy.edu.ng', role: 'Principal', roleTitle: 'Principal & Academic Director', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', perms: ['lesson_notes:approve', 'broadsheet:collate', 'assessments:publish'] },
    { id: 'usr-teach-01', tenantId: 'apex-academy', name: 'Mr. David Adeleke', email: 'david.adeleke@apexacademy.edu.ng', role: 'Teacher', roleTitle: 'Senior Physics Tutor', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', perms: ['lesson_notes:create', 'scores:entry', 'cbt:proctor'] },
    { id: 'usr-bursar-01', tenantId: 'apex-academy', name: 'Mr. Samuel Adeleke', email: 'bursar@apexacademy.edu.ng', role: 'Bursar', roleTitle: 'Chief Financial Officer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', perms: ['wallet:view', 'fees:reconcile', 'payroll:prepare'] },
    { id: 'usr-warden-01', tenantId: 'apex-academy', name: 'Mr. Jude Okafor', email: 'hostels@apexacademy.edu.ng', role: 'HostelWarden', roleTitle: 'Head Hostel Warden', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', perms: ['hostels:manage', 'exeats:inspect'] },
    { id: 'usr-sec-01', tenantId: 'apex-academy', name: 'Officer Samuel Mensah', email: 'security@apexacademy.edu.ng', role: 'SecurityOfficer', roleTitle: 'Chief Security Officer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', perms: ['gate:verify', 'pickups:record', 'exeats:stamp'] },
    { id: 'usr-parent-01', tenantId: 'apex-academy', name: 'Dr. Kenneth Okonkwo', email: 'k.okonkwo@family.org', role: 'Parent', roleTitle: 'Parent / Guardian', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', perms: ['wards:view', 'fees:pay', 'reports:view'] },
    { id: 'usr-stud-01', tenantId: 'apex-academy', name: 'Chidi Okonkwo', email: 'c.okonkwo@apexstudent.ng', role: 'Student', roleTitle: 'Senior Secondary Student', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', perms: ['cbt:take', 'results:view', 'chat:participate'] },
    { id: 'usr-fed-01', tenantId: 'apex-academy', name: 'Hon. Miriam Bello', email: 'm.bello@education.gov.ng', role: 'federal_staff', roleTitle: 'Federal Ministry Inspector', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', perms: ['compliance:audit', 'curriculum:inspect'] },
    { id: 'usr-state-01', tenantId: 'apex-academy', name: 'Engr. Tunde Johnson', email: 'tunde.johnson@lagosstate.gov.ng', role: 'state_staff', roleTitle: 'State QA Inspector', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', perms: ['compliance:audit'] }
  ]
  for (const p of personas) {
    insertUser.run(p.id, p.tenantId, p.name, p.email, p.role, p.roleTitle, p.avatar, JSON.stringify(p.perms))
  }

  // 3. Classes
  const insertClass = db.prepare(`
    INSERT INTO classes (id, tenant_id, level, arm, display_name, form_teacher, student_count, capacity, subjects_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertClass.run('cls-jss1-gold', 'apex-academy', 'JSS 1', 'Gold', 'JSS 1 Gold', 'Mrs. Chioma Eze', 32, 35, JSON.stringify(['Mathematics', 'English Language', 'Basic Science', 'Social Studies', 'Civic Education']))
  insertClass.run('cls-jss2-diamond', 'apex-academy', 'JSS 2', 'Diamond', 'JSS 2 Diamond', 'Mr. David Adeleke', 30, 35, JSON.stringify(['Mathematics', 'English Language', 'Basic Science', 'Agricultural Science', 'Computer Studies']))
  insertClass.run('cls-ss2-sci', 'apex-academy', 'SS 2', 'Science', 'SS 2 Science', 'Dr. Chukwuemeka Eze', 28, 30, JSON.stringify(['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Further Mathematics']))
  insertClass.run('cls-ss3-arts', 'apex-academy', 'SS 3', 'Arts & Humanities', 'SS 3 Arts', 'Mrs. Folake Adeyemi', 26, 30, JSON.stringify(['English Language', 'Literature in English', 'Government', 'Economics', 'Civic Education']))

  // 4. Students
  const insertStudent = db.prepare(`
    INSERT INTO students (id, tenant_id, admission_no, name, class_arm_id, class_arm_name, gender, date_of_birth, guardian_name, guardian_phone, guardian_email, guardian_relationship, guardian_photo, avatar, attendance_rate, fee_status, fee_amount_due, hostel_building, hostel_room, hostel_bed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertStudent.run('usr-stud-01', 'apex-academy', 'APX-2023-084', 'Chidi Okonkwo', 'cls-ss2-sci', 'SS 2 Science', 'Male', '2009-04-12', 'Dr. Kenneth Okonkwo', '+234 803 555 1234', 'k.okonkwo@family.org', 'Father', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', 98.5, 'Paid in Full', 0, 'Nelson Mandela Hall', 'Room 204', 'Bed B')
  insertStudent.run('usr-stud-02', 'apex-academy', 'APX-2025-112', 'Adaeze Okonkwo', 'cls-jss1-gold', 'JSS 1 Gold', 'Female', '2013-09-21', 'Dr. Kenneth Okonkwo', '+234 803 555 1234', 'k.okonkwo@family.org', 'Father', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 100.0, 'Partial', 120000, 'Queen Amina Hostel', 'Room 102', 'Bed A')
  insertStudent.run('usr-stud-03', 'apex-academy', 'APX-2023-042', 'Amina Bello', 'cls-ss2-sci', 'SS 2 Science', 'Female', '2009-02-18', 'Alhaji Sanusi Bello', '+234 802 111 8899', 'sanusi.bello@trade.gov.ng', 'Father', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 99.1, 'Paid in Full', 0, null, null, null)
  insertStudent.run('usr-stud-04', 'apex-academy', 'APX-2024-067', 'David Adeleke Jr.', 'cls-jss2-diamond', 'JSS 2 Diamond', 'Male', '2011-11-05', 'Mr. David Adeleke Sr.', '+234 809 333 4455', 'adeleke.fam@gmail.com', 'Father', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 96.4, 'Paid in Full', 0, null, null, null)

  // 5. Lesson Notes
  const insertNote = db.prepare(`
    INSERT INTO lesson_notes (id, tenant_id, subject, topic, class_level, term, week, author, author_role, status, objectives_json, prerequisites, materials_json, sections_json, assessment_questions_json, comments_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertNote.run(
    'ln-001',
    'apex-academy',
    'Physics',
    'Electromagnetic Induction & Faraday\'s Laws',
    'SS 2 Science',
    'Second Term',
    4,
    'Mr. David Adeleke',
    'Senior Physics Tutor',
    'Principal Approved',
    JSON.stringify(['State and explain Faraday\'s laws of induction', 'Demonstrate Lenz\'s law', 'Calculate induced EMF']),
    'Magnetic fields, electric current, and vector dot products.',
    JSON.stringify(['Bar magnets and solenoid coils', 'Sensitive galvanometer', 'PhET simulator on smartboard']),
    JSON.stringify([
      { title: 'Introduction & Conceptual Hook (10 mins)', body: 'Connect solenoid to galvanometer. Move bar magnet into coil. Ask why current flowed with no battery.' },
      { title: 'Theoretical Exposition & Formulation (25 mins)', body: 'Define magnetic flux Φ = B · A · cos(θ). Formulate Faraday\'s and Lenz\'s laws.' },
      { title: 'Guided Problem Solving & Hands-on Activity (30 mins)', body: 'Distribute coils and galvanometers to lab groups. Students record needle deflection magnitude and polarity at varying magnet insertion speeds.' }
    ]),
    JSON.stringify(['Calculate induced EMF given 200 turns and 0.6T change in 0.05s.', 'How does Lenz\'s law demonstrate energy conservation?']),
    JSON.stringify([{ id: 'c-1', author: 'Dr. Chukwuemeka Eze', role: 'Principal', text: 'Pedagogical rigor confirmed. Approved.', date: '2026-10-18 14:20' }])
  )

  // 6. Assessments
  const insertAssessment = db.prepare(`
    INSERT INTO assessments (id, tenant_id, title, type, subject, class_level, duration_minutes, total_marks, instructions, anti_cheat_enabled, is_published, questions_json, submissions_count, average_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertAssessment.run(
    'asm-cbt-01',
    'apex-academy',
    'SS 2 Physics Midterm CBT Examination',
    'CBT Exam',
    'Physics',
    'SS 2 Science',
    45,
    40,
    'Anti-cheat monitoring is active. Do not switch tabs, exit fullscreen, or attempt copy-pasting. All events are logged to the proctoring console.',
    1,
    1,
    JSON.stringify([
      { id: 'q-1', questionText: 'Faraday\'s law states that the induced electromotive force in any closed circuit is equal to:', options: ['The negative time rate of change of magnetic flux through the circuit', 'The electrostatic potential difference between the terminals', 'The total resistance divided by current in the coil', 'The cross product of electric field and drift velocity'], correctIndex: 0, explanation: 'Faraday\'s law is E = -N(dΦ/dt).' },
      { id: 'q-2', questionText: 'Which law of physics explains the negative sign in Faraday\'s formula E = -dΦ/dt?', options: ['Coulomb\'s Law', 'Lenz\'s Law (Conservation of Energy)', 'Ampere\'s Circuital Law', 'Gauss\'s Law for Magnetism'], correctIndex: 1, explanation: 'Lenz\'s law dictates current direction opposes change.' },
      { id: 'q-3', questionText: 'A step-up transformer has 100 primary turns and 500 secondary turns. If input is 240V, what is output voltage?', options: ['48V', '1,200V', '2,400V', '120V'], correctIndex: 1, explanation: 'Vs = 240 * (500/100) = 1,200V.' },
      { id: 'q-4', questionText: 'Which particle experiences NO magnetic deflection when moving through a uniform magnetic field?', options: ['Proton', 'Alpha particle', 'Neutron', 'Beta particle'], correctIndex: 2, explanation: 'Neutrons have zero charge (q = 0).' }
    ]),
    24,
    32.5
  )

  // 7. Anti-Cheat Events
  const insertEvent = db.prepare(`
    INSERT INTO anti_cheat_events (id, assessment_id, student_id, student_name, event_type, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  insertEvent.run('ace-001', 'asm-cbt-01', 'usr-stud-04', 'David Adeleke Jr.', 'tab_switch', 'Switched away from examination tab for 4.2 seconds.', '2026-10-19 10:14:22')

  // 8. Broadsheet & Gradebook Entries
  const insertGrade = db.prepare(`
    INSERT INTO gradebook_entries (id, tenant_id, student_id, student_name, admission_no, class_arm_id, subject_name, ca_score, midterm_score, exam_score, total_score, letter_grade, gpa, position, teacher_remarks, principal_remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertGrade.run('gb-001', 'apex-academy', 'usr-stud-01', 'Chidi Okonkwo', 'APX-2023-084', 'cls-ss2-sci', 'Physics', 19, 18, 54, 91, 'A1', 5.0, 1, 'Exceptional mastery of physical concepts and mathematical reasoning.', 'Outstanding result. Keep sustaining this academic distinction.')
  insertGrade.run('gb-002', 'apex-academy', 'usr-stud-03', 'Amina Bello', 'APX-2023-042', 'cls-ss2-sci', 'Physics', 18, 17, 51, 86, 'A1', 5.0, 2, 'Brilliant analytical problem solver and active classroom contributor.', 'Commendable performance.')

  // 9. Wallets, Transactions & Fee Schedules
  const insertFee = db.prepare(`INSERT INTO fee_schedules (id, tenant_id, title, amount, category) VALUES (?, ?, ?, ?, ?)`)
  insertFee.run('fee-01', 'apex-academy', 'Senior Secondary Tuition (Term 2)', 350000, 'Mandatory')
  insertFee.run('fee-02', 'apex-academy', 'STEM & Robotics Lab Levy', 45000, 'Mandatory')
  insertFee.run('fee-03', 'apex-academy', 'Full Boarding & Hostel Maintenance', 280000, 'Optional (Boarders)')
  insertFee.run('fee-04', 'apex-academy', 'PTA Development Levy', 15000, 'Mandatory')

  const insertTx = db.prepare(`INSERT INTO transactions (id, tenant_id, student_name, type, amount, channel, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  insertTx.run('tx-001', 'apex-academy', 'Chidi Okonkwo', 'Tuition Fee Payment', 395000, 'Paystack Direct Debit', 'Success', '2026-10-18')
  insertTx.run('tx-002', 'apex-academy', 'Adaeze Okonkwo', 'Tuition Instalment 1', 200000, 'Hosted Payment Link', 'Success', '2026-10-17')
  insertTx.run('tx-003', 'apex-academy', 'Amina Bello', 'Tuition & Boarding Fee', 675000, 'Flutterwave Card', 'Success', '2026-10-15')

  const insertPayroll = db.prepare(`
    INSERT INTO payroll_runs (id, tenant_id, month, total_staff, gross_salary, deductions, net_disbursement, status, disbursed_date, approved_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertPayroll.run('pr-2026-09', 'apex-academy', 'September 2026', 86, 18450000, 2150000, 16300000, 'Disbursed', '2026-09-28', 'Chief Anthony Balogun (Owner)')
  insertPayroll.run('pr-2026-10', 'apex-academy', 'October 2026', 86, 18450000, 2150000, 16300000, 'Ready for Review', null, null)

  // 10. Hostel Buildings & Beds
  const insertHostel = db.prepare(`INSERT INTO hostel_buildings (id, tenant_id, name, warden, total_rooms, total_beds, occupied_beds, vacant_beds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  insertHostel.run('bld-01', 'apex-academy', 'Nelson Mandela Hall (Boys Senior Boarding)', 'Mr. Jude Okafor', 24, 96, 82, 14)
  insertHostel.run('bld-02', 'apex-academy', 'Queen Amina Hostel (Girls Senior Boarding)', 'Mrs. Grace Danjuma', 24, 96, 88, 8)

  const insertBed = db.prepare(`INSERT INTO hostel_beds (id, building_id, building_name, room_number, bed_code, status, student_name, student_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  insertBed.run('b-01', 'bld-01', 'Nelson Mandela Hall', 'Room 204', 'Bed A', 'Vacant', null, null)
  insertBed.run('b-02', 'bld-01', 'Nelson Mandela Hall', 'Room 204', 'Bed B', 'Occupied', 'Chidi Okonkwo', 'usr-stud-01')
  insertBed.run('b-03', 'bld-02', 'Queen Amina Hostel', 'Room 102', 'Bed A', 'Occupied', 'Adaeze Okonkwo', 'usr-stud-02')
  insertBed.run('b-04', 'bld-02', 'Queen Amina Hostel', 'Room 102', 'Bed B', 'Vacant', null, null)

  // 11. Campus Gate Security, Exeats & Pickups
  const insertExeat = db.prepare(`
    INSERT INTO exeats (id, tenant_id, student_id, student_name, class_arm, type, departure_time, expected_return, status, approved_by, guardian_pickup_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertExeat.run('ext-101', 'apex-academy', 'usr-stud-01', 'Chidi Okonkwo', 'SS 2 Science', 'Weekend Exeat', '2026-10-19 15:30', '2026-10-21 17:00', 'Approved', 'Mrs. Folake Adeyemi (Admin)', 'Dr. Kenneth Okonkwo')
  insertExeat.run('ext-102', 'apex-academy', 'usr-stud-04', 'David Adeleke Jr.', 'JSS 2 Diamond', 'Medical', '2026-10-19 11:00', '2026-10-19 16:00', 'Departed', 'Dr. Chukwuemeka Eze (Principal)', 'Mr. David Adeleke Sr.')

  const insertPickup = db.prepare(`
    INSERT INTO guardian_pickups (id, tenant_id, student_id, student_name, class_arm, guardian_name, guardian_relationship, guardian_photo, pickup_date, status, verified_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertPickup.run('pkp-01', 'apex-academy', 'usr-stud-01', 'Chidi Okonkwo', 'SS 2 Science', 'Dr. Kenneth Okonkwo', 'Father', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', '2026-10-19 11:15 AM', 'Verified & Cleared', 'Officer Samuel Mensah (Gate 1)')

  // 12. Chat Rooms & Messages
  const insertChatRoom = db.prepare(`INSERT INTO chat_rooms (id, tenant_id, name, type, description, unread_count) VALUES (?, ?, ?, ?, ?, ?)`)
  insertChatRoom.run('rm-staff-general', 'apex-academy', 'All Academic Staff', 'group', 'Institutional announcements and academic coordination', 2)
  insertChatRoom.run('rm-science-dept', 'apex-academy', 'Science & Mathematics Faculty', 'group', 'STEM coordination and laboratory setups', 0)
  insertChatRoom.run('rm-parents-ss2', 'apex-academy', 'SS 2 Parents & Teachers Association', 'group', 'Term updates and collaborative student progression', 1)

  const insertChatMessage = db.prepare(`
    INSERT INTO chat_messages (id, room_id, sender_id, sender_name, sender_role, sender_avatar, text, timestamp, reactions_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertChatMessage.run('msg-1', 'rm-staff-general', 'usr-princ-01', 'Dr. Chukwuemeka Eze (Principal)', 'Principal', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'Good morning faculty. Please ensure all mid-term CBT question banks and CA score weightages are collated by close of work today.', '08:45 AM', JSON.stringify({ '👍': 12, '✅': 8 }))
  insertChatMessage.run('msg-2', 'rm-staff-general', 'usr-teach-01', 'Mr. David Adeleke', 'Teacher', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', 'SS2 Physics CBT test questions are uploaded and tested on the server. Anti-cheat proctoring is enabled.', '09:12 AM', JSON.stringify({ '🙌': 5 }))

  // 13. Admissions Pipeline
  const insertCycle = db.prepare(`
    INSERT INTO admission_cycles (id, tenant_id, title, target_classes_json, application_fee, currency, start_date, end_date, status, applicants_count, accepted_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertCycle.run('adm-2026', 'apex-academy', '2026/2027 Academic Year Admissions', JSON.stringify(['JSS 1', 'JSS 2', 'SS 1']), 15000, 'NGN', '2026-01-10', '2026-08-30', 'Open', 142, 48)

  const insertApp = db.prepare(`
    INSERT INTO admission_applications (id, cycle_id, applicant_name, applying_for_class, parent_name, parent_phone, parent_email, submission_date, entrance_exam_score, status, documents_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertApp.run('app-001', 'adm-2026', 'Tobiloba Williams', 'JSS 1 Gold', 'Mr. Babatunde Williams', '+234 802 333 9988', 'babatunde.w@corp.ng', '2026-10-14', '88% (Pass)', 'Interview Scheduled', JSON.stringify(['Birth Certificate', 'Previous Term Report Card', 'Immunization Record']))
  insertApp.run('app-002', 'adm-2026', 'Zainab Danjuma', 'SS 1 Science', 'Col. Garba Danjuma', '+234 803 777 4422', 'danjuma.g@gov.ng', '2026-10-16', '94% (Distinction)', 'Offer Accepted', JSON.stringify(['Birth Certificate', 'Transcript', 'Character Testimonial']))

  // 14. Past Questions & Competitions
  const insertPq = db.prepare(`INSERT INTO past_questions (id, exam_body, year, subject, total_questions, duration, description) VALUES (?, ?, ?, ?, ?, ?, ?)`)
  insertPq.run('pq-waec-math-2024', 'WAEC WASSCE', 2024, 'General Mathematics', 50, '1 Hr 30 Mins', 'Official WAEC past question set featuring questions on quadratic graphs, circle geometry, trigonometry, and statistics.')
  insertPq.run('pq-jamb-phy-2025', 'JAMB UTME', 2025, 'Physics', 40, '1 Hour', 'Computer-Based Test simulation with timed speed drills, negative-marking toggle, and automated score projection.')
  insertPq.run('pq-igcse-chem-2025', 'Cambridge IGCSE', 2025, 'Chemistry (Extended)', 40, '45 Mins', 'Multiple-choice paper covering stoichiometry, organic chemistry, periodic trends, and titration calculations.')

  const insertComp = db.prepare(`INSERT INTO competitions (id, title, category, organizer, current_round, participants_count, leaderboard_json) VALUES (?, ?, ?, ?, ?, ?, ?)`)
  insertComp.run('comp-math-01', 'National Inter-School Mathematics Olympiad', 'Secondary STEM', 'National Mathematical Centre & Nwantas', 'Quarter-Finals (Live)', 420, JSON.stringify([
    { rank: 1, school: 'Apex International Academy', representative: 'Chidi Okonkwo', score: 98.4 },
    { rank: 2, school: 'Kingsway British College', representative: 'Oliver Davies', score: 96.8 },
    { rank: 3, school: 'Loyola Jesuit College', representative: 'Kamsi Okafor', score: 95.2 },
    { rank: 4, school: 'Corona Secondary School', representative: 'Tomiwa Johnson', score: 93.6 }
  ]))
  insertComp.run('comp-debate-01', 'Pan-African Youth Parliamentary Debate', 'Arts & Humanities', 'Nwantas Educational Foundation', 'Semi-Finals', 64, JSON.stringify([
    { rank: 1, school: 'Apex International Academy', representative: 'Amina Bello', score: 97.0 },
    { rank: 2, school: 'Atlantic Hall', representative: 'Opeoluwa Adeleke', score: 94.5 },
    { rank: 3, school: 'Day Waterman College', representative: 'Zainab Danjuma', score: 92.0 }
  ]))

  // 15. Government Regulatory Compliance
  const insertGov = db.prepare(`
    INSERT INTO government_compliance (id, tenant_id, accreditation_rating, last_audit_date, inspector_lead, curriculum_compliance, categories_json, citations_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertGov.run(
    'gov-apex',
    'apex-academy',
    'Grade A1 (Exemplary)',
    'September 2026',
    'Hon. Miriam Bello (Federal Ministry of Education)',
    '100% NERDC / Cambridge Dual Alignment',
    JSON.stringify([
      { name: 'Teacher Certification & TRCN Compliance', score: '98%', status: 'Compliant' },
      { name: 'Science & Computer Lab Specifications', score: '95%', status: 'Compliant' },
      { name: 'Child Safeguarding & Exeat Gate Controls', score: '100%', status: 'Exemplary' },
      { name: 'Fire Safety & Hostel Density Standards', score: '92%', status: 'Compliant' }
    ]),
    JSON.stringify([
      { id: 'cit-01', title: 'Routine Lab Fire Extinguisher Inspection Update', severity: 'Low', dateIssued: '2026-09-14', status: 'Resolved & Signed Off' }
    ])
  )
}
