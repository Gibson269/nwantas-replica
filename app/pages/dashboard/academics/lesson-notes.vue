<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'
import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'AI Lesson Planner & Curriculum Approval Suite'
})

const { fetchApi } = useNwantasApi()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

interface LessonNote {
  id: string
  tenantId?: string
  schoolId?: string
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
  createdAt?: string
  updatedAt?: string
}

const notes = ref<LessonNote[]>([])
const selectedNote = ref<LessonNote | null>(null)
const isLoading = ref(true)
const isGenerating = ref(false)
const isSubmittingApproval = ref(false)
const searchFilter = ref('')
const selectedStatusFilter = ref('ALL')

// Generator Parameters
const formSubject = ref('Physics')
const formTopic = ref('Electromagnetic Induction & Faraday\'s Laws')
const formClassLevel = ref('SS 2 Science')
const formDuration = ref('80 Minutes (Double Period)')
const formPedagogicalFocus = ref('Bloom\'s Analysis & Laboratory Discovery')
const formStandard = ref('NERDC / Cambridge Dual Alignment')

const isGeneratorExpanded = ref(true)
const isPrintModalOpen = ref(false)
const isEditingMode = ref(false)
const newCommentText = ref('')
const feedbackMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

// Topic suggestions per subject
const SUBJECT_PRESETS: Record<string, string[]> = {
  Physics: [
    'Electromagnetic Induction & Faraday\'s Laws',
    'Quantum Duality & Photoelectric Emission',
    'Wave Interference, Diffraction & Polarization',
    'Thermodynamics & Carnot Engine Efficiency'
  ],
  Chemistry: [
    'Stoichiometry & Ideal Gas Equations',
    'Organic Chemistry: Hydrocarbons & Esters',
    'Electrolysis & Quantitative Faraday Calculations',
    'Periodic Trends & Transition Element Complexes'
  ],
  Mathematics: [
    'Circle Geometry & Tangent Theorems',
    'Quadratic Curves & Parabolic Trajectories',
    'Differentiation from First Principles',
    'Trigonometric Identities & Sine/Cosine Rules'
  ],
  Biology: [
    'Genetics & Mendelian Monohybrid Crosses',
    'Cellular Respiration & Krebs Cycle',
    'Ecology & Nutrient Cycles in Ecosystems',
    'Human Circulatory & Lymphatic Systems'
  ],
  English: [
    'Argumentative Discourse & Formal Persuasion',
    'Lexis and Structure: Idiomatic Expressions',
    'Literary Analysis: Tragic Flaw in Shakespeare',
    'Summary Writing & Reading Comprehension Skills'
  ],
  Economics: [
    'Price Elasticity of Demand & Supply Dynamics',
    'Monetary Policy & Central Bank Interest Rates',
    'International Trade & Balance of Payments',
    'National Income Accounting: GDP & GNP Models'
  ]
}

function handleSelectSubject(subj: string) {
  formSubject.value = subj
  const topics = SUBJECT_PRESETS[subj]
  if (topics && topics.length > 0) {
    formTopic.value = topics[0] || ''
  }
}

async function loadNotes() {
  isLoading.value = true
  try {
    const res = await fetchApi('/api/v1/lesson-notes')
    notes.value = res.data || []
    if (notes.value.length > 0) {
      if (!selectedNote.value || !notes.value.some(n => n.id === selectedNote.value?.id)) {
        selectedNote.value = notes.value[0] || null
      } else {
        selectedNote.value = notes.value.find(n => n.id === selectedNote.value?.id) || notes.value[0] || null
      }
    }
  } catch (err: any) {
    console.error('Failed to load lesson notes:', err)
  } finally {
    isLoading.value = false
  }
}

const filteredNotes = computed(() => {
  return notes.value.filter(n => {
    const matchesSearch =
      n.topic.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      n.author.toLowerCase().includes(searchFilter.value.toLowerCase())

    const matchesStatus =
      selectedStatusFilter.value === 'ALL' ||
      n.status.toLowerCase().replace(/\s+/g, '') === selectedStatusFilter.value.toLowerCase().replace(/\s+/g, '')

    return matchesSearch && matchesStatus
  })
})

