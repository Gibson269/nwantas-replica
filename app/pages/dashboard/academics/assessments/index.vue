<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'CBT Assessments & Anti-Cheat Monitoring Engine | Nwantas'
})

const { fetchApi } = useNwantasApi()

// Assessment state
const assessments = ref<any[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const selectedSubject = ref('All')
const selectedLevel = ref('All')
const selectedType = ref('All')

// Telemetry state
const telemetryLogs = ref<any[]>([])
const isRefreshingTelemetry = ref(false)
const telemetryFilter = ref('All')

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showSubmissionsModal = ref(false)
const activeSubmissionsAssessment = ref<any | null>(null)
const submissionsList = ref<any[]>([])
const isLoadingSubmissions = ref(false)

// Create / Edit Form State
const formAssessment = ref({
  id: '',
  title: '',
  subject: 'Physics',
  classLevel: 'SS 2 Science',
  type: 'CBT Exam',
  durationMinutes: 45,
  totalMarks: 40,
  instructions: 'Anti-cheat monitoring is active. Do not switch tabs, exit fullscreen, or attempt copy-pasting. All events are logged to the proctoring console.',
  antiCheatEnabled: true,
  isPublished: true,
  questions: [
    {
      id: 'q-1',
      questionText: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    }
  ]
})

const subjectsList = ['All', 'Physics', 'Mathematics', 'English Language', 'Chemistry', 'Biology', 'Civic Education', 'Economics']
const levelsList = ['All', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3']
const typesList = ['All', 'CBT Exam', 'Weekly Quiz', 'Mock WAEC/JAMB', 'Speed Drill']

// Fetch Assessments
async function loadAssessments() {
  try {
    isLoading.value = true
    const res = await fetchApi('/api/v1/assessments')
    assessments.value = res.data || []
  } catch (e) {
    console.error('Failed to load assessments:', e)
  } finally {
    isLoading.value = false
  }
}

// Fetch Telemetry Logs
async function loadTelemetry() {
  try {
    isRefreshingTelemetry.value = true
    const res = await fetchApi('/api/v1/assessments/telemetry')
    telemetryLogs.value = res.data || []
  } catch (e) {
    console.error('Failed to load telemetry:', e)
  } finally {
    isRefreshingTelemetry.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadAssessments(), loadTelemetry()])
})

// Filtered Assessments
const filteredAssessments = computed(() => {
  return assessments.value.filter(asm => {
    const matchesSearch = !searchQuery.value ||
      asm.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      asm.subject.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      asm.classLevel.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesSubject = selectedSubject.value === 'All' || asm.subject === selectedSubject.value
    const matchesLevel = selectedLevel.value === 'All' || asm.classLevel.includes(selectedLevel.value)
    const matchesType = selectedType.value === 'All' || asm.type === selectedType.value

    return matchesSearch && matchesSubject && matchesLevel && matchesType
  })
})

// Filtered Telemetry Logs
const filteredTelemetry = computed(() => {
  if (telemetryFilter.value === 'All') return telemetryLogs.value
  return telemetryLogs.value.filter(log => {
    if (telemetryFilter.value === 'High') {
      return log.event_type === 'devtools_opened' || log.event_type === 'copy_paste_attempt'
    }
    if (telemetryFilter.value === 'Medium') {
      return log.event_type === 'tab_switch' || log.event_type === 'window_blur'
    }
    return log.event_type === 'fullscreen_exit'
  })
})

// Helper to determine severity
function getSeverity(eventType: string) {
  if (eventType === 'devtools_opened' || eventType === 'copy_paste_attempt') return 'High'
  if (eventType === 'tab_switch' || eventType === 'window_blur') return 'Medium'
  return 'Low'
}

