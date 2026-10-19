import { defineStore } from 'pinia'

export type PersonaRole =
  | 'master'
  | 'federal_staff'
  | 'state_staff'
  | 'school_owner'
  | 'admin'
  | 'Principal'
  | 'Registrar'
  | 'Bursar'
  | 'Teacher'
  | 'HostelWarden'
  | 'SecurityOfficer'
  | 'Student'
  | 'Parent'

export interface UserPersona {
  id: string
  name: string
  email: string
  role: PersonaRole
  roleTitle: string
  avatar: string
  schoolId: string
  schoolName: string
  permissions: string[]
  meta?: Record<string, any>
}

export const PERSONA_PROFILES: Record<PersonaRole, UserPersona> = {
  master: {
    id: 'usr-master-01',
    name: 'Dr. Gregory Vance',
    email: 'master@nwantas.com',
    role: 'master',
    roleTitle: 'Superadmin / System Master',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    schoolId: 'global',
    schoolName: 'Nwantas Cloud Network',
    permissions: ['all', 'manage_tenants', 'system_config', 'global_reports']
  },
  federal_staff: {
    id: 'usr-fed-01',
    name: 'Hon. Miriam Bello',
    email: 'inspector.bello@education.gov.ng',
    role: 'federal_staff',
    roleTitle: 'Federal Ministry Inspector',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    schoolId: 'apex-academy',
    schoolName: 'Apex International Academy',
    permissions: ['view_compliance', 'issue_citations', 'audit_schools', 'curriculum_oversight']
  },
  state_staff: {
    id: 'usr-state-01',
    name: 'Engr. Tunde Lawal',
    email: 'tunde.lawal@lagosstate.gov.ng',
    role: 'state_staff',
    roleTitle: 'State Quality Assurance Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    schoolId: 'apex-academy',
    schoolName: 'Apex International Academy',
    permissions: ['view_compliance', 'audit_schools']
  },
  school_owner: {
    id: 'usr-owner-01',
    name: 'Chief Anthony Balogun',
    email: 'proprietor@apexacademy.edu.ng',
    role: 'school_owner',
    roleTitle: 'School Proprietor / Owner',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    schoolId: 'apex-academy',
    schoolName: 'Apex International Academy',
    permissions: ['owner_billing', 'view_exec_reports', 'manage_payroll', 'manage_staff', 'all_school']
  },
  admin: {
    id: 'usr-admin-01',
    name: 'Mrs. Folake Adeyemi',
    email: 'folake.admin@apexacademy.edu.ng',
    role: 'admin',
    roleTitle: 'School Administrator',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    schoolId: 'apex-academy',
    schoolName: 'Apex International Academy',
    permissions: ['manage_classes', 'manage_students', 'manage_admissions', 'manage_staff', 'approve_notes']
  },
  Principal: {
    id: 'usr-princ-01',
    name: 'Dr. Chukwuemeka Eze',
    email: 'principal@apexacademy.edu.ng',
    role: 'Principal',
    roleTitle: 'Principal / Head of School',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    schoolId: 'apex-academy',
    schoolName: 'Apex International Academy',
    permissions: ['approve_notes', 'sign_report_cards', 'manage_classes', 'view_students', 'broadsheet_signoff']
  },
  Registrar: {
    id: 'usr-reg-01',
    name: 'Mrs. Ngozi Okeke',
    email: 'registrar@apexacademy.edu.ng',
    role: 'Registrar',
    roleTitle: 'Academic Registrar',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    schoolId: 'apex-academy',
    schoolName: 'Apex International Academy',
    permissions: ['collate_grades', 'manage_promotions', 'issue_certificates', 'manage_students']
  },
  Bursar: {
    id: 'usr-bursar-01',
    name: 'Alhaji Ibrahim Usman',
    email: 'bursar@apexacademy.edu.ng',
    role: 'Bursar',
    roleTitle: 'Bursar & Finance Director',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    schoolId: 'apex-academy',
    schoolName: 'Apex International Academy',
    permissions: ['manage_wallet', 'fee_schedules', 'process_payroll', 'reconcile_payments']
  },
  Teacher: {
    id: 'usr-teach-01',
    name: 'Mr. David Adeleke',
    email: 'david.adeleke@apexacademy.edu.ng',
    role: 'Teacher',
    roleTitle: 'Senior Mathematics & Physics Tutor',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    schoolId: 'apex-academy',
    schoolName: 'Apex International Academy',
    permissions: ['create_lesson_notes', 'mark_attendance', 'manage_assessments', 'enter_grades'],
    meta: {
      assignedClasses: ['SS2 Science', 'SS3 Physics'],
      subjects: ['Further Mathematics', 'Physics']
    }
  },
  HostelWarden: {
    id: 'usr-warden-01',
    name: 'Mrs. Grace Danjuma',
    email: 'warden@apexacademy.edu.ng',
    role: 'HostelWarden',
    roleTitle: 'Chief Hostel Warden',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    schoolId: 'apex-academy',
    schoolName: 'Apex International Academy',
    permissions: ['manage_hostels', 'allocate_beds', 'hostel_attendance', 'sign_in_out']
  },
  SecurityOfficer: {
    id: 'usr-sec-01',
    name: 'Officer Samuel Mensah',
    email: 'security.gate1@apexacademy.edu.ng',
    role: 'SecurityOfficer',
    roleTitle: 'Chief Campus Security Officer',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    schoolId: 'apex-academy',
    schoolName: 'Apex International Academy',
    permissions: ['verify_exeat', 'verify_pickup', 'log_gate_entry', 'dispatch_incident']
  },
  Student: {
    id: 'usr-stud-01',
    name: 'Chidi Okonkwo',
    email: 'chidi.okonkwo@student.apexacademy.edu.ng',
    role: 'Student',
    roleTitle: 'SS 2 Science Student (Admission #APX-2023-084)',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    schoolId: 'apex-academy',
    schoolName: 'Apex International Academy',
    permissions: ['take_cbt', 'view_timetable', 'use_ai_tutor', 'view_report_card', 'request_exeat'],
    meta: {
      classArm: 'SS 2 Science',
      admissionNo: 'APX-2023-084',
      hostelBed: 'Nelson Mandela Hall - Room 204 Bed B'
    }
  },
  Parent: {
    id: 'usr-parent-01',
    name: 'Dr. & Mrs. Kenneth Okonkwo',
    email: 'k.okonkwo@family.org',
    role: 'Parent',
    roleTitle: 'Parent / Guardian',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    schoolId: 'apex-academy',
    schoolName: 'Apex International Academy',
    permissions: ['view_child_records', 'pay_school_fees', 'book_office_hours', 'approve_pickup'],
    meta: {
      children: [
        {
          id: 'usr-stud-01',
          name: 'Chidi Okonkwo',
          classArm: 'SS 2 Science',
          admissionNo: 'APX-2023-084',
          attendanceRate: '98.5%',
          feeStatus: 'Paid in Full',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
        },
        {
          id: 'usr-stud-02',
          name: 'Adaeze Okonkwo',
          classArm: 'JSS 1 Gold',
          admissionNo: 'APX-2025-112',
          attendanceRate: '100%',
          feeStatus: '₦120,000 Pending',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
        }
      ]
    }
  }
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<UserPersona>(PERSONA_PROFILES.admin)
  const isAuthenticated = ref(true)
  const token = ref('jwt-session-apex-token-2026')
  const activeChildIndex = ref(0)

  // Switch persona seamlessly for demonstration and role validation
  function switchPersona(role: PersonaRole) {
    if (PERSONA_PROFILES[role]) {
      currentUser.value = { ...PERSONA_PROFILES[role] }
      isAuthenticated.value = true
    }
  }

  function setAuthenticatedUser(user: UserPersona, jwtToken: string) {
    currentUser.value = user
    token.value = jwtToken
    isAuthenticated.value = true
  }

  function logout() {
    isAuthenticated.value = false
    currentUser.value = PERSONA_PROFILES.admin
  }

  const activeChild = computed(() => {
    if (currentUser.value.role === 'Parent' && currentUser.value.meta?.children) {
      return currentUser.value.meta.children[activeChildIndex.value] || currentUser.value.meta.children[0]
    }
    return null
  })

  function selectChild(index: number) {
    activeChildIndex.value = index
  }

  function hasPermission(perm: string): boolean {
    if (!currentUser.value) return false
    if (currentUser.value.permissions.includes('all') || currentUser.value.permissions.includes('all_school')) {
      return true
    }
    return currentUser.value.permissions.includes(perm)
  }

  return {
    currentUser,
    isAuthenticated,
    token,
    activeChildIndex,
    activeChild,
    switchPersona,
    setAuthenticatedUser,
    logout,
    selectChild,
    hasPermission
  }
})
