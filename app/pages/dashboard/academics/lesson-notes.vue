<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'AI Lesson Planner & Collaborative Approval Suite'
})

const { fetchApi } = useNwantasApi()
const authStore = useAuthStore()

const notes = ref<any[]>([])
const selectedNote = ref<any | null>(null)
const isLoading = ref(true)
const isGenerating = ref(false)

// Form generation inputs
const formSubject = ref('Physics')
const formTopic = ref('Photoelectric Effect & Quantum Emission')
const formClassLevel = ref('SS 3 Science')
const formDuration = ref('80 Minutes (Double Period)')
const formPedagogicalFocus = ref('Bloom\'s Analysis & Laboratory Discovery')

// New comment input
const newCommentText = ref('')

async function loadNotes() {
  isLoading.value = true
  try {
    const res = await fetchApi('/api/v1/lesson-notes')
    notes.value = res.data
    if (notes.value.length > 0 && !selectedNote.value) {
      selectedNote.value = notes.value[0]
    }
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

async function handleGenerateAI() {
  isGenerating.value = true
  try {
    const res = await fetchApi('/api/v1/lesson-notes/generate', {
      method: 'POST',
      body: {
        subject: formSubject.value,
        topic: formTopic.value,
        classLevel: formClassLevel.value,
        duration: formDuration.value,
        pedagogicalFocus: formPedagogicalFocus.value
      }
    })
    notes.value.unshift(res.data)
    selectedNote.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    isGenerating.value = false
  }
}

async function handleApproveNote() {
  if (!selectedNote.value) return
  try {
    const res = await fetchApi(`/api/v1/lesson-notes/${selectedNote.value.id}/approve`, {
      method: 'POST',
      body: {
        approver: authStore.currentUser.name,
        role: authStore.currentUser.roleTitle
      }
    })
    selectedNote.value.status = res.data.status
    selectedNote.value.comments = res.data.comments
  } catch (e) {
    console.error(e)
  }
}

function handleAddComment() {
  if (!newCommentText.value.trim() || !selectedNote.value) return
  selectedNote.value.comments.push({
    id: `c-${Date.now()}`,
    author: authStore.currentUser.name,
    role: authStore.currentUser.roleTitle,
    text: newCommentText.value.trim(),
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  newCommentText.value = ''
}

onMounted(() => {
  loadNotes()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5" />
          <span>NERDC & CAMBRIDGE PEDAGOGICAL ENGINE</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">AI Lesson Planner & Collaborative Review Suite</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Generate structured pedagogical delivery plans, annotate with inline peer comments, and sign off via the Principal approval gate.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          :disabled="isGenerating"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          @click="handleGenerateAI"
        >
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
          <span>{{ isGenerating ? 'AI Generating Pedagogical Plan...' : 'Generate New AI Lesson Note' }}</span>
        </button>
      </div>
    </div>

    <!-- AI Generator Input Drawer / Panel -->
    <div class="bg-gradient-to-r from-purple-50 via-white to-emerald-50 rounded-3xl p-6 border border-purple-200/60 shadow-xs">
      <h3 class="text-xs font-mono font-bold uppercase text-purple-900 mb-3 flex items-center gap-1.5">
        <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4 text-purple-600" />
        <span>Curriculum Prompt Parameters</span>
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-[11px] font-mono font-bold uppercase text-gray-500 mb-1">Subject</label>
          <input
            v-model="formSubject"
            type="text"
            class="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          >
        </div>
        <div>
          <label class="block text-[11px] font-mono font-bold uppercase text-gray-500 mb-1">Topic / Module Title</label>
          <input
            v-model="formTopic"
            type="text"
            class="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          >
        </div>
        <div>
          <label class="block text-[11px] font-mono font-bold uppercase text-gray-500 mb-1">Class Level</label>
          <input
            v-model="formClassLevel"
            type="text"
            class="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          >
        </div>
        <div>
          <label class="block text-[11px] font-mono font-bold uppercase text-gray-500 mb-1">Pedagogical Framework</label>
          <input
            v-model="formPedagogicalFocus"
            type="text"
            class="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          >
        </div>
      </div>
    </div>

    <!-- Main Two-Column Studio View -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left List of Notes (4 cols) -->
      <div class="lg:col-span-4 space-y-3">
        <h3 class="text-xs font-mono font-bold uppercase text-gray-400 px-1">Curriculum Notes Repository</h3>
        <div
          v-for="note in notes"
          :key="note.id"
          :class="[
            'p-4 rounded-2xl border transition-all cursor-pointer text-left',
            selectedNote?.id === note.id
              ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-500/10'
              : 'bg-white border-gray-200 hover:border-gray-300'
          ]"
          @click="selectedNote = note"
        >
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-mono font-bold text-purple-700 uppercase">{{ note.subject }}</span>
            <span
              :class="[
                'text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full',
                note.status === 'Principal Approved' ? 'bg-emerald-100 text-emerald-800' :
                note.status === 'HOD Approved' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              ]"
            >
              {{ note.status }}
            </span>
          </div>
          <div class="text-sm font-bold text-gray-900 mb-1">{{ note.topic }}</div>
          <div class="text-xs text-gray-500">{{ note.classLevel }} • Week {{ note.week }}</div>
        </div>
      </div>

      <!-- Right Selected Note Interactive Viewer & Approval Editor (8 cols) -->
      <div v-if="selectedNote" class="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <!-- Top Note Action Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-mono font-bold text-purple-700 uppercase">{{ selectedNote.subject }}</span>
              <span class="text-gray-300">•</span>
              <span class="text-xs text-gray-500 font-mono">{{ selectedNote.classLevel }}</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{{ selectedNote.topic }}</h2>
            <div class="text-xs text-gray-400 mt-1">Author: {{ selectedNote.author }} ({{ selectedNote.authorRole }})</div>
          </div>

          <!-- Status & Approval Action -->
          <div class="flex items-center gap-3">
            <span
              :class="[
                'text-xs font-mono font-bold px-3 py-1.5 rounded-xl uppercase',
                selectedNote.status === 'Principal Approved' ? 'bg-emerald-100 text-emerald-800' :
                selectedNote.status === 'HOD Approved' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              ]"
            >
              Status: {{ selectedNote.status }}
            </span>
            <button
              v-if="selectedNote.status !== 'Principal Approved'"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
              @click="handleApproveNote"
            >
              <UIcon name="i-heroicons-check-badge" class="w-4 h-4" />
              <span>Sign Off & Approve</span>
            </button>
          </div>
        </div>

        <!-- Pedagogical Section 1: Learning Objectives -->
        <div class="p-5 rounded-2xl bg-gray-50 border border-gray-100">
          <h4 class="text-xs font-mono font-bold uppercase text-gray-500 mb-2.5 flex items-center gap-1.5">
            <UIcon name="i-heroicons-flag" class="w-4 h-4 text-emerald-600" />
            <span>Behavioral Learning Objectives</span>
          </h4>
          <ul class="space-y-1.5 text-xs text-gray-700">
            <li v-for="(obj, i) in selectedNote.objectives" :key="i" class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>{{ obj }}</span>
            </li>
          </ul>
        </div>

        <!-- Pedagogical Section 2: Instructional Materials & Prerequisites -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <h4 class="text-xs font-mono font-bold uppercase text-gray-500 mb-2">Instructional Materials</h4>
            <ul class="space-y-1 text-xs text-gray-700">
              <li v-for="(mat, i) in selectedNote.materials" :key="i">• {{ mat }}</li>
            </ul>
          </div>
          <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <h4 class="text-xs font-mono font-bold uppercase text-gray-500 mb-2">Entry Behavior / Prerequisites</h4>
            <p class="text-xs text-gray-700 leading-relaxed">{{ selectedNote.prerequisites }}</p>
          </div>
        </div>

        <!-- Pedagogical Section 3: Delivery Steps -->
        <div class="space-y-4">
          <h4 class="text-xs font-mono font-bold uppercase text-gray-500">Step-by-Step Lesson Delivery</h4>
          <div
            v-for="(sec, idx) in selectedNote.contentSections"
            :key="idx"
            class="p-4 rounded-2xl border border-gray-200"
          >
            <div class="font-bold text-xs text-gray-900 mb-1.5">{{ sec.title }}</div>
            <p class="text-xs text-gray-600 leading-relaxed">{{ sec.body }}</p>
          </div>
        </div>

        <!-- Pedagogical Section 4: Assessment Questions -->
        <div class="p-5 rounded-2xl bg-purple-50/60 border border-purple-100">
          <h4 class="text-xs font-mono font-bold uppercase text-purple-900 mb-2.5">Diagnostic Evaluation Questions</h4>
          <ol class="list-decimal list-inside space-y-1.5 text-xs text-gray-800">
            <li v-for="(q, i) in selectedNote.assessmentQuestions" :key="i">{{ q }}</li>
          </ol>
        </div>

        <!-- Collaborative Comments & Peer Review Section -->
        <div class="pt-6 border-t border-gray-100 space-y-4">
          <h4 class="text-xs font-mono font-bold uppercase text-gray-500 flex items-center gap-1.5">
            <UIcon name="i-heroicons-chat-bubble-left-right" class="w-4 h-4 text-gray-400" />
            <span>Collaborative Comments & Academic Endorsements ({{ selectedNote.comments.length }})</span>
          </h4>

          <div class="space-y-2">
            <div
              v-for="c in selectedNote.comments"
              :key="c.id"
              class="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-gray-900">{{ c.author }} ({{ c.role }})</span>
                <span class="text-[10px] text-gray-400 font-mono">{{ c.date }}</span>
              </div>
              <p class="text-gray-700">{{ c.text }}</p>
            </div>
          </div>

          <!-- Add comment -->
          <div class="flex items-center gap-2">
            <input
              v-model="newCommentText"
              type="text"
              placeholder="Add peer review feedback or approval remarks..."
              class="flex-1 px-4 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              @keydown.enter="handleAddComment"
            >
            <button
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
              @click="handleAddComment"
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