// Open Create Modal
function openCreateModal() {
  formAssessment.value = {
    id: '',
    title: '',
    subject: 'Physics',
    classLevel: 'SS 2 Science',
    type: 'CBT Exam',
    durationMinutes: 45,
    totalMarks: 40,
    instructions: 'Anti-cheat monitoring is active. Do not switch tabs, exit fullscreen, or attempt copy-pasting. All events are logged to the proctoring console.',
    antiCheatEnabled: true,
    isPublished: true,
    questions: [
      {
        id: `q-${Date.now()}-1`,
        questionText: 'What is the primary function of a step-down transformer in alternating current circuits?',
        options: [
          'To increase output voltage while lowering current',
          'To decrease output voltage while increasing current proportionally',
          'To convert alternating current into steady direct current',
          'To isolate ground loop electromagnetic interferences'
        ],
        correctIndex: 1,
        explanation: 'Step-down transformers reduce secondary coil voltage and raise available output current.'
      },
      {
        id: `q-${Date.now()}-2`,
        questionText: 'Which SI unit is used to quantify magnetic flux density?',
        options: ['Tesla (T)', 'Weber (Wb)', 'Henry (H)', 'Farad (F)'],
        correctIndex: 0,
        explanation: 'Magnetic flux density (B) is measured in Tesla (or Wb/m²).'
      }
    ]
  }
  showCreateModal.value = true
}

// Add Question to Form
function addQuestion() {
  formAssessment.value.questions.push({
    id: `q-${Date.now()}-${formAssessment.value.questions.length + 1}`,
    questionText: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: ''
  })
}

// Remove Question from Form
function removeQuestion(index: number) {
  if (formAssessment.value.questions.length <= 1) return
  formAssessment.value.questions.splice(index, 1)
}

// Save New Assessment
const isSaving = ref(false)
async function handleCreateAssessment() {
  if (!formAssessment.value.title || !formAssessment.value.subject) {
    alert('Please enter an exam title and select a subject.')
    return
  }

  try {
    isSaving.value = true
    await fetchApi('/api/v1/assessments', {
      method: 'POST',
      body: {
        title: formAssessment.value.title,
        subject: formAssessment.value.subject,
        classLevel: formAssessment.value.classLevel,
        type: formAssessment.value.type,
        durationMinutes: formAssessment.value.durationMinutes,
        totalMarks: formAssessment.value.totalMarks,
        instructions: formAssessment.value.instructions,
        antiCheatEnabled: formAssessment.value.antiCheatEnabled,
        isPublished: formAssessment.value.isPublished,
        questions: formAssessment.value.questions
      }
    })
    showCreateModal.value = false
    await loadAssessments()
  } catch (e) {
    console.error('Failed to create assessment:', e)
    alert('Error creating assessment. Please verify all fields.')
  } finally {
    isSaving.value = false
  }
}

// Open Edit Modal
function openEditModal(asm: any) {
  formAssessment.value = {
    id: asm.id,
    title: asm.title,
    subject: asm.subject,
    classLevel: asm.classLevel,
    type: asm.type,
    durationMinutes: asm.durationMinutes,
    totalMarks: asm.totalMarks,
    instructions: asm.instructions,
    antiCheatEnabled: asm.antiCheatEnabled,
    isPublished: asm.isPublished,
    questions: JSON.parse(JSON.stringify(asm.questions || []))
  }
  showEditModal.value = true
}

// Save Edited Assessment
async function handleUpdateAssessment() {
  try {
    isSaving.value = true
    await fetchApi(`/api/v1/assessments/${formAssessment.value.id}`, {
      method: 'PUT',
      body: formAssessment.value
    })
    showEditModal.value = false
    await loadAssessments()
  } catch (e) {
    console.error('Failed to update assessment:', e)
  } finally {
    isSaving.value = false
  }
}

// Toggle Publish Status
async function togglePublish(asm: any) {
  try {
    const updated = !asm.isPublished
    await fetchApi(`/api/v1/assessments/${asm.id}`, {
      method: 'PUT',
      body: { isPublished: updated }
    })
    asm.isPublished = updated
  } catch (e) {
    console.error('Failed to toggle publish status:', e)
  }
}

