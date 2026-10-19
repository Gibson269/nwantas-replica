// Central in-memory reactive database for the Nwantas End-to-End Replica

export interface SchoolRecord {
  id: string
  name: string
  slug: string
  motto: string
  currency: 'NGN' | 'GBP' | 'USD'
  symbol: string
  address: string
  country: string
  email: string
  phone: string
  planId: string
  totalEnrolled: number
  totalStaff: number
  walletBalance: number
}

export interface ClassArmRecord {
  id: string
  level: string // e.g. JSS 1, SS 2
  arm: string // e.g. Gold, Science, Diamond
  displayName: string
  formTeacher: string
  studentCount: number
  capacity: number
  subjects: string[]
}

export interface StudentRecord {
  id: string
  schoolId: string
  name: string
  admissionNo: string
  classArmId: string
  classArmName: string
  gender: 'Male' | 'Female'
  dateOfBirth: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  guardianRelationship: string
  guardianPhoto: string
  avatar: string
  status: 'Active' | 'Suspended' | 'Graduated'
  attendanceRate: number
  feeStatus: 'Paid in Full' | 'Partial' | 'Unpaid'
  feeAmountDue: number
  hostelInfo?: {
    building: string
    room: string
    bed: string
  }
}

export interface LessonNoteRecord {
  id: string
  schoolId: string
  subject: string
  topic: string
  classLevel: string
  term: string
  week: number
  author: string
  authorRole: string
  status: 'Draft' | 'Submitted' | 'HOD Approved' | 'Principal Approved'
  objectives: string[]
  prerequisites: string
  materials: string[]
  contentSections: { title: string; body: string }[]
  assessmentQuestions: string[]
  comments: { id: string; author: string; role: string; text: string; date: string }[]
  createdAt: string
  updatedAt: string
}

export interface CBTQuestion {
  id: string
  questionText: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface AssessmentRecord {
  id: string
  schoolId: string
  title: string
  type: 'CBT Exam' | 'Midterm Test' | 'Continuous Assessment' | 'Practice Quiz'
  subject: string
  classLevel: string
  durationMinutes: number
  totalMarks: number
  instructions: string
  antiCheatEnabled: boolean
  isPublished: boolean
  questions: CBTQuestion[]
  submissionsCount: number
  averageScore?: number
}

export interface AntiCheatEventRecord {
  id: string
  assessmentId: string
  studentId: string
  studentName: string
  eventType: 'tab_switch' | 'window_blur' | 'copy_paste_attempt' | 'fullscreen_exit'
  details: string
  timestamp: string
}

export interface GradeEntry {
  studentId: string
  studentName: string
  admissionNo: string
  caScore: number // max 20
  midtermScore: number // max 20
  examScore: number // max 60
  totalScore: number // max 100
  letterGrade: string
  gpa: number
  position: number
  teacherRemarks: string
  principalRemarks: string
}

export interface ExeatRecord {
  id: string
  schoolId: string
  studentId: string
  studentName: string
  classArm: string
  type: 'Medical' | 'Weekend Exeat' | 'Emergency' | 'Day Pass'
  departureTime: string
  expectedReturn: string
  actualReturn?: string
  status: 'Pending' | 'Approved' | 'Departed' | 'Returned' | 'Overdue'
  approvedBy: string
  guardianPickupName: string
}

export interface PickupRecord {
  id: string
  schoolId: string
  studentId: string
  studentName: string
  classArm: string
  guardianName: string
  guardianRelationship: string
  guardianPhoto: string
  pickupDate: string
  status: 'Verified & Cleared' | 'Flagged'
  verifiedBy: string
}

export interface HostelBedRecord {
  id: string
  buildingName: string
  roomNumber: string
  bedCode: string
  status: 'Occupied' | 'Vacant' | 'Maintenance'
  studentName?: string
  studentId?: string
}

export interface GoChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderRole: string
  senderAvatar: string
  text: string
  timestamp: string
  reactions: Record<string, number>
}

