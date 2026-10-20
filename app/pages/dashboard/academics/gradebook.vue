<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Gradebook & Broadsheet Collation Engine | Nwantas'
})

const { fetchApi } = useNwantasApi()

// Gradebook State
const gradebook = ref<any[]>([])
const classSummary = ref({
  totalStudents: 0,
  classAverage: 0,
  highestScore: 0,
  lowestScore: 0,
  passRate: '100%'
})

const isLoading = ref(true)
const isCollating = ref(false)
const isSavingScore = ref(false)

// Filters
const selectedClassArm = ref('cls-ss2-sci')
const selectedSubject = ref('Physics')
const searchQuery = ref('')

const classArms = [
  { id: 'cls-ss2-sci', name: 'SS 2 Science' },
  { id: 'cls-jss1-gold', name: 'JSS 1 Gold' },
  { id: 'cls-jss2-diamond', name: 'JSS 2 Diamond' },
  { id: 'cls-ss3-arts', name: 'SS 3 Arts' }
]

const subjects = [
  'All',
  'Physics',
  'Mathematics',
  'English Language',
  'Chemistry',
  'Biology',
  'Civic Education'
]

// Score Editing Modal
const isEditScoreModalOpen = ref(false)
const editingEntry = ref<any>({
  id: '',
  studentId: '',
  studentName: '',
  admissionNo: '',
  classArmId: '',
  subjectName: '',
  caScore: 0,
  midtermScore: 0,
  examScore: 0,
  teacherRemarks: ''
})

// Report Card State
const selectedStudentId = ref<string | null>(null)
const reportCardData = ref<any | null>(null)
const isReportModalOpen = ref(false)
const isLoadingReport = ref(false)

// Live score preview inside edit modal
const modalPreviewTotal = computed(() => {
  const ca = Math.min(20, Math.max(0, Number(editingEntry.value.caScore) || 0))
  const mid = Math.min(20, Math.max(0, Number(editingEntry.value.midtermScore) || 0))
  const exam = Math.min(60, Math.max(0, Number(editingEntry.value.examScore) || 0))
  return Math.round((ca + mid + exam) * 10) / 10
})

const modalPreviewGrade = computed(() => {
  const total = modalPreviewTotal.value
  if (total >= 75) return { letter: 'A1', gpa: 5.0, label: 'Excellent' }
  if (total >= 70) return { letter: 'B2', gpa: 4.5, label: 'Very Good' }
  if (total >= 65) return { letter: 'B3', gpa: 4.0, label: 'Good' }
  if (total >= 60) return { letter: 'C4', gpa: 3.5, label: 'Credit' }
  if (total >= 55) return { letter: 'C5', gpa: 3.0, label: 'Credit' }
  if (total >= 50) return { letter: 'C6', gpa: 2.5, label: 'Credit' }
  if (total >= 45) return { letter: 'D7', gpa: 2.0, label: 'Pass' }
  if (total >= 40) return { letter: 'E8', gpa: 1.0, label: 'Pass' }
  return { letter: 'F9', gpa: 0.0, label: 'Fail' }
})

// Fetch Gradebook
async function loadGradebook() {
  isLoading.value = true
  try {
    const res = await fetchApi(`/api/v1/gradebooks?classArmId=${selectedClassArm.value}&subjectName=${selectedSubject.value}`)
    gradebook.value = res.data || []
    calculateSummary(gradebook.value)
  } catch (e) {
    console.error('Failed to load gradebook:', e)
  } finally {
    isLoading.value = false
  }
}

