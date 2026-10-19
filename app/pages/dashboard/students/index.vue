<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Student Information System (SIS)'
})

const route = useRoute()
const { fetchApi } = useNwantasApi()

interface Student {
  id: string
  schoolId?: string
  tenantId?: string
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

interface ClassArm {
  id: string
  displayName: string
  level: string
  arm: string
  studentCount?: number
  capacity?: number
}

// State
const students = ref<Student[]>([])
const availableClasses = ref<ClassArm[]>([])
const stats = ref<any>({ total: 0, active: 0, male: 0, female: 0, boarders: 0, feeCompliant: 0 })
const isLoading = ref(true)

// Filters
const searchFilter = ref('')
const selectedClassFilter = ref((route.query.classArmId as string) || '')
const selectedStatusFilter = ref('')
const selectedFeeFilter = ref('')
const selectedGenderFilter = ref('')

// Modals
const isProfileModalOpen = ref(false)
const selectedStudent = ref<Student | null>(null)

const isEnrollModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const isSubmitting = ref(false)
const formStep = ref(1)
const feedbackMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

// Enrollment Form Data
const studentForm = reactive({
  name: '',
  admissionNo: '',
  gender: 'Male' as 'Male' | 'Female',
  dateOfBirth: '2010-04-12',
  avatar: '',
  classArmId: '',
  isBoarder: false,
  hostelBuilding: 'Nelson Mandela Hall',
  hostelRoom: 'Room 204',
  hostelBed: 'Bed B',
  guardianName: '',
  guardianRelationship: 'Father',
  guardianPhone: '',
  guardianEmail: '',
  guardianPhoto: '',
  feeStatus: 'Paid in Full' as 'Paid in Full' | 'Partial' | 'Unpaid',
  feeAmountDue: 0
})

async function loadData() {
  isLoading.value = true
  try {
    const [studentsRes, classesRes] = await Promise.all([
      fetchApi('/api/v1/students'),
      fetchApi('/api/v1/classes')
    ])
    students.value = studentsRes.data || []
    stats.value = studentsRes.stats || stats.value
    availableClasses.value = classesRes.data || []

    if (!studentForm.classArmId && availableClasses.value.length > 0) {
      studentForm.classArmId = availableClasses.value[0]?.id || ''
    }
  } catch (err: any) {
    console.error('Error loading SIS data:', err)
  } finally {
    isLoading.value = false
  }
}

// Filtered list
const filteredStudents = computed(() => {
  return students.value.filter(s => {
    const matchesSearch =
      !searchFilter.value ||
      s.name.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(searchFilter.value.toLowerCase())

    const matchesClass = !selectedClassFilter.value || s.classArmId === selectedClassFilter.value || s.classArmName === selectedClassFilter.value
    const matchesStatus = !selectedStatusFilter.value || s.status.toLowerCase() === selectedStatusFilter.value.toLowerCase()
    const matchesFee = !selectedFeeFilter.value || s.feeStatus === selectedFeeFilter.value
    const matchesGender = !selectedGenderFilter.value || s.gender === selectedGenderFilter.value

    return matchesSearch && matchesClass && matchesStatus && matchesFee && matchesGender
  })
})

function viewStudentProfile(student: Student) {
  selectedStudent.value = student
  isProfileModalOpen.value = true
}

function openEnrollModal() {
  isEditing.value = false
  editingId.value = null
  formStep.value = 1
  feedbackMessage.value = null

  // Reset form
  const year = new Date().getFullYear()
  const rand = Math.floor(100 + Math.random() * 900)
  studentForm.name = ''
  studentForm.admissionNo = `APX-${year}-${rand}`
  studentForm.gender = 'Male'
  studentForm.dateOfBirth = '2010-05-18'
  studentForm.avatar = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  studentForm.classArmId = availableClasses.value[0]?.id || 'cls-ss2-sci'
  studentForm.isBoarder = false
  studentForm.hostelBuilding = 'Nelson Mandela Hall'
  studentForm.hostelRoom = 'Room 204'
  studentForm.hostelBed = 'Bed A'
  studentForm.guardianName = ''
  studentForm.guardianRelationship = 'Father'
  studentForm.guardianPhone = '+234 803 ' + Math.floor(1000000 + Math.random() * 9000000)
  studentForm.guardianEmail = ''
  studentForm.guardianPhoto = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  studentForm.feeStatus = 'Paid in Full'
  studentForm.feeAmountDue = 0

  isEnrollModalOpen.value = true
}

function openEditModal(student: Student) {
  isEditing.value = true
  editingId.value = student.id
  formStep.value = 1
  feedbackMessage.value = null

  studentForm.name = student.name
  studentForm.admissionNo = student.admissionNo
  studentForm.gender = student.gender
  studentForm.dateOfBirth = student.dateOfBirth
  studentForm.avatar = student.avatar
  studentForm.classArmId = student.classArmId
  studentForm.isBoarder = Boolean(student.hostelInfo)
  studentForm.hostelBuilding = student.hostelInfo?.building || 'Nelson Mandela Hall'
  studentForm.hostelRoom = student.hostelInfo?.room || 'Room 101'
  studentForm.hostelBed = student.hostelInfo?.bed || 'Bed A'
  studentForm.guardianName = student.guardianName
  studentForm.guardianRelationship = student.guardianRelationship
  studentForm.guardianPhone = student.guardianPhone
  studentForm.guardianEmail = student.guardianEmail
  studentForm.guardianPhoto = student.guardianPhoto
  studentForm.feeStatus = student.feeStatus
  studentForm.feeAmountDue = student.feeAmountDue

  isEnrollModalOpen.value = true
}

function generateNewAdmissionNo() {
  const year = new Date().getFullYear()
  const rand = Math.floor(100 + Math.random() * 900)
  studentForm.admissionNo = `APX-${year}-${rand}`
}

async function handleSaveStudent() {
  if (!studentForm.name.trim() || !studentForm.classArmId) {
    feedbackMessage.value = { type: 'error', text: 'Full Name and Class Arm are required.' }
    return
  }

  isSubmitting.value = true
  feedbackMessage.value = null

  const assignedClass = availableClasses.value.find(c => c.id === studentForm.classArmId)
  const classArmName = assignedClass ? assignedClass.displayName : studentForm.classArmId

  const payload = {
    name: studentForm.name,
    admissionNo: studentForm.admissionNo,
    gender: studentForm.gender,
    dateOfBirth: studentForm.dateOfBirth,
    avatar: studentForm.avatar,
    classArmId: studentForm.classArmId,
    classArmName,
    guardianName: studentForm.guardianName || 'Parent / Sponsor',
    guardianRelationship: studentForm.guardianRelationship,
    guardianPhone: studentForm.guardianPhone,
    guardianEmail: studentForm.guardianEmail,
    guardianPhoto: studentForm.guardianPhoto,
    feeStatus: studentForm.feeStatus,
    feeAmountDue: studentForm.feeStatus === 'Paid in Full' ? 0 : (studentForm.feeAmountDue || 150000),
    hostelBuilding: studentForm.isBoarder ? studentForm.hostelBuilding : null,
    hostelRoom: studentForm.isBoarder ? studentForm.hostelRoom : null,
    hostelBed: studentForm.isBoarder ? studentForm.hostelBed : null
  }

  try {
    if (isEditing.value && editingId.value) {
      await fetchApi(`/api/v1/students/${editingId.value}`, {
        method: 'PUT',
        body: payload
      })
      feedbackMessage.value = { type: 'success', text: `Student ${studentForm.name} updated successfully!` }
    } else {
      await fetchApi('/api/v1/students', {
        method: 'POST',
        body: payload
      })
      feedbackMessage.value = { type: 'success', text: `Student ${studentForm.name} enrolled with ID ${studentForm.admissionNo}!` }
    }

    await loadData()
    setTimeout(() => {
      isEnrollModalOpen.value = false
      feedbackMessage.value = null
    }, 1200)
  } catch (err: any) {
    feedbackMessage.value = { type: 'error', text: err.data?.statusMessage || err.message || 'Operation failed' }
  } finally {
    isSubmitting.value = false
  }
}

async function handleUpdateStatus(student: Student, newStatus: string) {
  try {
    await fetchApi(`/api/v1/students/${student.id}/status`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    student.status = newStatus as any
    await loadData()
  } catch (err: any) {
    alert(err.data?.statusMessage || err.message || 'Status update failed')
  }
}

async function handleDeleteStudent(student: Student) {
  if (!confirm(`Are you sure you want to permanently remove student ${student.name} (${student.admissionNo}) from the SIS registry?`)) {
    return
  }

  try {
    await fetchApi(`/api/v1/students/${student.id}`, { method: 'DELETE' })
    await loadData()
  } catch (err: any) {
    alert(err.data?.statusMessage || err.message || 'Failed to remove student')
  }
}

function exportCsvRoster() {
  const headers = ['Admission No', 'Name', 'Class Arm', 'Gender', 'Date of Birth', 'Status', 'Attendance Rate', 'Bursary Status', 'Amount Due', 'Guardian Name', 'Guardian Phone', 'Boarding Space']
  const rows = filteredStudents.value.map(s => [
    s.admissionNo,
    `"${s.name}"`,
    `"${s.classArmName}"`,
    s.gender,
    s.dateOfBirth,
    s.status,
    `${s.attendanceRate}%`,
    s.feeStatus,
    s.feeAmountDue,
    `"${s.guardianName}"`,
    `"${s.guardianPhone}"`,
    s.hostelInfo ? `"${s.hostelInfo.building} (${s.hostelInfo.room})"` : 'Day Scholar'
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Nwantas_Student_Roster_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function clearAllFilters() {
  searchFilter.value = ''
  selectedClassFilter.value = ''
  selectedStatusFilter.value = ''
  selectedFeeFilter.value = ''
  selectedGenderFilter.value = ''
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-identification" class="w-3.5 h-3.5" />
          <span>STUDENT INFORMATION SYSTEM (SIS)</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Student Records & Lifecycle Registry</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Student bio-data, guardian verification, live attendance rates, boarding dormitories, and bursary fee status.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          title="Export Filtered Roster to CSV"
          @click="exportCsvRoster"
        >
          <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
          <span>Export CSV</span>
        </button>
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all cursor-pointer active:scale-95"
          @click="openEnrollModal"
        >
          <UIcon name="i-heroicons-user-plus" class="w-4 h-4" />
          <span>Enrol New Student</span>
        </button>
      </div>
    </div>

    <!-- Analytics KPI Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
        <span class="text-gray-400 font-mono text-[10px] uppercase font-bold block">Enrolled Registry</span>
        <div class="text-2xl font-extrabold text-gray-900 mt-1 font-mono">{{ stats.total }}</div>
        <span class="text-[10px] text-emerald-600 mt-1 block">{{ stats.active }} Active Students</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
        <span class="text-gray-400 font-mono text-[10px] uppercase font-bold block">Gender Breakdown</span>
        <div class="text-2xl font-extrabold text-gray-900 mt-1 font-mono">
          <span class="text-blue-600">{{ stats.male }}M</span> : <span class="text-pink-600">{{ stats.female }}F</span>
        </div>
        <span class="text-[10px] text-gray-500 mt-1 block">Balanced diversity</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
        <span class="text-gray-400 font-mono text-[10px] uppercase font-bold block">Boarders in Hostels</span>
        <div class="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">{{ stats.boarders }}</div>
        <span class="text-[10px] text-gray-500 mt-1 block">{{ stats.total - stats.boarders }} Day Scholars</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
        <span class="text-gray-400 font-mono text-[10px] uppercase font-bold block">Fee Compliance</span>
        <div class="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
          {{ stats.total ? Math.round((stats.feeCompliant / stats.total) * 100) : 0 }}%
        </div>
        <span class="text-[10px] text-gray-500 mt-1 block">{{ stats.feeCompliant }} of {{ stats.total }} Paid in Full</span>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <!-- Search -->
        <div class="sm:col-span-4 relative">
          <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            v-model="searchFilter"
            type="text"
            placeholder="Search by student, admission #, guardian..."
            class="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-xs border border-gray-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
        </div>

        <!-- Class Filter -->
        <div class="sm:col-span-3">
          <select
            v-model="selectedClassFilter"
            class="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs border border-gray-200 outline-none focus:border-emerald-500"
          >
            <option value="">All Academic Class Arms</option>
            <option v-for="c in availableClasses" :key="c.id" :value="c.id">
              {{ c.displayName }}
            </option>
          </select>
        </div>

        <!-- Fee Status Filter -->
        <div class="sm:col-span-2">
          <select
            v-model="selectedFeeFilter"
            class="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs border border-gray-200 outline-none focus:border-emerald-500"
          >
            <option value="">All Fee Statuses</option>
            <option value="Paid in Full">Paid in Full</option>
            <option value="Partial">Partial Payment</option>
            <option value="Unpaid">Unpaid / Arrears</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="sm:col-span-2">
          <select
            v-model="selectedStatusFilter"
            class="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs border border-gray-200 outline-none focus:border-emerald-500"
          >
            <option value="">All Enrolled Statuses</option>
            <option value="Active">Active Scholars</option>
            <option value="Suspended">Suspended</option>
            <option value="Graduated">Graduated Alumni</option>
          </select>
        </div>

        <!-- Reset Button -->
        <div class="sm:col-span-1 text-right">
          <button
            class="text-[11px] font-mono text-gray-500 hover:text-rose-600 underline cursor-pointer"
            @click="clearAllFilters"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Quick Filter Pills -->
      <div class="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div class="flex items-center gap-2">
          <span class="font-bold text-gray-700 font-mono">{{ filteredStudents.length }}</span> students matching filter criteria
          <span v-if="selectedClassFilter" class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Class Scoped</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            :class="['px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer', !selectedGenderFilter ? 'bg-gray-200 text-gray-800 font-bold' : 'text-gray-500']"
            @click="selectedGenderFilter = ''"
          >
            All Genders
          </button>
          <button
            :class="['px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer', selectedGenderFilter === 'Male' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-500']"
            @click="selectedGenderFilter = 'Male'"
          >
            Boys
          </button>
          <button
            :class="['px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer', selectedGenderFilter === 'Female' ? 'bg-pink-100 text-pink-800 font-bold' : 'text-gray-500']"
            @click="selectedGenderFilter = 'Female'"
          >
            Girls
          </button>
        </div>
      </div>
    </div>

    <!-- Student Table -->
    <div v-if="isLoading" class="p-16 text-center text-xs text-gray-400 font-mono">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
      Loading student records from SQLite database...
    </div>

    <div v-else-if="filteredStudents.length === 0" class="p-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
      <UIcon name="i-heroicons-identification" class="w-10 h-10 text-gray-300 mx-auto mb-2" />
      <h3 class="text-sm font-bold text-gray-800">No Students Found</h3>
      <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
        No student matches the current search or filter combination.
      </p>
      <div class="mt-4 flex items-center justify-center gap-3">
        <button
          class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 cursor-pointer"
          @click="clearAllFilters"
        >
          Clear Filters
        </button>
        <button
          class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer shadow-sm"
          @click="openEnrollModal"
        >
          Enrol New Student
        </button>
      </div>
    </div>

    <div v-else class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50/70 text-gray-400 font-mono uppercase text-[10px]">
              <th class="py-3 px-4">Student Dossier</th>
              <th class="py-3 px-4">Admission #</th>
              <th class="py-3 px-4">Class Placement</th>
              <th class="py-3 px-4">Boarding Space</th>
              <th class="py-3 px-4">Attendance</th>
              <th class="py-3 px-4">Bursary Status</th>
              <th class="py-3 px-4">Verified Guardian</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="st in filteredStudents" :key="st.id" class="hover:bg-gray-50/60 transition-colors">
              <!-- Student Bio -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <img :src="st.avatar" :alt="st.name" class="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200">
                  <div>
                    <div class="font-bold text-gray-900 hover:text-emerald-700 cursor-pointer" @click="viewStudentProfile(st)">
                      {{ st.name }}
                    </div>
                    <div class="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <span>{{ st.gender }}</span>
                      <span>&bull;</span>
                      <span>DOB: {{ st.dateOfBirth }}</span>
                      <span>&bull;</span>
                      <span :class="st.status === 'Active' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'">
                        {{ st.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Admission No -->
              <td class="py-3.5 px-4 font-mono font-bold text-gray-700">
                {{ st.admissionNo }}
              </td>

              <!-- Class Arm -->
              <td class="py-3.5 px-4">
                <span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  {{ st.classArmName }}
                </span>
              </td>

              <!-- Boarding Space -->
              <td class="py-3.5 px-4">
                <div v-if="st.hostelInfo" class="flex items-center gap-1.5 text-xs text-gray-700">
                  <UIcon name="i-heroicons-home" class="w-3.5 h-3.5 text-emerald-600" />
                  <span>{{ st.hostelInfo.room }} ({{ st.hostelInfo.bed }})</span>
                </div>
                <div v-else class="text-gray-400 text-[11px] italic">
                  Day Scholar
                </div>
              </td>

              <!-- Attendance Rate -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-bold text-emerald-600">{{ st.attendanceRate }}%</span>
                  <div class="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full" :style="{ width: `${st.attendanceRate}%` }" />
                  </div>
                </div>
              </td>

              <!-- Bursary Status -->
              <td class="py-3.5 px-4">
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold',
                    st.feeStatus === 'Paid in Full' ? 'bg-emerald-100 text-emerald-800' : st.feeStatus === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  ]"
                >
                  {{ st.feeStatus }}
                </span>
                <span v-if="st.feeAmountDue > 0" class="block text-[10px] text-gray-400 font-mono mt-0.5">
                  ₦{{ st.feeAmountDue.toLocaleString() }} due
                </span>
              </td>

              <!-- Guardian Contact -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2">
                  <img :src="st.guardianPhoto" :alt="st.guardianName" class="w-6 h-6 rounded-full object-cover">
                  <div>
                    <div class="text-gray-900 font-semibold leading-tight">{{ st.guardianName }}</div>
                    <div class="text-[10px] text-gray-500 font-mono">{{ st.guardianPhone }}</div>
                  </div>
                </div>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    class="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="View Full Profile Dossier"
                    @click="viewStudentProfile(st)"
                  >
                    <UIcon name="i-heroicons-identification" class="w-4 h-4" />
                  </button>
                  <button
                    class="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Edit Student Record"
                    @click="openEditModal(st)"
                  >
                    <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                  </button>
                  <button
                    class="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove Student Record"
                    @click="handleDeleteStudent(st)"
                  >
                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: View Student Full Profile Dossier -->
    <div
      v-if="isProfileModalOpen && selectedStudent"
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isProfileModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <img :src="selectedStudent.avatar" :alt="selectedStudent.name" class="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-xs">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold text-gray-900">{{ selectedStudent.name }}</h3>
                <span :class="['px-2 py-0.5 rounded-full text-[10px] font-mono font-bold', selectedStudent.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800']">
                  {{ selectedStudent.status }}
                </span>
              </div>
              <p class="text-xs text-gray-500 font-mono mt-0.5">
                {{ selectedStudent.admissionNo }} &bull; {{ selectedStudent.classArmName }} &bull; {{ selectedStudent.gender }}
              </p>
            </div>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700" @click="isProfileModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Dossier Body -->
        <div class="space-y-4 py-4 overflow-y-auto text-xs">
          <!-- Academic & Attendance Performance -->
          <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100 grid grid-cols-3 gap-3">
            <div>
              <span class="text-gray-400 font-mono text-[10px] uppercase font-bold block">DATE OF BIRTH</span>
              <span class="font-bold text-gray-900">{{ selectedStudent.dateOfBirth }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] uppercase font-bold block">ATTENDANCE</span>
              <span class="font-bold text-emerald-600 font-mono">{{ selectedStudent.attendanceRate }}% Present</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] uppercase font-bold block">BURSARY STATUS</span>
              <span class="font-bold text-gray-900">{{ selectedStudent.feeStatus }}</span>
            </div>
          </div>

          <!-- Verified Guardian Card -->
          <div class="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40">
            <div class="flex items-center justify-between mb-2">
              <span class="text-emerald-900 font-mono text-[10px] uppercase font-bold">VERIFIED GUARDIAN (CAMPUS GATE CLEARANCE)</span>
              <span class="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">Bio-Matched</span>
            </div>
            <div class="flex items-center gap-3">
              <img :src="selectedStudent.guardianPhoto" :alt="selectedStudent.guardianName" class="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30">
              <div class="space-y-0.5">
                <div class="font-bold text-gray-900 text-sm">
                  {{ selectedStudent.guardianName }} <span class="text-xs font-normal text-gray-600">({{ selectedStudent.guardianRelationship }})</span>
                </div>
                <div class="text-xs text-gray-600 font-mono flex items-center gap-3">
                  <span>{{ selectedStudent.guardianPhone }}</span>
                  <span v-if="selectedStudent.guardianEmail">&bull; {{ selectedStudent.guardianEmail }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Hostel Accommodations -->
          <div v-if="selectedStudent.hostelInfo" class="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span class="text-gray-400 font-mono text-[10px] uppercase font-bold block mb-1">HOSTEL BOARDING SPACE</span>
            <div class="font-bold text-gray-900">{{ selectedStudent.hostelInfo.building }}</div>
            <div class="text-gray-600 font-mono mt-0.5">{{ selectedStudent.hostelInfo.room }} &bull; {{ selectedStudent.hostelInfo.bed }}</div>
          </div>
          <div v-else class="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 italic">
            Registered as Day Scholar (Commutes from home).
          </div>

          <!-- Quick Navigation Actions -->
          <div class="grid grid-cols-2 gap-3 pt-2">
            <NuxtLink
              :to="`/dashboard/academics/gradebook`"
              class="p-3 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <UIcon name="i-heroicons-document-chart-bar" class="w-4 h-4" />
              <span>Collate Broadsheet</span>
            </NuxtLink>
            <NuxtLink
              :to="`/dashboard/security`"
              class="p-3 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <UIcon name="i-heroicons-shield-check" class="w-4 h-4" />
              <span>Gate Exeat Passes</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-gray-400 font-mono">Status:</span>
            <select
              :value="selectedStudent.status"
              class="px-2 py-1 bg-gray-100 rounded-lg text-xs font-bold outline-none"
              @change="handleUpdateStatus(selectedStudent, ($event.target as HTMLSelectElement).value)"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs cursor-pointer"
              @click="openEditModal(selectedStudent); isProfileModalOpen = false"
            >
              Edit Record
            </button>
            <button
              class="px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold text-xs cursor-pointer"
              @click="isProfileModalOpen = false"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Enroll / Edit Student Wizard -->
    <div
      v-if="isEnrollModalOpen"
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isEnrollModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        <!-- Wizard Header -->
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 class="text-base font-bold text-gray-900">
              {{ isEditing ? 'Edit Student Registration' : 'Student Enrollment Wizard' }}
            </h3>
            <p class="text-xs text-gray-500 mt-0.5">
              Step {{ formStep }} of 3: {{ formStep === 1 ? 'Personal Bio-Data' : formStep === 2 ? 'Placement & Boarding' : 'Guardian Safeguarding & Fees' }}
            </p>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700" @click="isEnrollModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Wizard Step Indicators -->
        <div class="flex items-center gap-2 py-3 border-b border-gray-100">
          <button
            v-for="step in [1, 2, 3]"
            :key="step"
            type="button"
            :class="[
              'flex-1 py-1 rounded-full text-center text-[10px] font-mono font-bold transition-all cursor-pointer',
              formStep === step
                ? 'bg-emerald-600 text-white'
                : formStep > step
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-100 text-gray-400'
            ]"
            @click="formStep = step"
          >
            Step {{ step }}
          </button>
        </div>

        <!-- Feedback Alert -->
        <div
          v-if="feedbackMessage"
          :class="[
            'p-3 my-3 rounded-xl text-xs font-semibold',
            feedbackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          ]"
        >
          {{ feedbackMessage.text }}
        </div>

        <!-- Step 1: Personal Bio-Data -->
        <div v-if="formStep === 1" class="space-y-4 py-4 overflow-y-auto text-xs">
          <div>
            <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Full Student Name *</label>
            <input
              v-model="studentForm.name"
              type="text"
              placeholder="e.g. Oluwaseun Adeleke, Zara Danjuma"
              class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-semibold"
            >
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-[11px] font-bold text-gray-700 uppercase font-mono">Admission Number *</label>
                <button
                  type="button"
                  class="text-[10px] font-mono text-emerald-600 hover:underline cursor-pointer"
                  @click="generateNewAdmissionNo"
                >
                  Generate
                </button>
              </div>
              <input
                v-model="studentForm.admissionNo"
                type="text"
                placeholder="e.g. APX-2026-419"
                class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-mono font-bold"
              >
            </div>
            <div>
              <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Gender *</label>
              <select
                v-model="studentForm.gender"
                class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Date of Birth</label>
              <input
                v-model="studentForm.dateOfBirth"
                type="date"
                class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-medium"
              >
            </div>
            <div>
              <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Passport / Avatar URL</label>
              <input
                v-model="studentForm.avatar"
                type="text"
                placeholder="https://... (Unsplash or image link)"
                class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-mono text-[11px]"
              >
            </div>
          </div>
        </div>

        <!-- Step 2: Academic Placement & Boarding -->
        <div v-if="formStep === 2" class="space-y-4 py-4 overflow-y-auto text-xs">
          <div>
            <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Class Arm Assignment *</label>
            <select
              v-model="studentForm.classArmId"
              class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-bold"
            >
              <option v-for="c in availableClasses" :key="c.id" :value="c.id">
                {{ c.displayName }} (Capacity: {{ c.studentCount || 0 }}/{{ c.capacity || 35 }})
              </option>
            </select>
          </div>

          <!-- Boarder vs Day Scholar Toggle -->
          <div class="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-gray-900 block">Boarding School Accommodation</span>
                <span class="text-gray-500 text-[11px]">Assign student to campus hostel dormitory and bed space</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="studentForm.isBoarder" type="checkbox" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            <!-- Hostel Space Selection -->
            <div v-if="studentForm.isBoarder" class="pt-3 border-t border-gray-200 grid grid-cols-3 gap-3 animate-fade-in">
              <div>
                <label class="text-[10px] font-mono font-bold text-gray-600 block mb-1">BUILDING</label>
                <select v-model="studentForm.hostelBuilding" class="w-full p-2 bg-white rounded-lg border border-gray-200 text-xs">
                  <option value="Nelson Mandela Hall">Nelson Mandela Hall (Boys)</option>
                  <option value="Queen Amina Hostel">Queen Amina Hostel (Girls)</option>
                </select>
              </div>
              <div>
                <label class="text-[10px] font-mono font-bold text-gray-600 block mb-1">ROOM</label>
                <input v-model="studentForm.hostelRoom" type="text" placeholder="e.g. Room 204" class="w-full p-2 bg-white rounded-lg border border-gray-200 text-xs">
              </div>
              <div>
                <label class="text-[10px] font-mono font-bold text-gray-600 block mb-1">BED CODE</label>
                <input v-model="studentForm.hostelBed" type="text" placeholder="e.g. Bed B" class="w-full p-2 bg-white rounded-lg border border-gray-200 text-xs">
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Guardian Safeguarding & Bursary -->
        <div v-if="formStep === 3" class="space-y-4 py-4 overflow-y-auto text-xs">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Primary Guardian Name</label>
              <input
                v-model="studentForm.guardianName"
                type="text"
                placeholder="e.g. Dr. Kenneth Okonkwo"
                class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-semibold"
              >
            </div>
            <div>
              <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Relationship</label>
              <select
                v-model="studentForm.guardianRelationship"
                class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Legal Guardian">Legal Guardian</option>
                <option value="Sponsor">Sponsor</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Guardian Phone (SMS/WhatsApp) *</label>
              <input
                v-model="studentForm.guardianPhone"
                type="tel"
                placeholder="+234 803 000 0000"
                class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-mono"
              >
            </div>
            <div>
              <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Guardian Email</label>
              <input
                v-model="studentForm.guardianEmail"
                type="email"
                placeholder="guardian@example.com"
                class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500"
              >
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">
              Guardian Photo (For Gate Clearance Matching)
            </label>
            <input
              v-model="studentForm.guardianPhoto"
              type="text"
              placeholder="https://... photo link"
              class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-mono text-[11px]"
            >
          </div>

          <!-- Fee Status -->
          <div class="p-4 rounded-2xl bg-gray-50 border border-gray-200 grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Initial Bursary Status</label>
              <select
                v-model="studentForm.feeStatus"
                class="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 outline-none"
              >
                <option value="Paid in Full">Paid in Full</option>
                <option value="Partial">Partial Payment</option>
                <option value="Unpaid">Unpaid / Invoice Sent</option>
              </select>
            </div>
            <div v-if="studentForm.feeStatus !== 'Paid in Full'">
              <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Outstanding Balance (₦)</label>
              <input
                v-model.number="studentForm.feeAmountDue"
                type="number"
                placeholder="e.g. 150000"
                class="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 outline-none font-mono"
              >
            </div>
          </div>
        </div>

        <!-- Wizard Navigation Footer -->
        <div class="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <button
            v-if="formStep > 1"
            type="button"
            class="px-4 py-2 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 cursor-pointer"
            @click="formStep--"
          >
            &larr; Back
          </button>
          <div v-else />

          <div class="flex items-center gap-2">
            <button
              v-if="formStep < 3"
              type="button"
              class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-sm"
              @click="formStep++"
            >
              Continue to Step {{ formStep + 1 }} &rarr;
            </button>
            <button
              v-else
              type="button"
              :disabled="isSubmitting"
              class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold cursor-pointer disabled:opacity-50 shadow-md active:scale-95 transition-all"
              @click="handleSaveStudent"
            >
              {{ isSubmitting ? 'Enrolling...' : isEditing ? 'Update Student Record' : 'Complete Enrollment' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