// Delete Assessment
async function deleteAssessment(id: string) {
  if (!confirm('Are you sure you want to permanently delete this assessment and all candidate submission records?')) return
  try {
    await fetchApi(`/api/v1/assessments/${id}`, { method: 'DELETE' })
    await loadAssessments()
  } catch (e) {
    console.error('Failed to delete assessment:', e)
  }
}

// Open Submissions Dossier Modal
async function openSubmissionsModal(asm: any) {
  activeSubmissionsAssessment.value = asm
  showSubmissionsModal.value = true
  isLoadingSubmissions.value = true
  try {
    const res = await fetchApi(`/api/v1/assessments/${asm.id}/submissions`)
    submissionsList.value = res.data || []
  } catch (e) {
    console.error('Failed to load submissions:', e)
    submissionsList.value = []
  } finally {
    isLoadingSubmissions.value = false
  }
}

// Dismiss Telemetry Event
async function dismissTelemetry(eventId: string) {
  try {
    await fetchApi(`/api/v1/assessments/telemetry/${eventId}`, { method: 'DELETE' })
    telemetryLogs.value = telemetryLogs.value.filter(l => l.id !== eventId)
  } catch (e) {
    console.error('Failed to dismiss event:', e)
  }
}

// KPI aggregates
const totalAssessmentsCount = computed(() => assessments.value.length)
const totalSubmissionsCount = computed(() => assessments.value.reduce((acc, a) => acc + (a.submissionsCount || 0), 0))
const systemAverageScore = computed(() => {
  if (!assessments.value.length) return 0
  const total = assessments.value.reduce((acc, a) => acc + (a.averageScore || 0), 0)
  return Math.round((total / assessments.value.length) * 10) / 10
})
const totalIncidentsCount = computed(() => telemetryLogs.value.length)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5 text-emerald-600" />
          <span>PROCTORING & ANTI-CHEAT TELEMETRY ACTIVE</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Assessments & Computer-Based Testing (CBT)</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Schedule online tests, monitor server-synchronized countdown timers, evaluate question banks, and track anti-cheat incidents.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="loadTelemetry"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all cursor-pointer"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="{ 'animate-spin': isRefreshingTelemetry }" />
          <span>Sync Telemetry</span>
        </button>

        <button
          @click="openCreateModal"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
        >
          <UIcon name="i-heroicons-plus" class="w-4 h-4" />
          <span>Create New CBT Assessment</span>
        </button>
      </div>
    </div>

    <!-- Top KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
        </div>
        <div>
          <div class="text-[11px] font-mono uppercase text-gray-400">Total Assessments</div>
          <div class="text-2xl font-black text-gray-900">{{ totalAssessmentsCount }}</div>
          <div class="text-[10px] text-emerald-600 font-medium">Active in curriculum</div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <UIcon name="i-heroicons-user-group" class="w-6 h-6" />
        </div>
        <div>
          <div class="text-[11px] font-mono uppercase text-gray-400">Submissions Logged</div>
          <div class="text-2xl font-black text-gray-900">{{ totalSubmissionsCount }}</div>
          <div class="text-[10px] text-blue-600 font-medium">Autocoded & graded</div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <UIcon name="i-heroicons-chart-bar" class="w-6 h-6" />
        </div>
        <div>
          <div class="text-[11px] font-mono uppercase text-gray-400">Average Performance</div>
          <div class="text-2xl font-black text-gray-900">{{ systemAverageScore }}%</div>
          <div class="text-[10px] text-purple-600 font-medium">Cohort median benchmark</div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 relative">
          <UIcon name="i-heroicons-shield-exclamation" class="w-6 h-6" />
          <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
        </div>
        <div>
          <div class="text-[11px] font-mono uppercase text-gray-400">Security Alerts</div>
          <div class="text-2xl font-black text-red-600">{{ totalIncidentsCount }}</div>
          <div class="text-[10px] text-red-500 font-medium">Live browser sensor flags</div>
        </div>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-3">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <!-- Live Search -->
        <div class="relative flex-1">
          <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search CBT tests by subject, title, or class level..."
            class="w-full pl-9 pr-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <!-- Filter Selects -->
        <div class="flex flex-wrap items-center gap-2">
          <select
            v-model="selectedLevel"
            class="px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option v-for="lvl in levelsList" :key="lvl" :value="lvl">Level: {{ lvl }}</option>
          </select>

          <select
            v-model="selectedType"
            class="px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option v-for="t in typesList" :key="t" :value="t">Type: {{ t }}</option>
          </select>
        </div>
      </div>

      <!-- Subject Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span class="text-[10px] font-mono uppercase text-gray-400 mr-1 shrink-0">Subject:</span>
        <button
          v-for="sub in subjectsList"
          :key="sub"
          @click="selectedSubject = sub"
          :class="[
            'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
            selectedSubject === sub
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ sub }}
        </button>
      </div>
    </div>

    <!-- Active Assessments Grid -->
    <div v-if="isLoading" class="py-12 text-center text-gray-400 text-xs">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
      Loading assessment directory...
    </div>

    <div v-else-if="filteredAssessments.length === 0" class="bg-white rounded-3xl p-12 text-center border border-gray-100">
      <UIcon name="i-heroicons-document-magnifying-glass" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 class="text-sm font-bold text-gray-900">No CBT assessments match your query</h3>
      <p class="text-xs text-gray-500 mt-1">Try modifying your subject or class filters, or create a new assessment.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      <div
        v-for="asm in filteredAssessments"
        :key="asm.id"
        class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
      >
        <div>
          <!-- Card Header -->
          <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {{ asm.subject }}
              </span>
              <span class="text-xs font-mono text-gray-500 font-semibold">
                {{ asm.classLevel }}
              </span>
            </div>

            <div class="flex items-center gap-1.5">
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold',
                  asm.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                ]"
              >
                {{ asm.isPublished ? 'Published' : 'Draft' }}
              </span>

              <span class="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-semibold">
                {{ asm.type }}
              </span>
            </div>
          </div>

          <!-- Title & Instructions -->
          <h3 class="text-lg font-bold text-gray-900 mb-1.5">{{ asm.title }}</h3>
          <p class="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-2">{{ asm.instructions }}</p>

          <!-- Metrics Box -->
          <div class="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center mb-4">
            <div>
              <div class="text-[9px] font-mono uppercase text-gray-400">Duration</div>
              <div class="text-xs font-bold text-gray-900">{{ asm.durationMinutes }}m</div>
            </div>
            <div>
              <div class="text-[9px] font-mono uppercase text-gray-400">Marks</div>
              <div class="text-xs font-bold text-gray-900">{{ asm.totalMarks }} pts</div>
            </div>
            <div>
              <div class="text-[9px] font-mono uppercase text-gray-400">Questions</div>
              <div class="text-xs font-bold text-purple-700">{{ asm.questions?.length || 0 }} items</div>
            </div>
            <div>
              <div class="text-[9px] font-mono uppercase text-gray-400">Submissions</div>
              <div class="text-xs font-bold text-emerald-600">{{ asm.submissionsCount }} candidates</div>
            </div>
          </div>

          <!-- Average Score Progress Indicator -->
          <div class="mb-4">
            <div class="flex items-center justify-between text-[10px] font-mono text-gray-500 mb-1">
              <span>CLASS AVERAGE</span>
              <span class="font-bold text-gray-900">{{ asm.averageScore }}%</span>
            </div>
            <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                :style="{ width: `${Math.min(100, Math.max(0, asm.averageScore))}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="pt-4 border-t border-gray-100 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs text-emerald-600 font-mono">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Anti-Cheat Sensors Active</span>
            </div>

            <!-- Publish toggle and edit/delete icons -->
            <div class="flex items-center gap-1">
              <button
                @click="togglePublish(asm)"
                :title="asm.isPublished ? 'Unpublish test' : 'Publish test'"
                class="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <UIcon :name="asm.isPublished ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'" class="w-4 h-4" />
              </button>

              <button
                @click="openEditModal(asm)"
                title="Edit questions and parameters"
                class="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer"
              >
                <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
              </button>

              <button
                @click="deleteAssessment(asm.id)"
                title="Delete assessment"
                class="p-1.5 rounded-lg text-gray-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer"
              >
                <UIcon name="i-heroicons-trash" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button
              @click="openSubmissionsModal(asm)"
              class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-all cursor-pointer"
            >
              <UIcon name="i-heroicons-table-cells" class="w-3.5 h-3.5" />
              <span>Leaderboard ({{ asm.submissionsCount }})</span>
            </button>

            <NuxtLink
              :to="`/dashboard/cbt/take/${asm.id}`"
              class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <UIcon name="i-heroicons-play" class="w-3.5 h-3.5" />
              <span>Launch Test Taker</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Anti-Cheat Telemetry Audit Logs -->
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-4">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-gray-900">Live Anti-Cheat Proctoring Incident Telemetry</h3>
            <span class="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <p class="text-xs text-gray-500 mt-0.5">
            Real-time biometric, focus-loss, and copy-interception sensor logs emitted during active candidate sessions
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Severity Filter Chips -->
          <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-[10px] font-mono">
            <button
              v-for="s in ['All', 'High', 'Medium', 'Low']"
              :key="s"
              @click="telemetryFilter = s"
              :class="[
                'px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer',
                telemetryFilter === s ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              ]"
            >
              {{ s }}
            </button>
          </div>

          <button
            @click="loadTelemetry"
            class="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer"
            title="Refresh sensor stream"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="{ 'animate-spin': isRefreshingTelemetry }" />
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-gray-200 text-gray-400 font-mono uppercase text-[10px]">
              <th class="py-2.5 px-3">Student Candidate</th>
              <th class="py-2.5 px-3">Exam Paper ID</th>
              <th class="py-2.5 px-3">Violation Event</th>
              <th class="py-2.5 px-3">Telemetry Details</th>
              <th class="py-2.5 px-3">Timestamp</th>
              <th class="py-2.5 px-3 text-center">Severity</th>
              <th class="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="filteredTelemetry.length === 0">
              <td colspan="7" class="py-6 text-center text-gray-400 font-mono text-xs">
                Zero telemetry violations recorded for this filter.
              </td>
            </tr>
            <tr v-for="log in filteredTelemetry" :key="log.id" class="hover:bg-gray-50/60 transition-colors">
              <td class="py-3 px-3">
                <div class="font-bold text-gray-900">{{ log.student_name || log.studentName }}</div>
                <div class="text-[10px] font-mono text-gray-400">{{ log.student_id || log.studentId }}</div>
              </td>
              <td class="py-3 px-3 text-gray-600 font-mono">{{ log.assessment_id || log.assessmentId }}</td>
              <td class="py-3 px-3">
                <span class="font-mono text-xs font-semibold text-gray-800 uppercase">
                  {{ (log.event_type || log.eventType || '').replace('_', ' ') }}
                </span>
              </td>
              <td class="py-3 px-3 text-gray-700 max-w-xs truncate">{{ log.details }}</td>
              <td class="py-3 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">{{ log.timestamp }}</td>
              <td class="py-3 px-3 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full font-mono text-[10px] font-bold',
                    getSeverity(log.event_type || log.eventType) === 'High' ? 'bg-red-100 text-red-800' :
                    getSeverity(log.event_type || log.eventType) === 'Medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  ]"
                >
                  {{ getSeverity(log.event_type || log.eventType) }}
                </span>
              </td>
              <td class="py-3 px-3 text-right">
                <button
                  @click="dismissTelemetry(log.id)"
                  class="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Create New CBT Assessment -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Create New CBT Assessment</h3>
            <p class="text-xs text-gray-500">Configure parameters, anti-cheat sensors, and author question banks.</p>
          </div>
          <button
            @click="showCreateModal = false"
            class="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Form fields -->
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
              <select
                v-model="formAssessment.subject"
                class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option v-for="s in subjectsList.filter(x => x !== 'All')" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Target Class Level</label>
              <input
                v-model="formAssessment.classLevel"
                type="text"
                placeholder="e.g. SS 2 Science"
                class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Examination Title</label>
            <input
              v-model="formAssessment.title"
              type="text"
              placeholder="e.g. SS 2 Physics Midterm Examination"
              class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Assessment Type</label>
              <select
                v-model="formAssessment.type"
                class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option v-for="t in typesList.filter(x => x !== 'All')" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Duration (Mins)</label>
              <input
                v-model.number="formAssessment.durationMinutes"
                type="number"
                min="5"
                max="180"
                class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Total Marks</label>
              <input
                v-model.number="formAssessment.totalMarks"
                type="number"
                min="10"
                max="100"
                class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Candidate Instructions</label>
            <textarea
              v-model="formAssessment.instructions"
              rows="2"
              class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <!-- Proctoring Checkboxes -->
          <div class="flex items-center gap-6 p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <label class="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
              <input
                type="checkbox"
                v-model="formAssessment.antiCheatEnabled"
                class="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <span>Enable Anti-Cheat Proctoring Sensors</span>
            </label>

            <label class="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
              <input
                type="checkbox"
                v-model="formAssessment.isPublished"
                class="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <span>Publish Immediately to Students</span>
            </label>
          </div>

          <!-- Question Bank Authoring Section -->
          <div class="space-y-4 pt-2">
            <div class="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 class="text-xs font-bold font-mono text-gray-900 uppercase">
                Questions Bank ({{ formAssessment.questions.length }})
              </h4>
              <button
                type="button"
                @click="addQuestion"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-all cursor-pointer"
              >
                <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div
              v-for="(q, qIdx) in formAssessment.questions"
              :key="q.id || qIdx"
              class="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold font-mono text-emerald-700">Question {{ qIdx + 1 }}</span>
                <button
                  type="button"
                  @click="removeQuestion(qIdx)"
                  class="text-gray-400 hover:text-red-600 cursor-pointer"
                  :disabled="formAssessment.questions.length <= 1"
                >
                  <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                </button>
              </div>

              <div>
                <input
                  v-model="q.questionText"
                  type="text"
                  placeholder="Enter question statement or problem..."
                  class="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <!-- 4 Options -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div v-for="(opt, optIdx) in q.options" :key="optIdx" class="flex items-center gap-2">
                  <input
                    type="radio"
                    :name="`correct-${qIdx}`"
                    :value="optIdx"
                    v-model="q.correctIndex"
                    class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    :title="`Mark Option ${['A', 'B', 'C', 'D'][optIdx]} as correct`"
                  />
                  <input
                    v-model="q.options[optIdx]"
                    type="text"
                    :placeholder="`Option ${['A', 'B', 'C', 'D'][optIdx]}`"
                    class="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <input
                  v-model="q.explanation"
                  type="text"
                  placeholder="Answer explanation / textbook reference (shown post-submission)..."
                  class="w-full px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[11px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            @click="showCreateModal = false"
            class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleCreateAssessment"
            :disabled="isSaving"
            class="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <UIcon v-if="isSaving" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <span>Save & Schedule Assessment</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Edit Assessment -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Edit CBT Assessment</h3>
            <p class="text-xs text-gray-500">Update parameters, duration, or question bank contents.</p>
          </div>
          <button
            @click="showEditModal = false"
            class="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Edit Form -->
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Title</label>
              <input
                v-model="formAssessment.title"
                type="text"
                class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Class Level</label>
              <input
                v-model="formAssessment.classLevel"
                type="text"
                class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Duration (Mins)</label>
              <input
                v-model.number="formAssessment.durationMinutes"
                type="number"
                class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Total Marks</label>
              <input
                v-model.number="formAssessment.totalMarks"
                type="number"
                class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Published</label>
              <select
                v-model="formAssessment.isPublished"
                class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
              >
                <option :value="true">Published</option>
                <option :value="false">Draft</option>
              </select>
            </div>
          </div>

          <!-- Questions list preview -->
          <div class="space-y-3 pt-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold font-mono text-gray-900 uppercase">
                Questions ({{ formAssessment.questions.length }})
              </span>
              <button
                type="button"
                @click="addQuestion"
                class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold"
              >
                + Add Question
              </button>
            </div>

            <div
              v-for="(q, qIdx) in formAssessment.questions"
              :key="q.id || qIdx"
              class="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs"
            >
              <div class="flex items-center justify-between">
                <span class="font-mono font-bold text-emerald-700">Question {{ qIdx + 1 }}</span>
                <button
                  type="button"
                  @click="removeQuestion(qIdx)"
                  class="text-gray-400 hover:text-red-600"
                >
                  <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                </button>
              </div>
              <input
                v-model="q.questionText"
                type="text"
                class="w-full px-3 py-1.5 rounded-lg bg-white border border-gray-200"
              />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            @click="showEditModal = false"
            class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleUpdateAssessment"
            :disabled="isSaving"
            class="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-sm"
          >
            Update Assessment
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Submissions Dossier & Leaderboard -->
    <div
      v-if="showSubmissionsModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <div class="text-[10px] font-mono text-emerald-600 uppercase font-bold">
              {{ activeSubmissionsAssessment?.subject }} • {{ activeSubmissionsAssessment?.classLevel }}
            </div>
            <h3 class="text-lg font-bold text-gray-900">{{ activeSubmissionsAssessment?.title }}</h3>
            <p class="text-xs text-gray-500">Candidate score leaderboard, percentage breakdown, and verification stamps.</p>
          </div>
          <button
            @click="showSubmissionsModal = false"
            class="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Leaderboard Table -->
        <div v-if="isLoadingSubmissions" class="py-8 text-center text-xs text-gray-400">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          Loading candidate submissions...
        </div>

        <div v-else-if="submissionsList.length === 0" class="py-8 text-center text-xs text-gray-400">
          <UIcon name="i-heroicons-user-minus" class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          No candidate submissions recorded yet for this exam session.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-gray-200 text-gray-400 font-mono uppercase text-[10px]">
                <th class="py-2.5 px-3">Rank</th>
                <th class="py-2.5 px-3">Student Candidate</th>
                <th class="py-2.5 px-3 text-center">Score</th>
                <th class="py-2.5 px-3 text-center">Percentage</th>
                <th class="py-2.5 px-3 text-center">Status</th>
                <th class="py-2.5 px-3 text-right">Submitted At</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(sub, idx) in submissionsList"
                :key="sub.id"
                class="hover:bg-gray-50/60"
              >
                <td class="py-3 px-3 font-mono font-bold text-gray-400">#{{ idx + 1 }}</td>
                <td class="py-3 px-3">
                  <div class="font-bold text-gray-900">{{ sub.studentName }}</div>
                  <div class="text-[10px] font-mono text-gray-400">{{ sub.studentId }}</div>
                </td>
                <td class="py-3 px-3 text-center font-bold text-gray-900">
                  {{ sub.score }} / {{ sub.totalMarks }}
                </td>
                <td class="py-3 px-3 text-center font-mono font-bold text-emerald-600">
                  {{ sub.percentage }}%
                </td>
                <td class="py-3 px-3 text-center">
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold',
                      sub.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ sub.passed ? 'PASSED' : 'FAILED' }}
                  </span>
                </td>
                <td class="py-3 px-3 text-right text-gray-500 font-mono text-[11px]">
                  {{ sub.submittedAt }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-end pt-4 border-t border-gray-100">
          <button
            type="button"
            @click="showSubmissionsModal = false"
            class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