function calculateSummary(rows: any[]) {
  const count = rows.length
  if (count === 0) {
    classSummary.value = { totalStudents: 0, classAverage: 0, highestScore: 0, lowestScore: 0, passRate: '0%' }
    return
  }
  const avg = Math.round((rows.reduce((acc, r) => acc + (r.totalScore || 0), 0) / count) * 10) / 10
  const highest = Math.max(...rows.map(r => r.totalScore || 0))
  const lowest = Math.min(...rows.map(r => r.totalScore || 0))
  const passed = rows.filter(r => (r.totalScore || 0) >= 50).length
  const passRate = `${Math.round((passed / count) * 100)}%`

  classSummary.value = {
    totalStudents: count,
    classAverage: avg,
    highestScore: highest,
    lowestScore: lowest,
    passRate
  }
}

// Collate Broadsheet
async function handleCollate() {
  isCollating.value = true
  try {
    const res = await fetchApi('/api/v1/gradebooks/collate', {
      method: 'POST',
      body: {
        classArmId: selectedClassArm.value,
        subjectName: selectedSubject.value
      }
    })
    gradebook.value = res.data || []
    if (res.summary) {
      classSummary.value = {
        totalStudents: res.summary.totalStudents,
        classAverage: res.summary.classAverage,
        highestScore: res.summary.highestScore,
        lowestScore: res.summary.lowestScore,
        passRate: res.summary.passRate
      }
    }
  } catch (e) {
    console.error('Failed to collate gradebook:', e)
  } finally {
    isCollating.value = false
  }
}

// Open Edit Score Modal
function openEditScoreModal(entry: any) {
  editingEntry.value = {
    id: entry.id,
    studentId: entry.studentId,
    studentName: entry.studentName,
    admissionNo: entry.admissionNo,
    classArmId: entry.classArmId || selectedClassArm.value,
    subjectName: entry.subjectName || selectedSubject.value,
    caScore: entry.caScore,
    midtermScore: entry.midtermScore,
    examScore: entry.examScore,
    teacherRemarks: entry.teacherRemarks || 'Satisfactory progress and active class participation.'
  }
  isEditScoreModalOpen.value = true
}

// Save Score Edits
async function handleSaveScore() {
  try {
    isSavingScore.value = true
    await fetchApi('/api/v1/gradebooks/entry', {
      method: 'PUT',
      body: editingEntry.value
    })
    isEditScoreModalOpen.value = false
    await loadGradebook()
  } catch (e) {
    console.error('Failed to save score:', e)
    alert('Error saving score entry. Please check the values.')
  } finally {
    isSavingScore.value = false
  }
}

// View Official Report Card
async function handleViewReportCard(studentId: string) {
  selectedStudentId.value = studentId
  isLoadingReport.value = true
  isReportModalOpen.value = true
  try {
    const res = await fetchApi(`/api/v1/term-reports/${studentId}`)
    reportCardData.value = res
  } catch (e) {
    console.error('Failed to load report card:', e)
  } finally {
    isLoadingReport.value = false
  }
}

function handlePrint() {
  window.print()
}

// Filtered rows for live search
const filteredGradebook = computed(() => {
  if (!searchQuery.value) return gradebook.value
  const q = searchQuery.value.toLowerCase()
  return gradebook.value.filter(e =>
    e.studentName.toLowerCase().includes(q) ||
    e.admissionNo.toLowerCase().includes(q) ||
    e.letterGrade.toLowerCase().includes(q)
  )
})