async function handleGenerateAI() {
  isGenerating.value = true
  feedbackMessage.value = null

  try {
    const res = await fetchApi('/api/v1/lesson-notes/generate', {
      method: 'POST',
      body: {
        subject: formSubject.value,
        topic: formTopic.value,
        classLevel: formClassLevel.value,
        duration: formDuration.value,
        pedagogicalFocus: formPedagogicalFocus.value,
        curriculumStandard: formStandard.value
      }
    })

    notes.value.unshift(res.data)
    selectedNote.value = res.data
    feedbackMessage.value = {
      type: 'success',
      text: `AI generated structured lesson note for ${res.data.topic}!`
    }
    setTimeout(() => {
      feedbackMessage.value = null
    }, 4000)
  } catch (err: any) {
    feedbackMessage.value = {
      type: 'error',
      text: err.data?.statusMessage || err.message || 'Generation failed'
    }
  } finally {
    isGenerating.value = false
  }
}

async function handleTransitionApproval(nextStatus: 'Submitted' | 'HOD Approved' | 'Principal Approved') {
  if (!selectedNote.value) return
  isSubmittingApproval.value = true

  try {
    const res = await fetchApi(`/api/v1/lesson-notes/${selectedNote.value.id}/approve`, {
      method: 'POST',
      body: {
        approver: authStore.currentUser.name,
        role: authStore.currentUser.roleTitle,
        nextStatus
      }
    })

    selectedNote.value.status = res.data.status
    selectedNote.value.comments = res.data.comments

    // Update in list
    const foundIndex = notes.value.findIndex(n => n.id === selectedNote.value?.id)
    if (foundIndex >= 0) {
      notes.value[foundIndex] = { ...selectedNote.value }
    }
  } catch (err: any) {
    alert(err.data?.statusMessage || err.message || 'Approval status transition failed')
  } finally {
    isSubmittingApproval.value = false
  }
}

async function handleAddComment() {
  if (!newCommentText.value.trim() || !selectedNote.value) return

  const text = newCommentText.value.trim()
  newCommentText.value = ''

  try {
    const res = await fetchApi(`/api/v1/lesson-notes/${selectedNote.value.id}/comments`, {
      method: 'POST',
      body: {
        author: authStore.currentUser.name,
        role: authStore.currentUser.roleTitle,
        text
      }
    })

    selectedNote.value.comments.push(res.data)
  } catch (err: any) {
    alert(err.data?.statusMessage || err.message || 'Failed to post comment')
  }
}

async function handleSaveEdits() {
  if (!selectedNote.value) return

  try {
    await fetchApi(`/api/v1/lesson-notes/${selectedNote.value.id}`, {
      method: 'PUT',
      body: {
        topic: selectedNote.value.topic,
        objectives: selectedNote.value.objectives,
        prerequisites: selectedNote.value.prerequisites,
        materials: selectedNote.value.materials,
        contentSections: selectedNote.value.contentSections,
        assessmentQuestions: selectedNote.value.assessmentQuestions
      }
    })

    isEditingMode.value = false
    alert('Lesson note content updated successfully and saved to database.')
  } catch (err: any) {
    alert(err.data?.statusMessage || err.message || 'Save failed')
  }
}

async function handleDeleteNote(note: LessonNote) {
  if (!confirm(`Are you sure you want to delete lesson note "${note.topic}"?`)) return

  try {
    await fetchApi(`/api/v1/lesson-notes/${note.id}`, { method: 'DELETE' })
    notes.value = notes.value.filter(n => n.id !== note.id)
    if (selectedNote.value?.id === note.id) {
      selectedNote.value = notes.value[0] || null
    }
  } catch (err: any) {
    alert(err.data?.statusMessage || err.message || 'Delete failed')
  }
}

function printLessonPlan() {
  isPrintModalOpen.value = true
}