// Global In-Memory Store
export const db = {
  schools: [
    {
      id: 'apex-academy',
      name: 'Apex International Academy',
      slug: 'apex-academy',
      motto: 'Excellence, Character & Global Leadership',
      currency: 'NGN',
      symbol: '₦',
      address: 'Plot 14 Admiralty Way, Lekki Phase 1, Lagos State',
      country: 'Nigeria',
      email: 'admissions@apexacademy.edu.ng',
      phone: '+234 1 800 2739',
      planId: 'school_plus',
      totalEnrolled: 1420,
      totalStaff: 86,
      walletBalance: 48650000
    },
    {
      id: 'kingsway-college',
      name: 'Kingsway British College',
      slug: 'kingsway',
      motto: 'Knowledge is Power & Distinction',
      currency: 'GBP',
      symbol: '£',
      address: '22 Kensington Church Street, London W8 4EP',
      country: 'United Kingdom',
      email: 'info@kingswaycollege.co.uk',
      phone: '+44 20 7946 0192',
      planId: 'enterprise',
      totalEnrolled: 820,
      totalStaff: 54,
      walletBalance: 245000
    }
  ] as SchoolRecord[],

  classes: [
    {
      id: 'cls-jss1-gold',
      level: 'JSS 1',
      arm: 'Gold',
      displayName: 'JSS 1 Gold',
      formTeacher: 'Mrs. Chioma Eze',
      studentCount: 32,
      capacity: 35,
      subjects: ['Mathematics', 'English Language', 'Basic Science', 'Social Studies', 'Civic Education']
    },
    {
      id: 'cls-jss2-diamond',
      level: 'JSS 2',
      arm: 'Diamond',
      displayName: 'JSS 2 Diamond',
      formTeacher: 'Mr. David Adeleke',
      studentCount: 30,
      capacity: 35,
      subjects: ['Mathematics', 'English Language', 'Basic Science', 'Agricultural Science', 'Computer Studies']
    },
    {
      id: 'cls-ss2-sci',
      level: 'SS 2',
      arm: 'Science',
      displayName: 'SS 2 Science',
      formTeacher: 'Dr. Chukwuemeka Eze',
      studentCount: 28,
      capacity: 30,
      subjects: ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Further Mathematics']
    },
    {
      id: 'cls-ss3-arts',
      level: 'SS 3',
      arm: 'Arts & Humanities',
      displayName: 'SS 3 Arts',
      formTeacher: 'Mrs. Folake Adeyemi',
      studentCount: 26,
      capacity: 30,
      subjects: ['English Language', 'Literature in English', 'Government', 'Economics', 'Civic Education']
    }
  ] as ClassArmRecord[],

  students: [
    {
      id: 'usr-stud-01',
      schoolId: 'apex-academy',
      name: 'Chidi Okonkwo',
      admissionNo: 'APX-2023-084',
      classArmId: 'cls-ss2-sci',
      classArmName: 'SS 2 Science',
      gender: 'Male',
      dateOfBirth: '2009-04-12',
      guardianName: 'Dr. Kenneth Okonkwo',
      guardianPhone: '+234 803 555 1234',
      guardianEmail: 'k.okonkwo@family.org',
      guardianRelationship: 'Father',
      guardianPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      attendanceRate: 98.5,
      feeStatus: 'Paid in Full',
      feeAmountDue: 0,
      hostelInfo: {
        building: 'Nelson Mandela Hall',
        room: 'Room 204',
        bed: 'Bed B'
      }
    },
    {
      id: 'usr-stud-02',
      schoolId: 'apex-academy',
      name: 'Adaeze Okonkwo',
      admissionNo: 'APX-2025-112',
      classArmId: 'cls-jss1-gold',
      classArmName: 'JSS 1 Gold',
      gender: 'Female',
      dateOfBirth: '2013-09-21',
      guardianName: 'Dr. Kenneth Okonkwo',
      guardianPhone: '+234 803 555 1234',
      guardianEmail: 'k.okonkwo@family.org',
      guardianRelationship: 'Father',
      guardianPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      attendanceRate: 100,
      feeStatus: 'Partial',
      feeAmountDue: 120000,
      hostelInfo: {
        building: 'Queen Amina Hostel',
        room: 'Room 102',
        bed: 'Bed A'
      }
    },
    {
      id: 'usr-stud-03',
      schoolId: 'apex-academy',
      name: 'Amina Bello',
      admissionNo: 'APX-2023-042',
      classArmId: 'cls-ss2-sci',
      classArmName: 'SS 2 Science',
      gender: 'Female',
      dateOfBirth: '2009-02-18',
      guardianName: 'Alhaji Sanusi Bello',
      guardianPhone: '+234 802 111 8899',
      guardianEmail: 'sanusi.bello@trade.gov.ng',
      guardianRelationship: 'Father',
      guardianPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      attendanceRate: 99.1,
      feeStatus: 'Paid in Full',
      feeAmountDue: 0
    },
    {
      id: 'usr-stud-04',
      schoolId: 'apex-academy',
      name: 'David Adeleke Jr.',
      admissionNo: 'APX-2024-067',
      classArmId: 'cls-jss2-diamond',
      classArmName: 'JSS 2 Diamond',
      gender: 'Male',
      dateOfBirth: '2011-11-05',
      guardianName: 'Mr. David Adeleke Sr.',
      guardianPhone: '+234 809 333 4455',
      guardianEmail: 'adeleke.fam@gmail.com',
      guardianRelationship: 'Father',
      guardianPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      attendanceRate: 96.4,
      feeStatus: 'Paid in Full',
      feeAmountDue: 0
    }
  ] as StudentRecord[],

  lessonNotes: [
    {
      id: 'ln-001',
      schoolId: 'apex-academy',
      subject: 'Physics',
      topic: 'Electromagnetic Induction & Faraday\'s Laws',
      classLevel: 'SS 2 Science',
      term: 'Second Term',
      week: 4,
      author: 'Mr. David Adeleke',
      authorRole: 'Senior Physics Tutor',
      status: 'Principal Approved',
      objectives: [
        'State and explain Faraday\'s laws of electromagnetic induction',
        'Demonstrate Lenz\'s law and explain energy conservation in magnetic flux',
        'Calculate induced electromotive force (EMF) using Faraday\'s equation: E = -N(dΦ/dt)'
      ],
      prerequisites: 'Magnetic fields, electric current, and vector dot products.',
      materials: [
        'Bar magnets and solenoid coils',
        'Sensitive center-zero galvanometer',
        'Connecting leads and iron core',
        'Interactive PhET simulator on school smartboard'
      ],
      contentSections: [
        {
          title: 'Introduction & Conceptual Hook (10 mins)',
          body: 'Connect a solenoid to a galvanometer. Move a bar magnet swiftly into the coil and prompt students to observe the needle deflection. Ask: Why did current flow when there is no battery connected?'
        },
        {
          title: 'Theoretical Exposition & Mathematical Formulation (25 mins)',
          body: 'Introduce magnetic flux Φ = B · A · cos(θ). Formulate Faraday\'s First and Second Laws. Emphasize Lenz\'s law: the negative sign represents opposition to the magnetic flux change producing it.'
        },
        {
          title: 'Guided Problem Solving & Hands-on Activity (30 mins)',
          body: 'Distribute coils and galvanometers to lab groups. Students record needle deflection magnitude and polarity at varying magnet insertion speeds.'
        }
      ],
      assessmentQuestions: [
        'A coil of 200 turns is placed in a magnetic field that changes from 0.2T to 0.8T in 0.05 seconds. If the cross-sectional area is 0.04 m², calculate the induced EMF.',
        'How does Lenz\'s law demonstrate the law of conservation of energy?'
      ],
      comments: [
        {
          id: 'c-1',
          author: 'Dr. Chukwuemeka Eze',
          role: 'Principal',
          text: 'Comprehensive pedagogical alignment. Approved for classroom delivery.',
          date: '2026-10-18 14:20'
        }
      ],
      createdAt: '2026-10-17 09:30',
      updatedAt: '2026-10-18 14:20'
    }
  ] as LessonNoteRecord[],

  assessments: [
    {
      id: 'asm-cbt-01',
      schoolId: 'apex-academy',
      title: 'SS 2 Physics Midterm CBT Examination',
      type: 'CBT Exam',
      subject: 'Physics',
      classLevel: 'SS 2 Science',
      durationMinutes: 45,
      totalMarks: 40,
      instructions: 'Anti-cheat monitoring is active. Do not switch tabs, exit fullscreen, or attempt copy-pasting. All events are logged to the proctoring console.',
      antiCheatEnabled: true,
      isPublished: true,
      questions: [
        {
          id: 'q-1',
          questionText: 'Faraday\'s law states that the induced electromotive force in any closed circuit is equal to:',
          options: [
            'The negative time rate of change of magnetic flux through the circuit',
            'The electrostatic potential difference between the terminals',
            'The total resistance divided by the current in the coil',
            'The cross product of the electric field and drift velocity'
          ],
          correctIndex: 0,
          explanation: 'Faraday\'s law is given by E = -N(dΦ/dt), where the induced EMF is directly proportional to the rate of change of magnetic flux.'
        },
        {
          id: 'q-2',
          questionText: 'Which law of physics explains the negative sign in Faraday\'s formula E = -dΦ/dt?',
          options: [
            'Coulomb\'s Law',
            'Lenz\'s Law (Conservation of Energy)',
            'Ampere\'s Circuital Law',
            'Gauss\'s Law for Magnetism'
          ],
          correctIndex: 1,
          explanation: 'Lenz\'s law dictates that the direction of induced current opposes the change causing it, preserving energy conservation.'
        },
        {
          id: 'q-3',
          questionText: 'A step-up transformer has 100 turns in the primary coil and 500 turns in the secondary coil. If the input voltage is 240V, what is the output voltage?',
          options: [
            '48V',
            '1,200V',
            '2,400V',
            '120V'
          ],
          correctIndex: 1,
          explanation: 'Vs / Vp = Ns / Np => Vs = 240 * (500 / 100) = 240 * 5 = 1,200V.'
        },
        {
          id: 'q-4',
          questionText: 'Which particle does not experience any magnetic deflection when moving through a uniform magnetic field?',
          options: [
            'Proton',
            'Alpha particle',
            'Neutron',
            'Beta particle'
          ],
          correctIndex: 2,
          explanation: 'Magnetic force F = q(v × B). Because a neutron has zero charge (q = 0), it experiences no magnetic force.'
        }
      ],
      submissionsCount: 24,
      averageScore: 32.5
    }
  ] as AssessmentRecord[],

  antiCheatEvents: [
    {
      id: 'ace-001',
      assessmentId: 'asm-cbt-01',
      studentId: 'usr-stud-04',
      studentName: 'David Adeleke Jr.',
      eventType: 'tab_switch',
      details: 'Switched away from examination tab for 4.2 seconds.',
      timestamp: '2026-10-19 10:14:22'
    }
  ] as AntiCheatEventRecord[],

  gradebook: [
    {
      studentId: 'usr-stud-01',
      studentName: 'Chidi Okonkwo',
      admissionNo: 'APX-2023-084',
      caScore: 19,
      midtermScore: 18,
      examScore: 54,
      totalScore: 91,
      letterGrade: 'A1',
      gpa: 5.0,
      position: 1,
      teacherRemarks: 'Exceptional mastery of physical concepts and mathematical reasoning.',
      principalRemarks: 'Outstanding result. Keep sustaining this academic distinction.'
    },
    {
      studentId: 'usr-stud-03',
      studentName: 'Amina Bello',
      admissionNo: 'APX-2023-042',
      caScore: 18,
      midtermScore: 17,
      examScore: 51,
      totalScore: 86,
      letterGrade: 'A1',
      gpa: 5.0,
      position: 2,
      teacherRemarks: 'Brilliant analytical problem solver and active classroom contributor.',
      principalRemarks: 'Commendable performance.'
    }
  ] as GradeEntry[],

  exeats: [
    {
      id: 'ext-101',
      schoolId: 'apex-academy',
      studentId: 'usr-stud-01',
      studentName: 'Chidi Okonkwo',
      classArm: 'SS 2 Science',
      type: 'Weekend Exeat',
      departureTime: '2026-10-19 15:30',
      expectedReturn: '2026-10-21 17:00',
      status: 'Approved',
      approvedBy: 'Mrs. Folake Adeyemi (Admin)',
      guardianPickupName: 'Dr. Kenneth Okonkwo'
    },
    {
      id: 'ext-102',
      schoolId: 'apex-academy',
      studentId: 'usr-stud-04',
      studentName: 'David Adeleke Jr.',
      classArm: 'JSS 2 Diamond',
      type: 'Medical',
      departureTime: '2026-10-19 11:00',
      expectedReturn: '2026-10-19 16:00',
      status: 'Departed',
      approvedBy: 'Dr. Chukwuemeka Eze (Principal)',
      guardianPickupName: 'Mr. David Adeleke Sr.'
    }
  ] as ExeatRecord[],

  pickups: [
    {
      id: 'pkp-01',
      schoolId: 'apex-academy',
      studentId: 'usr-stud-01',
      studentName: 'Chidi Okonkwo',
      classArm: 'SS 2 Science',
      guardianName: 'Dr. Kenneth Okonkwo',
      guardianRelationship: 'Father',
      guardianPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      pickupDate: '2026-10-19 11:15 AM',
      status: 'Verified & Cleared',
      verifiedBy: 'Officer Samuel Mensah (Gate 1)'
    }
  ] as PickupRecord[],

  hostelBeds: [
    { id: 'b-01', buildingName: 'Nelson Mandela Hall', roomNumber: 'Room 204', bedCode: 'Bed A', status: 'Vacant' },
    { id: 'b-02', buildingName: 'Nelson Mandela Hall', roomNumber: 'Room 204', bedCode: 'Bed B', status: 'Occupied', studentName: 'Chidi Okonkwo', studentId: 'usr-stud-01' },
    { id: 'b-03', buildingName: 'Queen Amina Hostel', roomNumber: 'Room 102', bedCode: 'Bed A', status: 'Occupied', studentName: 'Adaeze Okonkwo', studentId: 'usr-stud-02' },
    { id: 'b-04', buildingName: 'Queen Amina Hostel', roomNumber: 'Room 102', bedCode: 'Bed B', status: 'Vacant' }
  ] as HostelBedRecord[],

  chatRooms: [
    {
      id: 'rm-staff-general',
      name: 'All Academic Staff',
      type: 'group',
      description: 'Institutional announcements and academic coordination',
      unreadCount: 2
    },
    {
      id: 'rm-science-dept',
      name: 'Science & Mathematics Faculty',
      type: 'group',
      description: 'Curriculum delivery, laboratory setups, and STEM coordination',
      unreadCount: 0
    },
    {
      id: 'rm-parents-ss2',
      name: 'SS 2 Parents & Teachers Association',
      type: 'group',
      description: 'Term updates and collaborative student progression',
      unreadCount: 1
    }
  ],

  chatMessages: [
    {
      id: 'msg-1',
      roomId: 'rm-staff-general',
      senderId: 'usr-princ-01',
      senderName: 'Dr. Chukwuemeka Eze (Principal)',
      senderRole: 'Principal',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      text: 'Good morning faculty. Please ensure all mid-term CBT question banks and CA score weightages are collated by close of work today.',
      timestamp: '08:45 AM',
      reactions: { '👍': 12, '✅': 8 }
    },
    {
      id: 'msg-2',
      roomId: 'rm-staff-general',
      senderId: 'usr-teach-01',
      senderName: 'Mr. David Adeleke',
      senderRole: 'Teacher',
      senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      text: 'SS2 Physics CBT test questions are uploaded and tested on the server. Anti-cheat proctoring is enabled.',
      timestamp: '09:12 AM',
      reactions: { '🙌': 5 }
    }
  ] as GoChatMessage[],

  governmentCompliance: {
    accreditationRating: 'Grade A1 (Exemplary)',
    lastAuditDate: 'September 2026',
    inspectorLead: 'Hon. Miriam Bello (Federal Ministry of Education)',
    curriculumCompliance: '100% NERDC / Cambridge Dual Alignment',
    categories: [
      { name: 'Teacher Certification & TRCN Compliance', score: '98%', status: 'Compliant' },
      { name: 'Science & Computer Lab Specifications', score: '95%', status: 'Compliant' },
      { name: 'Child Safeguarding & Exeat Gate Controls', score: '100%', status: 'Exemplary' },
      { name: 'Fire Safety & Hostel Density Standards', score: '92%', status: 'Compliant' }
    ],
    activeCitations: [
      {
        id: 'cit-01',
        title: 'Routine Lab Fire Extinguisher Inspection Update',
        severity: 'Low',
        dateIssued: '2026-09-14',
        status: 'Resolved & Signed Off'
      }
    ]
  },

  admissionCycles: [
    {
      id: 'adm-2026',
      title: '2026/2027 Academic Year Admissions',
      targetClasses: ['JSS 1', 'JSS 2', 'SS 1'],
      applicationFee: 15000,
      currency: 'NGN',
      startDate: '2026-01-10',
      endDate: '2026-08-30',
      status: 'Open',
      applicantsCount: 142,
      acceptedCount: 48
    }
  ],

  admissionApplications: [
    {
      id: 'app-001',
      applicantName: 'Tobiloba Williams',
      applyingForClass: 'JSS 1',
      parentName: 'Mrs. Janet Williams',
      parentPhone: '+234 802 999 4433',
      parentEmail: 'janet.williams@gmail.com',
      submissionDate: '2026-10-15',
      entranceExamScore: '84%',
      status: 'Under Review',
      documents: ['Birth Certificate', 'Primary 6 Result', 'Medical Clearance']
    },
    {
      id: 'app-002',
      applicantName: 'Faruq Al-Hassan',
      applyingForClass: 'SS 1 Science',
      parentName: 'Alhaji Bashir Al-Hassan',
      parentPhone: '+234 803 777 2211',
      parentEmail: 'bashir.al@yahoo.com',
      submissionDate: '2026-10-17',
      entranceExamScore: '92%',
      status: 'Accepted',
      documents: ['JSCE / BECE Certificate', 'Testimonial', 'Passport Photo']
    }
  ],

  pastQuestions: [
    {
      id: 'pq-waec-phy-2025',
      examBody: 'WAEC WASSCE',
      year: 2025,
      subject: 'Physics (Paper 2 & 1)',
      totalQuestions: 50,
      duration: '2 Hours 30 Mins',
      description: 'Official WASSCE examination paper covering Mechanics, Waves, Electricity & Modern Physics with step-by-step AI solutions.'
    },
    {
      id: 'pq-jamb-mth-2025',
      examBody: 'JAMB UTME',
      year: 2025,
      subject: 'Mathematics',
      totalQuestions: 40,
      duration: '1 Hour',
      description: 'Computer-Based Test simulation with timed speed drills, negative-marking toggle, and automated score projection.'
    },
    {
      id: 'pq-igcse-chem-2025',
      examBody: 'Cambridge IGCSE',
      year: 2025,
      subject: 'Chemistry (Extended)',
      totalQuestions: 40,
      duration: '45 Mins',
      description: 'Multiple-choice paper covering stoichiometry, organic chemistry, periodic trends, and titration calculations.'
    }
  ],

  competitions: [
    {
      id: 'comp-math-01',
      title: 'National Inter-School Mathematics Olympiad',
      category: 'Secondary STEM',
      organizer: 'National Mathematical Centre & Nwantas',
      currentRound: 'Quarter-Finals (Live)',
      participantsCount: 420,
      leaderboard: [
        { rank: 1, school: 'Apex International Academy', representative: 'Chidi Okonkwo', score: 98.4 },
        { rank: 2, school: 'Kingsway British College', representative: 'Oliver Davies', score: 96.8 },
        { rank: 3, school: 'Loyola Jesuit College', representative: 'Kamsi Okafor', score: 95.2 },
        { rank: 4, school: 'Corona Secondary School', representative: 'Tomiwa Johnson', score: 93.6 }
      ]
    },
    {
      id: 'comp-debate-01',
      title: 'Pan-African Youth Parliamentary Debate',
      category: 'Arts & Humanities',
      organizer: 'Nwantas Educational Foundation',
      currentRound: 'Semi-Finals',
      participantsCount: 64,
      leaderboard: [
        { rank: 1, school: 'Apex International Academy', representative: 'Amina Bello', score: 97.0 },
        { rank: 2, school: 'Atlantic Hall', representative: 'Opeoluwa Adeleke', score: 94.5 },
        { rank: 3, school: 'Day Waterman College', representative: 'Zainab Danjuma', score: 92.0 }
      ]
    }
  ]
}