onMounted(() => {
  loadGradebook()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-calculator" class="w-3.5 h-3.5 text-emerald-600" />
          <span>ACADEMIC BROADSHEET & REPORT CARD ENGINE</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Gradebook, Weightages & Broadsheet Collation</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Collate continuous assessments (20% CA + 20% Midterm + 60% Exam), compute class ranks, and generate printable terminal report cards.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          :disabled="isCollating"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          @click="handleCollate"
        >
          <UIcon name="i-heroicons-arrow-path" :class="['w-4 h-4', isCollating && 'animate-spin']" />
          <span>{{ isCollating ? 'Recalculating...' : 'Collate Broadsheet Grades' }}</span>
        </button>
      </div>
    </div>

    <!-- Weightage Configuration Banner -->
    <div class="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
      <div class="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
        <div class="text-[10px] font-mono uppercase text-gray-400">CONTINUOUS ASSESSMENT (CA)</div>
        <div class="text-lg font-black text-gray-900">20% Weightage</div>
        <div class="text-[10px] text-emerald-600 font-medium">Max Score: 20 pts</div>
      </div>
      <div class="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
        <div class="text-[10px] font-mono uppercase text-gray-400">MIDTERM CBT EXAM</div>
        <div class="text-lg font-black text-gray-900">20% Weightage</div>
        <div class="text-[10px] text-emerald-600 font-medium">Max Score: 20 pts</div>
      </div>
      <div class="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
        <div class="text-[10px] font-mono uppercase text-gray-400">FINAL EXAMINATION</div>
        <div class="text-lg font-black text-gray-900">60% Weightage</div>
        <div class="text-[10px] text-emerald-600 font-medium">Max Score: 60 pts</div>
      </div>
      <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
        <div class="text-[10px] font-mono uppercase text-emerald-700">AGGREGATE SCALE</div>
        <div class="text-lg font-black text-emerald-800">100% Total</div>
        <div class="text-[10px] text-emerald-700 font-medium">5.0 GPA / Letter A1 - F9</div>
      </div>
    </div>

    <!-- KPI Metric Cards for Selected Class & Subject -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <UIcon name="i-heroicons-user-group" class="w-6 h-6" />
        </div>
        <div>
          <div class="text-[11px] font-mono uppercase text-gray-400">Class Enrollment</div>
          <div class="text-2xl font-black text-gray-900">{{ classSummary.totalStudents }}</div>
          <div class="text-[10px] text-blue-600 font-medium">Candidates enrolled</div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <UIcon name="i-heroicons-chart-bar" class="w-6 h-6" />
        </div>
        <div>
          <div class="text-[11px] font-mono uppercase text-gray-400">Class Average</div>
          <div class="text-2xl font-black text-emerald-600">{{ classSummary.classAverage }}%</div>
          <div class="text-[10px] text-emerald-600 font-medium">Cohort composite median</div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <UIcon name="i-heroicons-trophy" class="w-6 h-6" />
        </div>
        <div>
          <div class="text-[11px] font-mono uppercase text-gray-400">Highest Score</div>
          <div class="text-2xl font-black text-purple-700">{{ classSummary.highestScore }}%</div>
          <div class="text-[10px] text-purple-600 font-medium">Distinction peak score</div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <UIcon name="i-heroicons-check-badge" class="w-6 h-6" />
        </div>
        <div>
          <div class="text-[11px] font-mono uppercase text-gray-400">Pass Benchmark</div>
          <div class="text-2xl font-black text-teal-700">{{ classSummary.passRate }}</div>
          <div class="text-[10px] text-teal-600 font-medium">&ge; 50% Credit pass threshold</div>
        </div>
      </div>
    </div>

    <!-- Filter and Selector Bar -->
    <div class="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-3">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <!-- Live Search -->
        <div class="relative flex-1">
          <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search students by name, admission no, or letter grade..."
            class="w-full pl-9 pr-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <!-- Class and Subject Dropdowns -->
        <div class="flex flex-wrap items-center gap-2">
          <select
            v-model="selectedClassArm"
            @change="loadGradebook"
            class="px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option v-for="c in classArms" :key="c.id" :value="c.id">Class: {{ c.name }}</option>
          </select>

          <select
            v-model="selectedSubject"
            @change="loadGradebook"
            class="px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option v-for="s in subjects" :key="s" :value="s">Subject: {{ s }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Broadsheet Table -->
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 mb-4">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold text-gray-900">
              Broadsheet: {{ classArms.find(c => c.id === selectedClassArm)?.name }}
            </h3>
            <span class="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {{ selectedSubject }}
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5">Continuous assessment and final examination composite score collation</p>
        </div>

        <span class="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full self-start sm:self-center">
          Collation Status: Fully Synchronized
        </span>
      </div>

      <div v-if="isLoading" class="py-12 text-center text-xs text-gray-400">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
        Loading broadsheet collation...
      </div>

      <div v-else-if="filteredGradebook.length === 0" class="py-12 text-center text-xs text-gray-400">
        <UIcon name="i-heroicons-table-cells" class="w-10 h-10 text-gray-300 mx-auto mb-2" />
        No gradebook records found for this class and subject filter.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-gray-200 text-gray-400 font-mono uppercase text-[10px]">
              <th class="py-2.5 px-3">Position</th>
              <th class="py-2.5 px-3">Student Candidate</th>
              <th class="py-2.5 px-3">Admission No</th>
              <th class="py-2.5 px-3">Subject</th>
              <th class="py-2.5 px-3 text-center">CA (20)</th>
              <th class="py-2.5 px-3 text-center">Midterm (20)</th>
              <th class="py-2.5 px-3 text-center">Exam (60)</th>
              <th class="py-2.5 px-3 text-center font-bold text-gray-900">Total (100)</th>
              <th class="py-2.5 px-3 text-center">Grade</th>
              <th class="py-2.5 px-3 text-center">GPA</th>
              <th class="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="entry in filteredGradebook" :key="entry.id || entry.studentId" class="hover:bg-gray-50/60 transition-colors">
              <td class="py-3.5 px-3 font-mono font-bold text-gray-900">
                <span
                  :class="[
                    'w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs',
                    entry.position === 1 ? 'bg-amber-100 text-amber-900' :
                    entry.position === 2 ? 'bg-gray-200 text-gray-800' :
                    entry.position === 3 ? 'bg-amber-50 text-amber-800' :
                    'bg-gray-100 text-gray-600'
                  ]"
                >
                  {{ entry.position }}
                </span>
              </td>
              <td class="py-3.5 px-3 font-bold text-gray-900">{{ entry.studentName }}</td>
              <td class="py-3.5 px-3 font-mono text-gray-500">{{ entry.admissionNo }}</td>
              <td class="py-3.5 px-3 font-medium text-gray-700">{{ entry.subjectName }}</td>
              <td class="py-3.5 px-3 font-mono text-center">{{ entry.caScore }}</td>
              <td class="py-3.5 px-3 font-mono text-center">{{ entry.midtermScore }}</td>
              <td class="py-3.5 px-3 font-mono text-center">{{ entry.examScore }}</td>
              <td class="py-3.5 px-3 font-mono font-bold text-emerald-600 text-sm text-center">
                {{ entry.totalScore }}%
              </td>
              <td class="py-3.5 px-3 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 rounded-md font-mono font-bold text-[11px]',
                    entry.letterGrade === 'A1' ? 'bg-emerald-100 text-emerald-800' :
                    entry.letterGrade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                    entry.letterGrade.startsWith('C') ? 'bg-amber-100 text-amber-800' :
                    entry.letterGrade.startsWith('D') || entry.letterGrade.startsWith('E') ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ entry.letterGrade }}
                </span>
              </td>
              <td class="py-3.5 px-3 font-mono text-gray-700 text-center">{{ Number(entry.gpa).toFixed(1) }}</td>
              <td class="py-3.5 px-3 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
                    title="Edit candidate continuous assessment scores"
                    @click="openEditScoreModal(entry)"
                  >
                    <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors cursor-pointer"
                    title="View printable terminal report card"
                    @click="handleViewReportCard(entry.studentId)"
                  >
                    <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5" />
                    <span>Report Card</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Edit Candidate Scores -->
    <div
      v-if="isEditScoreModalOpen"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      @click.self="isEditScoreModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <span class="text-[10px] font-mono font-bold text-emerald-600 uppercase">
              {{ editingEntry.subjectName }} • {{ editingEntry.admissionNo }}
            </span>
            <h3 class="text-lg font-bold text-gray-900">{{ editingEntry.studentName }}</h3>
            <p class="text-xs text-gray-500">Input continuous assessment and exam scores.</p>
          </div>
          <button
            @click="isEditScoreModalOpen = false"
            class="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Score inputs -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">CA 1 & 2 (Max 20)</label>
              <input
                v-model.number="editingEntry.caScore"
                type="number"
                min="0"
                max="20"
                step="0.5"
                class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Midterm CBT (Max 20)</label>
              <input
                v-model.number="editingEntry.midtermScore"
                type="number"
                min="0"
                max="20"
                step="0.5"
                class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Final Exam (Max 60)</label>
              <input
                v-model.number="editingEntry.examScore"
                type="number"
                min="0"
                max="60"
                step="0.5"
                class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <!-- Live Score Calculation Box -->
          <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
            <div>
              <div class="text-[10px] font-mono uppercase text-emerald-800">COMPUTED TOTAL SCORE</div>
              <div class="text-2xl font-black text-emerald-900">{{ modalPreviewTotal }} / 100</div>
            </div>
            <div class="text-right">
              <span class="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs">
                Grade: {{ modalPreviewGrade.letter }} ({{ modalPreviewGrade.label }})
              </span>
              <div class="text-[10px] font-mono text-emerald-700 mt-1">GPA: {{ modalPreviewGrade.gpa.toFixed(1) }}</div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Subject Tutor Remark</label>
            <textarea
              v-model="editingEntry.teacherRemarks"
              rows="2"
              class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            @click="isEditScoreModalOpen = false"
            class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleSaveScore"
            :disabled="isSavingScore"
            class="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <UIcon v-if="isSavingScore" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <span>Save & Recollate</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Printable Term Report Card (PDF / Print Engine) -->
    <div
      v-if="isReportModalOpen"
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isReportModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-4xl w-full p-8 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
        <!-- Top Action Bar for modal -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200 mb-6 print:hidden">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              OFFICIAL TERM REPORT CARD
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              @click="handlePrint"
            >
              <UIcon name="i-heroicons-printer" class="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button class="p-2 text-gray-400 hover:text-gray-700 cursor-pointer" @click="isReportModalOpen = false">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div v-if="isLoadingReport" class="py-16 text-center text-xs text-gray-400">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
          Compiling student academic dossier and institutional seals...
        </div>

        <!-- Printable Document Area -->
        <div v-else-if="reportCardData" id="printable-report" class="space-y-6 text-gray-900">
          <!-- Institutional Header -->
          <div class="text-center pb-6 border-b-2 border-emerald-600">
            <div class="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-bold text-2xl mx-auto flex items-center justify-center mb-2 shadow-sm">
              A
            </div>
            <h2 class="text-2xl font-black uppercase tracking-tight text-gray-900">{{ reportCardData.school.name }}</h2>
            <p class="text-xs italic text-gray-600 mt-0.5">"{{ reportCardData.school.motto }}"</p>
            <p class="text-xs text-gray-500 mt-1">{{ reportCardData.school.address }} • Tel: {{ reportCardData.school.phone }}</p>
            <div class="inline-block mt-3 px-4 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs font-mono">
              CONTINUOUS ASSESSMENT & TERMINAL REPORT SHEET
            </div>
          </div>

          <!-- Student & Session Meta -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">STUDENT FULL NAME</span>
              <span class="font-bold text-gray-900 text-sm">{{ reportCardData.student.name }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">ADMISSION NUMBER</span>
              <span class="font-mono font-bold text-gray-900">{{ reportCardData.student.admissionNo }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">CLASS LEVEL & ARM</span>
              <span class="font-bold text-gray-900">{{ reportCardData.student.classArm }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">ACADEMIC SESSION</span>
              <span class="font-bold text-emerald-700">{{ reportCardData.termInfo.term }} ({{ reportCardData.termInfo.session }})</span>
            </div>
          </div>

          <!-- Subjects & Score Collation -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border border-gray-200">
              <thead class="bg-gray-100 font-mono text-[10px] uppercase text-gray-700">
                <tr class="divide-x divide-gray-200">
                  <th class="py-2.5 px-3">Subject</th>
                  <th class="py-2.5 px-3 text-center">CA (20)</th>
                  <th class="py-2.5 px-3 text-center">Midterm (20)</th>
                  <th class="py-2.5 px-3 text-center">Exam (60)</th>
                  <th class="py-2.5 px-3 text-center font-bold">Total (100)</th>
                  <th class="py-2.5 px-3 text-center">Grade</th>
                  <th class="py-2.5 px-3 text-center">GPA</th>
                  <th class="py-2.5 px-3">Subject Tutor Remarks</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="sub in reportCardData.subjects" :key="sub.subject" class="divide-x divide-gray-200">
                  <td class="py-2.5 px-3 font-bold">{{ sub.subject }}</td>
                  <td class="py-2.5 px-3 text-center font-mono">{{ sub.ca }}</td>
                  <td class="py-2.5 px-3 text-center font-mono">{{ sub.midterm }}</td>
                  <td class="py-2.5 px-3 text-center font-mono">{{ sub.exam }}</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">{{ sub.total }}</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold">{{ sub.grade }}</td>
                  <td class="py-2.5 px-3 text-center font-mono">{{ Number(sub.gpa).toFixed(1) }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ sub.remarks }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Affective & Psychomotor Domain Traits -->
          <div v-if="reportCardData.affectiveDomain" class="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2">
            <span class="font-mono text-[10px] font-bold uppercase text-gray-500">Affective & Psychomotor Traits (Scale: 1 - 5)</span>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              <div v-for="trait in reportCardData.affectiveDomain" :key="trait.trait" class="p-2 rounded-xl bg-white border border-gray-200 text-center">
                <div class="text-[10px] text-gray-600 font-medium">{{ trait.trait }}</div>
                <div class="text-sm font-black text-emerald-700 mt-0.5">{{ trait.rating }} / 5</div>
              </div>
            </div>
          </div>

          <!-- Performance Summary -->
          <div class="p-4 rounded-2xl bg-gray-50 border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">TOTAL MARKS OBTAINED</span>
              <span class="font-extrabold text-sm text-gray-900">{{ reportCardData.summary.totalScore }} / {{ reportCardData.summary.maxPossibleScore }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">AVERAGE SCORE</span>
              <span class="font-extrabold text-sm text-emerald-700">{{ reportCardData.summary.average }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">CLASS POSITION</span>
              <span class="font-extrabold text-sm text-gray-900">{{ reportCardData.summary.classPosition }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">OVERALL RATING</span>
              <span class="font-extrabold text-sm text-emerald-700">{{ reportCardData.summary.overallGrade }}</span>
            </div>
          </div>

          <!-- Teacher & Principal Remarks & Signatures -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-gray-200">
            <div class="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
              <span class="font-mono text-[10px] text-gray-400 block uppercase font-bold">FORM TEACHER REMARK</span>
              <p class="italic text-gray-700">{{ reportCardData.summary.classTeacherRemark }}</p>
              <div class="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono">
                <span class="text-gray-500">Signature:</span>
                <span class="font-bold text-emerald-800">{{ reportCardData.summary.classTeacherSignature }}</span>
              </div>
            </div>

            <div class="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
              <span class="font-mono text-[10px] text-gray-400 block uppercase font-bold">PRINCIPAL / HEAD OF SCHOOL REMARK</span>
              <p class="italic text-gray-700">{{ reportCardData.summary.principalRemark }}</p>
              <div class="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono">
                <span class="text-gray-500">Official Seal & Sign:</span>
                <span class="font-bold text-emerald-800">{{ reportCardData.summary.principalSignature }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