onMounted(() => {
  loadNotes()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5" />
          <span>NERDC & CAMBRIDGE CURRICULUM SUITE</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">AI Lesson Planner & Multi-Stage Approval</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Generate structured 4-phase pedagogical delivery plans, annotate with peer review remarks, and endorse via HOD and Principal review gates.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer shadow-2xs transition-all"
          @click="isGeneratorExpanded = !isGeneratorExpanded"
        >
          <UIcon :name="isGeneratorExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4" />
          <span>{{ isGeneratorExpanded ? 'Hide AI Prompt Studio' : 'Show AI Prompt Studio' }}</span>
        </button>
        <button
          :disabled="isGenerating"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          @click="handleGenerateAI"
        >
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4 animate-pulse" />
          <span>{{ isGenerating ? 'AI Synthesizing Plan...' : 'Generate New Note' }}</span>
        </button>
      </div>
    </div>

    <!-- Feedback Banner -->
    <div
      v-if="feedbackMessage"
      :class="[
        'p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between animate-fade-in',
        feedbackMessage.type === 'success' ? 'bg-purple-50 text-purple-900 border border-purple-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
      ]"
    >
      <div class="flex items-center gap-2">
        <UIcon :name="feedbackMessage.type === 'success' ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-triangle'" class="w-4 h-4" />
        <span>{{ feedbackMessage.text }}</span>
      </div>
      <button class="font-bold text-sm cursor-pointer" @click="feedbackMessage = null">&times;</button>
    </div>

    <!-- AI Prompt Studio Accordion / Drawer -->
    <div
      v-if="isGeneratorExpanded"
      class="bg-gradient-to-br from-purple-50/80 via-white to-emerald-50/50 rounded-3xl p-6 border border-purple-200/70 shadow-sm space-y-4 animate-fade-in"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-mono font-bold uppercase text-purple-950 flex items-center gap-2">
          <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4 text-purple-600" />
          <span>Curriculum AI Generation Studio</span>
        </h3>
        <span class="text-[10px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-semibold">
          High-Fidelity Pedagogical Model Active
        </span>
      </div>

      <!-- Quick Subject Preset Chips -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-[10px] font-mono font-bold uppercase text-gray-500 mr-1">Subject Presets:</span>
        <button
          v-for="subj in Object.keys(SUBJECT_PRESETS)"
          :key="subj"
          type="button"
          :class="[
            'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            formSubject === subj ? 'bg-purple-600 text-white shadow-2xs' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          ]"
          @click="handleSelectSubject(subj)"
        >
          {{ subj }}
        </button>
      </div>

      <!-- Prompt Input Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label class="block text-[10px] font-mono font-bold uppercase text-gray-600 mb-1">Topic / Lesson Focus *</label>
          <input
            v-model="formTopic"
            type="text"
            class="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 outline-none focus:border-purple-500 font-semibold text-gray-900"
          >
        </div>
        <div>
          <label class="block text-[10px] font-mono font-bold uppercase text-gray-600 mb-1">Class Level *</label>
          <select
            v-model="formClassLevel"
            class="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 outline-none focus:border-purple-500 font-medium text-gray-900"
          >
            <option value="JSS 1">JSS 1 (Junior Secondary 1)</option>
            <option value="JSS 2">JSS 2 (Junior Secondary 2)</option>
            <option value="JSS 3">JSS 3 (Junior Secondary 3)</option>
            <option value="SS 1 Science">SS 1 Science</option>
            <option value="SS 2 Science">SS 2 Science</option>
            <option value="SS 3 Science">SS 3 Science</option>
            <option value="SS 2 Arts & Humanities">SS 2 Arts & Humanities</option>
            <option value="SS 3 Commercial">SS 3 Commercial</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-mono font-bold uppercase text-gray-600 mb-1">Curriculum Standard</label>
          <select
            v-model="formStandard"
            class="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 outline-none focus:border-purple-500 font-medium text-gray-900"
          >
            <option value="NERDC / Cambridge Dual Alignment">NERDC & Cambridge Dual Alignment</option>
            <option value="WAEC WASSCE Examination Standard">WAEC WASSCE Examination Standard</option>
            <option value="Cambridge IGCSE Extended">Cambridge IGCSE Extended</option>
            <option value="British National Curriculum">British National Curriculum</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-mono font-bold uppercase text-gray-600 mb-1">Pedagogical Framework</label>
          <select
            v-model="formPedagogicalFocus"
            class="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 outline-none focus:border-purple-500 font-medium text-gray-900"
          >
            <option value="Bloom's Analysis & Laboratory Discovery">Bloom's Analysis & Laboratory Discovery</option>
            <option value="Socratic Inquiry & Concept Deconstruction">Socratic Inquiry & Concept Deconstruction</option>
            <option value="Mathematical Derivation & Worked Proofs">Mathematical Derivation & Worked Proofs</option>
            <option value="Peer Formative Plenary & Speed Drills">Peer Formative Plenary & Speed Drills</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Studio Workspace: 2-Column Split -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Notes Repository (4 cols) -->
      <div class="lg:col-span-4 space-y-3">
        <!-- Search and Status Pills -->
        <div class="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
          <div class="relative">
            <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              v-model="searchFilter"
              type="text"
              placeholder="Search topic, subject, author..."
              class="w-full pl-9 pr-3 py-1.5 bg-gray-50 rounded-xl text-xs border border-gray-200 outline-none focus:border-purple-500"
            >
          </div>
          <div class="flex items-center gap-1 overflow-x-auto text-[10px] font-mono">
            <button
              v-for="st in [
                { label: 'All', value: 'ALL' },
                { label: 'Drafts', value: 'Draft' },
                { label: 'Submitted', value: 'Submitted' },
                { label: 'Approved', value: 'Principal Approved' }
              ]"
              :key="st.value"
              :class="[
                'px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer shrink-0',
                selectedStatusFilter === st.value ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
              @click="selectedStatusFilter = st.value"
            >
              {{ st.label }}
            </button>
          </div>
        </div>

        <!-- Notes List Scrollable -->
        <div v-if="isLoading" class="p-8 text-center text-xs text-gray-400 font-mono">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin mx-auto mb-1 text-purple-600" />
          Loading curriculum repository...
        </div>

        <div v-else-if="filteredNotes.length === 0" class="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-xs text-gray-500">
          No lesson notes match your filter.
        </div>

        <div v-else class="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
          <div
            v-for="note in filteredNotes"
            :key="note.id"
            :class="[
              'p-4 rounded-2xl border transition-all cursor-pointer text-left group',
              selectedNote?.id === note.id
                ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-500/15'
                : 'bg-white border-gray-100 hover:border-gray-300 shadow-2xs'
            ]"
            @click="selectedNote = note; isEditingMode = false"
          >
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] font-mono font-extrabold text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded">
                {{ note.subject }}
              </span>
              <span
                :class="[
                  'text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full',
                  note.status === 'Principal Approved' ? 'bg-emerald-100 text-emerald-800' :
                  note.status === 'HOD Approved' ? 'bg-blue-100 text-blue-800' :
                  note.status === 'Submitted' ? 'bg-purple-100 text-purple-800' :
                  'bg-amber-100 text-amber-800'
                ]"
              >
                {{ note.status }}
              </span>
            </div>

            <h4 class="text-xs font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1 mb-1">
              {{ note.topic }}
            </h4>

            <div class="flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>{{ note.classLevel }} &bull; Wk {{ note.week }}</span>
              <span>{{ (note.comments || []).length }} comments</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Interactive Note Viewer, Editor & Approval Gate (8 cols) -->
      <div v-if="selectedNote" class="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <!-- Top Action Header -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-mono font-extrabold text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded">
                {{ selectedNote.subject }}
              </span>
              <span class="text-gray-300">&bull;</span>
              <span class="text-xs text-gray-500 font-mono">{{ selectedNote.classLevel }} &bull; Week {{ selectedNote.week }}</span>
              <span class="text-gray-300">&bull;</span>
              <span class="text-xs text-gray-500 font-mono">{{ selectedNote.term }}</span>
            </div>

            <div v-if="!isEditingMode">
              <h2 class="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{{ selectedNote.topic }}</h2>
              <div class="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                <UIcon name="i-heroicons-user" class="w-3.5 h-3.5 text-purple-600" />
                <span>Author: {{ selectedNote.author }} ({{ selectedNote.authorRole }})</span>
              </div>
            </div>
            <div v-else class="mt-2">
              <input
                v-model="selectedNote.topic"
                type="text"
                class="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-lg font-bold"
              >
            </div>
          </div>

          <!-- Actions Toolbar -->
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <!-- Edit / Save Toggle -->
            <button
              v-if="!isEditingMode"
              class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              @click="isEditingMode = true"
            >
              <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
              <span>Edit Note</span>
            </button>
            <button
              v-else
              class="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
              @click="handleSaveEdits"
            >
              <UIcon name="i-heroicons-check" class="w-4 h-4" />
              <span>Save Changes</span>
            </button>

            <!-- Print / Export PDF -->
            <button
              class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              @click="printLessonPlan"
            >
              <UIcon name="i-heroicons-printer" class="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            <!-- Delete draft -->
            <button
              v-if="selectedNote.status === 'Draft'"
              class="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
              title="Delete Note"
              @click="handleDeleteNote(selectedNote)"
            >
              <UIcon name="i-heroicons-trash" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Approval Gate Banner -->
        <div class="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs',
                selectedNote.status === 'Principal Approved' ? 'bg-emerald-500 text-white' :
                selectedNote.status === 'HOD Approved' ? 'bg-blue-500 text-white' :
                'bg-amber-500 text-white'
              ]"
            >
              <UIcon :name="selectedNote.status === 'Principal Approved' ? 'i-heroicons-check-badge' : 'i-heroicons-clock'" class="w-5 h-5" />
            </div>
            <div>
              <span class="text-[10px] font-mono font-bold uppercase text-gray-400 block">Approval Workflow Stage</span>
              <span class="text-sm font-extrabold text-gray-900">{{ selectedNote.status }}</span>
            </div>
          </div>

          <!-- Dynamic Gate Transitions -->
          <div class="flex items-center gap-2">
            <!-- Stage 1: Draft -> Submit -->
            <button
              v-if="selectedNote.status === 'Draft'"
              :disabled="isSubmittingApproval"
              class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
              @click="handleTransitionApproval('Submitted')"
            >
              Submit for HOD Review &rarr;
            </button>

            <!-- Stage 2: Submitted -> HOD Approved -->
            <button
              v-if="selectedNote.status === 'Submitted'"
              :disabled="isSubmittingApproval"
              class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
              @click="handleTransitionApproval('HOD Approved')"
            >
              Endorse as HOD &rarr;
            </button>

            <!-- Stage 3: HOD Approved -> Principal Approved -->
            <button
              v-if="selectedNote.status === 'HOD Approved'"
              :disabled="isSubmittingApproval"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              @click="handleTransitionApproval('Principal Approved')"
            >
              <UIcon name="i-heroicons-check-badge" class="w-4 h-4" />
              <span>Final Principal Approval & Digital Seal</span>
            </button>

            <!-- Completed Seal -->
            <div
              v-if="selectedNote.status === 'Principal Approved'"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-mono font-bold"
            >
              <UIcon name="i-heroicons-shield-check" class="w-4 h-4" />
              <span>Pedagogically Certified</span>
            </div>
          </div>
        </div>

        <!-- Section 1: Behavioral Learning Objectives (Bloom's Taxonomy) -->
        <div class="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-mono font-bold uppercase text-gray-500 flex items-center gap-1.5">
              <UIcon name="i-heroicons-flag" class="w-4 h-4 text-emerald-600" />
              <span>Behavioral Learning Objectives (Bloom's Taxonomy)</span>
            </h4>
          </div>

          <div v-if="!isEditingMode" class="space-y-2 text-xs text-gray-700">
            <div
              v-for="(obj, i) in selectedNote.objectives"
              :key="i"
              class="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-gray-100 shadow-2xs"
            >
              <span class="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                {{ i + 1 }}
              </span>
              <span class="leading-relaxed">{{ obj }}</span>
            </div>
          </div>
          <div v-else class="space-y-2">
            <div v-for="(obj, i) in selectedNote.objectives" :key="i">
              <input
                v-model="selectedNote.objectives[i]"
                type="text"
                class="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs"
              >
            </div>
          </div>
        </div>

        <!-- Section 2: Prerequisites & Instructional Materials -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <h4 class="text-xs font-mono font-bold uppercase text-gray-500 mb-2 flex items-center gap-1.5">
              <UIcon name="i-heroicons-cube-transparent" class="w-4 h-4 text-purple-600" />
              <span>Instructional Materials & Apparatus</span>
            </h4>
            <ul class="space-y-1.5 text-xs text-gray-700">
              <li v-for="(mat, i) in selectedNote.materials" :key="i" class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>{{ mat }}</span>
              </li>
            </ul>
          </div>

          <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <h4 class="text-xs font-mono font-bold uppercase text-gray-500 mb-2 flex items-center gap-1.5">
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-blue-600" />
              <span>Entry Behavior & Prior Schema</span>
            </h4>
            <p class="text-xs text-gray-700 leading-relaxed">{{ selectedNote.prerequisites }}</p>
          </div>
        </div>

        <!-- Section 3: 4-Phase Step-by-Step Delivery Plan -->
        <div class="space-y-3">
          <h4 class="text-xs font-mono font-bold uppercase text-gray-500 flex items-center gap-1.5">
            <UIcon name="i-heroicons-queue-list" class="w-4 h-4 text-gray-400" />
            <span>4-Phase Instructional Delivery Framework</span>
          </h4>

          <div class="space-y-3">
            <div
              v-for="(sec, idx) in selectedNote.contentSections"
              :key="idx"
              class="p-4 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-colors shadow-2xs"
            >
              <div class="flex items-center gap-2 text-xs font-bold text-gray-900 mb-1.5">
                <span class="w-6 h-6 rounded-lg bg-gray-100 font-mono text-[11px] flex items-center justify-center text-gray-700">
                  {{ idx + 1 }}
                </span>
                <span>{{ sec.title }}</span>
              </div>
              <p v-if="!isEditingMode" class="text-xs text-gray-600 leading-relaxed pl-8">
                {{ sec.body }}
              </p>
              <textarea
                v-else
                v-model="sec.body"
                rows="3"
                class="w-full mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Section 4: Diagnostic Continuous Assessment Questions -->
        <div class="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
          <h4 class="text-xs font-mono font-bold uppercase text-purple-900 flex items-center gap-1.5">
            <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4 text-purple-600" />
            <span>Diagnostic Formative Evaluation Questions</span>
          </h4>
          <ol class="list-decimal list-inside space-y-1.5 text-xs text-gray-800">
            <li v-for="(q, i) in selectedNote.assessmentQuestions" :key="i" class="leading-relaxed">
              {{ q }}
            </li>
          </ol>
        </div>

        <!-- Section 5: Peer Comments & Collaborative Endorsements -->
        <div class="pt-6 border-t border-gray-100 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-mono font-bold uppercase text-gray-500 flex items-center gap-1.5">
              <UIcon name="i-heroicons-chat-bubble-left-right" class="w-4 h-4 text-gray-400" />
              <span>Peer Review Comments & Sign-off Audit Trail ({{ selectedNote.comments.length }})</span>
            </h4>
          </div>

          <div class="space-y-2.5 max-h-56 overflow-y-auto">
            <div
              v-for="c in selectedNote.comments"
              :key="c.id"
              class="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-gray-900">{{ c.author }} <span class="text-gray-500 font-normal">({{ c.role }})</span></span>
                <span class="text-[10px] text-gray-400 font-mono">{{ c.date }}</span>
              </div>
              <p class="text-gray-700 leading-relaxed">{{ c.text }}</p>
            </div>
          </div>

          <!-- Add Comment Input (Persisted to SQLite) -->
          <div class="flex items-center gap-2 pt-2">
            <input
              v-model="newCommentText"
              type="text"
              placeholder="Add peer review feedback or pedagogical endorsements..."
              class="flex-1 px-4 py-2.5 text-xs rounded-xl border border-gray-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              @keydown.enter.prevent="handleAddComment"
            >
            <button
              class="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all"
              @click="handleAddComment"
            >
              Post Remark
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Official Printable Lesson Plan Document -->
    <div
      v-if="isPrintModalOpen && selectedNote"
      class="fixed inset-0 bg-gray-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isPrintModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-gray-200 max-h-[92vh] flex flex-col overflow-y-auto">
        <!-- Close Bar -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200 mb-6 print:hidden">
          <span class="text-xs font-mono font-bold text-gray-500">OFFICIAL ACADEMIC DELIVERY DOCUMENT</span>
          <div class="flex items-center gap-2">
            <button
              class="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              onclick="window.print()"
            >
              <UIcon name="i-heroicons-printer" class="w-4 h-4" />
              <span>Print Document</span>
            </button>
            <button class="p-2 text-gray-400 hover:text-gray-700 cursor-pointer" @click="isPrintModalOpen = false">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Printable Document Header -->
        <div class="text-center pb-6 border-b-2 border-gray-900 mb-6 space-y-1">
          <div class="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-sm">
            {{ tenantStore.currentTenant.symbol === '£' ? 'K' : 'A' }}
          </div>
          <h2 class="text-xl font-extrabold text-gray-900 uppercase tracking-tight mt-2">{{ tenantStore.currentTenant.name }}</h2>
          <p class="text-xs text-gray-600 font-serif italic">{{ tenantStore.currentTenant.motto }}</p>
          <div class="text-[11px] font-mono text-gray-500 pt-1">
            DEPARTMENT OF ACADEMIC QUALITY ASSURANCE & PEDAGOGY &bull; LESSON NOTE REF: {{ selectedNote.id.toUpperCase() }}
          </div>
        </div>

        <!-- Metadata Table -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs mb-6 font-mono">
          <div>
            <span class="text-gray-400 text-[10px] block">SUBJECT</span>
            <span class="font-bold text-gray-900">{{ selectedNote.subject }}</span>
          </div>
          <div>
            <span class="text-gray-400 text-[10px] block">CLASS LEVEL</span>
            <span class="font-bold text-gray-900">{{ selectedNote.classLevel }}</span>
          </div>
          <div>
            <span class="text-gray-400 text-[10px] block">TERM & WEEK</span>
            <span class="font-bold text-gray-900">{{ selectedNote.term }} (Wk {{ selectedNote.week }})</span>
          </div>
          <div>
            <span class="text-gray-400 text-[10px] block">STATUS</span>
            <span class="font-bold text-emerald-700">{{ selectedNote.status }}</span>
          </div>
        </div>

        <!-- Document Content -->
        <div class="space-y-6 text-xs text-gray-800 leading-relaxed font-sans">
          <div>
            <h3 class="text-sm font-bold text-gray-900 uppercase font-mono border-b border-gray-200 pb-1 mb-2">Module Topic</h3>
            <p class="font-bold text-base text-gray-900">{{ selectedNote.topic }}</p>
          </div>

          <div>
            <h3 class="text-sm font-bold text-gray-900 uppercase font-mono border-b border-gray-200 pb-1 mb-2">1. Behavioral Objectives</h3>
            <ul class="list-disc list-inside space-y-1">
              <li v-for="(obj, i) in selectedNote.objectives" :key="i">{{ obj }}</li>
            </ul>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-bold text-gray-900 uppercase font-mono border-b border-gray-200 pb-1 mb-2">2. Materials</h3>
              <ul class="list-disc list-inside space-y-1">
                <li v-for="(m, i) in selectedNote.materials" :key="i">{{ m }}</li>
              </ul>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 uppercase font-mono border-b border-gray-200 pb-1 mb-2">3. Prerequisites</h3>
              <p>{{ selectedNote.prerequisites }}</p>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-bold text-gray-900 uppercase font-mono border-b border-gray-200 pb-1 mb-2">4. Instructional Delivery Phases</h3>
            <div class="space-y-3">
              <div v-for="(sec, i) in selectedNote.contentSections" :key="i" class="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div class="font-bold font-mono text-[11px] text-gray-900 mb-1">{{ sec.title }}</div>
                <p>{{ sec.body }}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-bold text-gray-900 uppercase font-mono border-b border-gray-200 pb-1 mb-2">5. Diagnostic Evaluation</h3>
            <ol class="list-decimal list-inside space-y-1">
              <li v-for="(q, i) in selectedNote.assessmentQuestions" :key="i">{{ q }}</li>
            </ol>
          </div>
        </div>

        <!-- Official Endorsement Seals & Signature Block -->
        <div class="pt-8 mt-8 border-t-2 border-gray-900 grid grid-cols-3 gap-6 text-center text-xs font-mono">
          <div>
            <div class="h-10 border-b border-dashed border-gray-400 mb-2 flex items-end justify-center font-serif italic text-gray-600">
              {{ selectedNote.author }}
            </div>
            <span class="block font-bold">Subject Faculty Tutor</span>
            <span class="text-[10px] text-gray-500">Author & Submitter</span>
          </div>
          <div>
            <div class="h-10 border-b border-dashed border-gray-400 mb-2 flex items-end justify-center font-serif italic text-blue-700 font-bold">
              Dr. Chukwuemeka Eze
            </div>
            <span class="block font-bold">Head of Department (HOD)</span>
            <span class="text-[10px] text-gray-500">Pedagogical Endorsement</span>
          </div>
          <div>
            <div class="h-10 border-b border-dashed border-gray-400 mb-2 flex items-end justify-center font-serif italic text-emerald-700 font-bold">
              {{ selectedNote.status === 'Principal Approved' ? 'APPROVED & SEALED' : 'PENDING GATE' }}
            </div>
            <span class="block font-bold">Principal / Academic Director</span>
            <span class="text-[10px] text-gray-500">Institutional Seal</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
