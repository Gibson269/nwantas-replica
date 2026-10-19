-- Nwantas Complete School Management Platform
-- Relational Database Schema (SQLite / PostgreSQL Compatible DDL)

-- 1. Multi-Tenant Institutions
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  motto TEXT,
  currency TEXT DEFAULT 'NGN',
  symbol TEXT DEFAULT '₦',
  address TEXT,
  country TEXT DEFAULT 'Nigeria',
  email TEXT,
  phone TEXT,
  plan_id TEXT DEFAULT 'school_plus',
  academic_year TEXT DEFAULT '2025/2026',
  current_term TEXT DEFAULT 'Second Term',
  wallet_balance REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & RBAC Personas
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  role_title TEXT NOT NULL,
  avatar TEXT,
  permissions_json TEXT DEFAULT '[]',
  meta_json TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 3. Classes & Academic Arms
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  level TEXT NOT NULL,
  arm TEXT NOT NULL,
  display_name TEXT NOT NULL,
  form_teacher TEXT,
  student_count INTEGER DEFAULT 0,
  capacity INTEGER DEFAULT 35,
  subjects_json TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 4. Students (SIS)
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  admission_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class_arm_id TEXT NOT NULL,
  class_arm_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  guardian_name TEXT NOT NULL,
  guardian_phone TEXT NOT NULL,
  guardian_email TEXT,
  guardian_relationship TEXT,
  guardian_photo TEXT,
  avatar TEXT,
  status TEXT DEFAULT 'Active',
  attendance_rate REAL DEFAULT 100.0,
  fee_status TEXT DEFAULT 'Paid in Full',
  fee_amount_due REAL DEFAULT 0,
  hostel_building TEXT,
  hostel_room TEXT,
  hostel_bed TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (class_arm_id) REFERENCES classes(id)
);

-- 5. AI Lesson Notes
CREATE TABLE IF NOT EXISTS lesson_notes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  class_level TEXT NOT NULL,
  term TEXT DEFAULT 'Second Term',
  week INTEGER DEFAULT 1,
  author TEXT NOT NULL,
  author_role TEXT NOT NULL,
  status TEXT DEFAULT 'Draft',
  objectives_json TEXT DEFAULT '[]',
  prerequisites TEXT,
  materials_json TEXT DEFAULT '[]',
  sections_json TEXT DEFAULT '[]',
  assessment_questions_json TEXT DEFAULT '[]',
  comments_json TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 6. CBT Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'CBT Exam',
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 45,
  total_marks INTEGER DEFAULT 40,
  instructions TEXT,
  anti_cheat_enabled INTEGER DEFAULT 1,
  is_published INTEGER DEFAULT 1,
  questions_json TEXT DEFAULT '[]',
  submissions_count INTEGER DEFAULT 0,
  average_score REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 7. Anti-Cheat Monitoring Telemetry Logs
CREATE TABLE IF NOT EXISTS anti_cheat_events (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id)
);

-- 8. Assessment Submissions
CREATE TABLE IF NOT EXISTS assessment_submissions (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  percentage REAL NOT NULL,
  passed INTEGER DEFAULT 1,
  results_json TEXT DEFAULT '[]',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id)
);

-- 9. Broadsheet & Gradebook Entries
CREATE TABLE IF NOT EXISTS gradebook_entries (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  admission_no TEXT NOT NULL,
  class_arm_id TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  ca_score REAL DEFAULT 0,
  midterm_score REAL DEFAULT 0,
  exam_score REAL DEFAULT 0,
  total_score REAL DEFAULT 0,
  letter_grade TEXT DEFAULT 'F9',
  gpa REAL DEFAULT 0.0,
  position INTEGER DEFAULT 1,
  teacher_remarks TEXT,
  principal_remarks TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 10. Bursary Wallets & Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_name TEXT,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  channel TEXT NOT NULL,
  status TEXT DEFAULT 'Success',
  date TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS fee_schedules (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT DEFAULT 'Mandatory',
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS payroll_runs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  month TEXT NOT NULL,
  total_staff INTEGER DEFAULT 0,
  gross_salary REAL DEFAULT 0,
  deductions REAL DEFAULT 0,
  net_disbursement REAL DEFAULT 0,
  status TEXT DEFAULT 'Draft',
  disbursed_date TEXT,
  approved_by TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 11. Hostels & Bed Space Management
CREATE TABLE IF NOT EXISTS hostel_buildings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  warden TEXT NOT NULL,
  total_rooms INTEGER DEFAULT 0,
  total_beds INTEGER DEFAULT 0,
  occupied_beds INTEGER DEFAULT 0,
  vacant_beds INTEGER DEFAULT 0,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS hostel_beds (
  id TEXT PRIMARY KEY,
  building_id TEXT NOT NULL,
  building_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  bed_code TEXT NOT NULL,
  status TEXT DEFAULT 'Vacant',
  student_name TEXT,
  student_id TEXT,
  FOREIGN KEY (building_id) REFERENCES hostel_buildings(id)
);

-- 12. Campus Gate Security & Exeat
CREATE TABLE IF NOT EXISTS exeats (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_arm TEXT NOT NULL,
  type TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  expected_return TEXT NOT NULL,
  actual_return TEXT,
  status TEXT DEFAULT 'Approved',
  approved_by TEXT,
  guardian_pickup_name TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS guardian_pickups (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_arm TEXT NOT NULL,
  guardian_name TEXT NOT NULL,
  guardian_relationship TEXT NOT NULL,
  guardian_photo TEXT,
  pickup_date TEXT,
  status TEXT DEFAULT 'Verified & Cleared',
  verified_by TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 13. GoChats Real-Time Messenger
CREATE TABLE IF NOT EXISTS chat_rooms (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'group',
  description TEXT,
  unread_count INTEGER DEFAULT 0,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  sender_avatar TEXT,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  reactions_json TEXT DEFAULT '{}',
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id)
);

-- 14. Admissions Pipeline
CREATE TABLE IF NOT EXISTS admission_cycles (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  target_classes_json TEXT DEFAULT '[]',
  application_fee REAL DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'Open',
  applicants_count INTEGER DEFAULT 0,
  accepted_count INTEGER DEFAULT 0,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS admission_applications (
  id TEXT PRIMARY KEY,
  cycle_id TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applying_for_class TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  submission_date TEXT,
  entrance_exam_score TEXT DEFAULT 'Pending',
  status TEXT DEFAULT 'Under Review',
  documents_json TEXT DEFAULT '[]',
  FOREIGN KEY (cycle_id) REFERENCES admission_cycles(id)
);

-- 15. Past Questions & Competitions
CREATE TABLE IF NOT EXISTS past_questions (
  id TEXT PRIMARY KEY,
  exam_body TEXT NOT NULL,
  year INTEGER NOT NULL,
  subject TEXT NOT NULL,
  total_questions INTEGER DEFAULT 0,
  duration TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS competitions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  organizer TEXT NOT NULL,
  current_round TEXT,
  participants_count INTEGER DEFAULT 0,
  leaderboard_json TEXT DEFAULT '[]'
);

-- 16. Government Regulatory Compliance
CREATE TABLE IF NOT EXISTS government_compliance (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  accreditation_rating TEXT NOT NULL,
  last_audit_date TEXT,
  inspector_lead TEXT,
  curriculum_compliance TEXT,
  categories_json TEXT DEFAULT '[]',
  citations_json TEXT DEFAULT '[]',
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
